"use client";

import { PDFDocument, degrees } from "pdf-lib";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { renderPdfPages, canvasToBlob } from "./pdfjs";

/**
 * "Compress" a PDF by rasterizing each page to a JPEG at the chosen
 * quality and rebuilding the PDF from those images. This is the same
 * trick desktop tools use for image-heavy PDFs (scans, exports from
 * design tools) — it won't shrink a PDF that's already just text.
 */
export async function compressPdf(
  file: File,
  quality: number,
  onProgress?: (done: number, total: number) => void
): Promise<{ blob: Blob; name: string }> {
  const scale = 1 + quality; // 0.1 - 1.0 -> 1.1x - 2x render resolution
  const canvases = await renderPdfPages(file, scale, onProgress);

  let doc: jsPDF | null = null;
  for (const canvas of canvases) {
    const orientation = canvas.width >= canvas.height ? "l" : "p";
    if (!doc) {
      doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
    } else {
      doc.addPage("a4", orientation);
    }
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const jpegBlob = await canvasToBlob(canvas, "image/jpeg", Math.max(quality, 0.35));
    const dataUrl = await blobToDataUrl(jpegBlob);
    doc.addImage(dataUrl, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
  }

  const blob = doc!.output("blob");
  const name = file.name.replace(/\.pdf$/i, "-squished.pdf");
  return { blob, name };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Combine multiple PDFs into one, in the order given. */
export async function mergePdfs(files: File[]): Promise<{ blob: Blob; name: string }> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  const bytes = await merged.save();
  return { blob: new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }), name: "merged.pdf" };
}

/** Split a PDF into one single-page PDF per page, bundled as a .zip. */
export async function splitPdf(file: File): Promise<{ blob: Blob; name: string }> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, "");

  for (let i = 0; i < src.getPageCount(); i++) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(src, [i]);
    out.addPage(page);
    const pageBytes = await out.save();
    zip.file(`${baseName}-page-${i + 1}.pdf`, pageBytes);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return { blob: zipBlob, name: `${baseName}-pages.zip` };
}

/** Rotate every page of a PDF by a fixed angle. */
export async function rotatePdf(
  file: File,
  degreesAmount: 90 | 180 | 270
): Promise<{ blob: Blob; name: string }> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + degreesAmount) % 360));
  }
  const out = await doc.save();
  return {
    blob: new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" }),
    name: file.name.replace(/\.pdf$/i, "-rotated.pdf"),
  };
}
