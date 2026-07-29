// pdf.js does its heavy lifting on a background thread (a "worker"), so the
// main tab doesn't freeze while a big PDF renders. This file is the one
// place that wires the worker up, so every tool imports from here instead
// of repeating the setup.
"use client";

let configured = false;

export async function getPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!configured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    configured = true;
  }
  return pdfjsLib;
}

/** Render every page of a PDF File to a canvas and return the canvases. */
export async function renderPdfPages(
  file: File,
  scale: number,
  onProgress?: (done: number, total: number) => void
): Promise<HTMLCanvasElement[]> {
  const pdfjs = await getPdfjs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const canvases: HTMLCanvasElement[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    canvases.push(canvas);
    onProgress?.(i, doc.numPages);
  }

  return canvases;
}

/** Page count only — doesn't render anything, so it's cheap even on big PDFs. */
export async function getPdfPageCount(file: File): Promise<number> {
  const pdfjs = await getPdfjs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  return doc.numPages;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality
    );
  });
}
