"use client";

import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { renderPdfPages, canvasToBlob } from "./pdfjs";

/**
 * "Compress" a PDF by rasterizing each page to a JPEG at the chosen
 * quality and rebuilding the PDF from those images. This is the same
 * trick desktop tools use for image-heavy PDFs (scans, exports from
 * design tools, phone photos turned into PDF) — it can shrink those
 * drastically, since the original is often carrying full-resolution
 * images the PDF never needed. It won't do much for a PDF that's already
 * mostly text, since there's very little image weight to squeeze out.
 */
export async function compressPdf(
  file: File,
  quality: number,
  onProgress?: (done: number, total: number) => void
): Promise<{ blob: Blob; name: string }> {
  // Wide range on purpose: at the low end this renders pages at well
  // under their original size and re-encodes hard, which is what gets a
  // 90MB scan-heavy PDF down to a few MB. At the high end it stays close
  // to lossless for people who just want a *little* off the size.
  const scale = 0.5 + quality * 1.5; // 0.1 -> ~0.65x, 0.95 -> ~1.93x
  const jpegQuality = Math.max(0.15, Math.min(0.85, 0.15 + quality * 0.65));
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
    const jpegBlob = await canvasToBlob(canvas, "image/jpeg", jpegQuality);
    const dataUrl = await blobToDataUrl(jpegBlob);
    doc.addImage(
      dataUrl,
      "JPEG",
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      "FAST"
    );
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

/**
 * Rebuild a PDF keeping only the given page indices (0-based), in the
 * given order — powers both "delete some pages" and "reorder pages."
 */
export async function organizePdf(
  file: File,
  order: number[]
): Promise<{ blob: Blob; name: string }> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, order);
  pages.forEach((p) => out.addPage(p));
  const result = await out.save();
  return {
    blob: new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" }),
    name: file.name.replace(/\.pdf$/i, "-organized.pdf"),
  };
}

/** Stamp a diagonal, repeated text watermark across every page. */
export async function watermarkPdf(
  file: File,
  text: string
): Promise<{ blob: Blob; name: string }> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const size = 36;

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    // Tile the watermark diagonally so it's hard to crop out.
    const stepX = textWidth + 80;
    const stepY = 160;
    for (let y = -height; y < height * 2; y += stepY) {
      for (let x = -width; x < width * 2; x += stepX) {
        page.drawText(text, {
          x,
          y,
          size,
          font,
          color: rgb(0.9, 0.16, 0),
          opacity: 0.15,
          rotate: degrees(45),
        });
      }
    }
  }

  const result = await doc.save();
  return {
    blob: new Blob([result.buffer as ArrayBuffer], { type: "application/pdf" }),
    name: file.name.replace(/\.pdf$/i, "-watermarked.pdf"),
  };
}

/** Combine multiple PDFs into one, in the order given. */
export async function mergePdfs(
  files: File[]
): Promise<{ blob: Blob; name: string }> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  const bytes = await merged.save();
  return {
    blob: new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }),
    name: "merged.pdf",
  };
}

/** Split a PDF into one single-page PDF per page, bundled as a .zip. */
export async function splitPdf(
  file: File
): Promise<{ blob: Blob; name: string }> {
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
