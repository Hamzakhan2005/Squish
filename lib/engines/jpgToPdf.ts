"use client";

import { jsPDF } from "jspdf";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Combine one or more images into a single PDF, one image per page. */
export async function imagesToPdf(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<Blob> {
  let doc: jsPDF | null = null;

  for (let i = 0; i < files.length; i++) {
    const img = await loadImage(files[i]);
    const isLandscape = img.width >= img.height;
    const orientation = isLandscape ? "l" : "p";

    if (!doc) {
      doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
    } else {
      doc.addPage("a4", orientation);
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fit the image inside the page with a small margin, preserving aspect ratio.
    const margin = 24;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const drawW = img.width * ratio;
    const drawH = img.height * ratio;
    const x = (pageWidth - drawW) / 2;
    const y = (pageHeight - drawH) / 2;

    const format = files[i].type === "image/png" ? "PNG" : "JPEG";
    doc.addImage(img.src, format, x, y, drawW, drawH, undefined, "FAST");
    URL.revokeObjectURL(img.src);
    onProgress?.(i + 1, files.length);
  }

  return doc!.output("blob");
}
