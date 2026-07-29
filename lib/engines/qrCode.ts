"use client";

import QRCode from "qrcode";

export async function generateQrCode(
  text: string
): Promise<{ blob: Blob; name: string }> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, text, {
    width: 800,
    margin: 2,
    color: { dark: "#0D0D0D", light: "#F2EFE9" },
  });
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png"
    );
  });
  return { blob, name: "squish-qr-code.png" };
}
