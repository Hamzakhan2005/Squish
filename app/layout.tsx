import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Squish — convert, compress, done",
  description:
    "JPG to PDF, PDF to JPG, image and PDF compression, merging, splitting and more. Everything runs in your browser — files never leave your device.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
