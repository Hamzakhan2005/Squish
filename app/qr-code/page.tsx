"use client";

import { useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { generateQrCode } from "@/lib/engines/qrCode";
import { downloadBlob } from "@/lib/utils";

const tool = getTool("qr-code")!;

export default function QrCodePage() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ blob: Blob; url: string } | null>(
    null
  );

  const generate = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { blob } = await generateQrCode(text.trim());
      setPreview({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPageShell tool={tool}>
      <label className="block max-w-md">
        <span className="font-mono-label text-xs text-paper-dim">
          Text or URL
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          rows={3}
          className="mt-1 block w-full bg-ink-raised border hairline rounded-lg px-3 py-2 text-sm outline-none focus:border-squish resize-none"
        />
      </label>

      <div className="mt-4">
        <PrimaryButton onClick={generate} disabled={busy || !text.trim()}>
          {busy ? "Generating…" : "Generate"}
        </PrimaryButton>
      </div>

      {preview && (
        <div className="mt-6 flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt="Generated QR code"
            className="w-40 h-40 rounded-lg border hairline"
          />
          <button
            onClick={() => downloadBlob(preview.blob, "squish-qr-code.png")}
            className="font-mono-label text-xs px-4 py-2 rounded-full bg-paper text-ink hover:bg-squish hover:text-paper transition-colors"
          >
            Download PNG
          </button>
        </div>
      )}
    </ToolPageShell>
  );
}
