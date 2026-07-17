import type { Metadata } from "next";
import "./globals.css";
import { fontVariables, anton } from "@/lib/fonts";
import Loader from "@/components/Loader";

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
      <body className={`${fontVariables} ${anton.variable}`}>
        <Loader />
        {children}
      </body>
    </html>
  );
}
