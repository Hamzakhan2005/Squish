"use client";

import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, PageBreak } from "docx";
import { getPdfjs } from "./pdfjs";

/** Extract each PDF page's text, in reading order, as an array of lines. */
async function extractPdfLines(
  file: File,
  onProgress?: (done: number, total: number) => void
): Promise<{ pages: string[][]; pageCount: number }> {
  const pdfjs = await getPdfjs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[][] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const lines: string[] = [];

    let line = "";
    for (const item of content.items as { str: string; hasEOL?: boolean }[]) {
      line += item.str;
      if (item.hasEOL) {
        if (line.trim()) lines.push(line.trim());
        line = "";
      }
    }
    if (line.trim()) lines.push(line.trim());

    pages.push(lines);
    onProgress?.(i, doc.numPages);
  }

  return { pages, pageCount: doc.numPages };
}

/**
 * Pull the text out of a PDF and lay it into a .docx as plain paragraphs.
 *
 * Honest limitation: this preserves READING ORDER and line breaks, not the
 * original visual layout — columns, tables, and images are not
 * reconstructed. It's the same trade-off every browser-only PDF-to-Word
 * tool makes; anything claiming pixel-perfect layout recovery client-side
 * is either lying or shipping a much heavier ML layout model. It also can't
 * pull text out of a scanned/image-only PDF — there's no OCR step here.
 */
export async function pdfToWord(
  file: File,
  onProgress?: (done: number, total: number) => void
): Promise<{ blob: Blob; name: string }> {
  const { pages } = await extractPdfLines(file, onProgress);
  const paragraphs: Paragraph[] = [];

  pages.forEach((lines, pageIndex) => {
    lines.forEach((line) => {
      paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
    });
    if (pageIndex < pages.length - 1) {
      paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  const docxDoc = new Document({
    sections: [
      { children: paragraphs.length ? paragraphs : [new Paragraph("")] },
    ],
  });

  const blob = await Packer.toBlob(docxDoc);
  const name = file.name.replace(/\.pdf$/i, ".docx");
  return { blob, name };
}

/**
 * Same text extraction as PDF to Word, but out as a plain .txt file.
 * Same limitation: no OCR, so scanned/image-only PDFs yield nothing.
 */
export async function pdfToText(
  file: File,
  onProgress?: (done: number, total: number) => void
): Promise<{ blob: Blob; name: string }> {
  const { pages } = await extractPdfLines(file, onProgress);
  const text = pages.map((lines) => lines.join("\n")).join("\n\n");
  const blob = new Blob([text], { type: "text/plain" });
  return { blob, name: file.name.replace(/\.pdf$/i, ".txt") };
}

/**
 * Convert a .docx to PDF by turning it into HTML (via mammoth) and letting
 * jsPDF's html() renderer lay that out onto PDF pages.
 *
 * Honest limitation: this handles headings, paragraphs, lists, bold/italic,
 * and simple images fine. Complex table layouts, custom fonts, and precise
 * page breaks from the original Word doc are not guaranteed to match —
 * jsPDF is re-flowing HTML, not reproducing the .docx layout engine.
 */
export async function wordToPdf(
  file: File
): Promise<{ blob: Blob; name: string }> {
  const buffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });

  const container = document.createElement("div");
  container.style.width = "680px";
  container.style.padding = "0";
  container.style.fontFamily = "Helvetica, Arial, sans-serif";
  container.style.fontSize = "12px";
  container.style.lineHeight = "1.5";
  container.style.color = "#111";
  container.innerHTML = html;
  // Off-screen but rendered, so html2canvas (used internally by jsPDF.html) can measure it.
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  await new Promise<void>((resolve, reject) => {
    doc.html(container, {
      x: 36,
      y: 36,
      width: 523, // A4 width (595pt) minus margins
      windowWidth: 680,
      autoPaging: "text",
      callback: () => resolve(),
      html2canvas: { scale: 0.85 },
    });
    // jsPDF's html() callback is the source of truth; this catch just
    // guards against it never firing.
    setTimeout(() => reject(new Error("Conversion timed out")), 20000);
  }).finally(() => {
    document.body.removeChild(container);
  });

  const blob = doc.output("blob");
  const name = file.name.replace(/\.docx?$/i, ".pdf");
  return { blob, name };
}
