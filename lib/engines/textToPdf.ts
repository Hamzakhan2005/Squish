"use client";

import { jsPDF } from "jspdf";

export function textToPdf(text: string): { blob: Blob; name: string } {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  const lineHeight = 16;

  doc.setFont("Helvetica");
  doc.setFontSize(12);

  const paragraphs = text.split("\n");
  let y = margin;

  for (const para of paragraphs) {
    const lines = para.length ? doc.splitTextToSize(para, usableWidth) : [""];
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }

  return { blob: doc.output("blob"), name: "squish-document.pdf" };
}
