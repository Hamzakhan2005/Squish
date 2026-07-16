"use client";

import { useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { imagesToPdf } from "@/lib/engines/jpgToPdf";
import { formatBytes, downloadBlob, uid } from "@/lib/utils";

const tool = getTool("jpg-to-pdf")!;

interface QueuedImage {
  id: string;
  file: File;
}

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<QueuedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const addFiles = (incoming: File[]) => {
    setResult(null);
    setFiles((prev) => [...prev, ...incoming.map((file) => ({ id: uid(), file }))]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  const build = async () => {
    setBusy(true);
    try {
      const blob = await imagesToPdf(files.map((f) => f.file));
      setResult({ blob, name: "squished.pdf" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone
        accept={tool.accepts}
        multiple
        onFiles={addFiles}
        label="drop several to stack them in order"
      />

      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            {files.map((f, idx) => (
              <div
                key={f.id}
                className="relative w-24 h-24 border hairline rounded-lg overflow-hidden group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(f.file)}
                  alt={f.file.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-ink/80 text-paper text-[10px] font-mono-label px-1.5 py-0.5 rounded">
                  {idx + 1}
                </span>
                <button
                  onClick={() => removeFile(f.id)}
                  className="absolute inset-0 bg-ink/70 text-paper text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <p className="mt-3 font-mono-label text-xs text-paper-dim">
            {files.length} image{files.length > 1 ? "s" : ""} · {formatBytes(totalSize)}{" "}
            total
          </p>

          <div className="mt-5">
            <PrimaryButton onClick={build} disabled={busy}>
              {busy ? "Building…" : "Build PDF"}
            </PrimaryButton>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 flex items-center gap-4 border hairline rounded-xl px-4 py-3 max-w-sm">
          <div className="flex-1">
            <p className="text-sm">{result.name}</p>
            <p className="font-mono-label text-[10px] text-squish mt-1">
              {formatBytes(result.blob.size)}
            </p>
          </div>
          <button
            onClick={() => downloadBlob(result.blob, result.name)}
            className="font-mono-label text-xs px-3 py-2 rounded-full bg-paper text-ink hover:bg-squish hover:text-paper transition-colors"
          >
            Download
          </button>
        </div>
      )}
    </ToolPageShell>
  );
}
