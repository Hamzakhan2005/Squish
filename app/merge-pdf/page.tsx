"use client";

import { useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { mergePdfs } from "@/lib/engines/pdfOps";
import { formatBytes, downloadBlob, uid } from "@/lib/utils";

const tool = getTool("merge-pdf")!;

export default function MergePdfPage() {
  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const addFiles = (incoming: File[]) => {
    setResult(null);
    setFiles((prev) => [...prev, ...incoming.map((file) => ({ id: uid(), file }))]);
  };

  const move = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const merge = async () => {
    setBusy(true);
    try {
      const { blob, name } = await mergePdfs(files.map((f) => f.file));
      setResult({ blob, name });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone accept={tool.accepts} multiple onFiles={addFiles} label="drop them in the order you want" />

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-3 border hairline rounded-xl px-4 py-3">
              <span className="font-mono-label text-xs text-paper-dim w-5">{idx + 1}</span>
              <span className="flex-1 text-sm truncate">{f.file.name}</span>
              <span className="font-mono-label text-[10px] text-paper-dim">
                {formatBytes(f.file.size)}
              </span>
              <button onClick={() => move(idx, -1)} className="text-paper-dim hover:text-paper px-1">↑</button>
              <button onClick={() => move(idx, 1)} className="text-paper-dim hover:text-paper px-1">↓</button>
              <button onClick={() => remove(f.id)} className="text-paper-dim hover:text-squish px-1">✕</button>
            </div>
          ))}

          <div className="mt-4">
            <PrimaryButton onClick={merge} disabled={busy || files.length < 2}>
              {busy ? "Merging…" : "Merge"}
            </PrimaryButton>
            {files.length < 2 && (
              <p className="mt-2 text-xs text-paper-dim">Add at least two PDFs to merge.</p>
            )}
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
