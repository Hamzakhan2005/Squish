"use client";

import JSZip from "jszip";
import { renderPdfPages, canvasToBlob } from "./pdfjs";

/**
 * Render every page of a PDF to a JPG. If there's more than one page,
 * the pages are bundled into a .zip so it's a single download.
 */
export async function pdfToJpg(
  file: File,
  quality: number,
  onProgress?: (done: number, total: number) => void
): Promise<{ blob: Blob; name: string }> {
  const scale = 1.5 + quality * 1.5; // higher quality => render at higher resolution
  const canvases = await renderPdfPages(file, scale, onProgress);
  const baseName = file.name.replace(/\.pdf$/i, "");

  if (canvases.length === 1) {
    const blob = await canvasToBlob(canvases[0], "image/jpeg", quality);
    return { blob, name: `${baseName}.jpg` };
  }

  const zip = new JSZip();
  for (let i = 0; i < canvases.length; i++) {
    const blob = await canvasToBlob(canvases[i], "image/jpeg", quality);
    zip.file(`${baseName}-page-${i + 1}.jpg`, blob);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return { blob: zipBlob, name: `${baseName}-pages.zip` };
}
