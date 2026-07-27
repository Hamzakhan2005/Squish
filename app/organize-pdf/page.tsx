"use client";

import { useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { getPdfPageCount } from "@/lib/engines/pdfjs";
import { organizePdf } from "@/lib/engines/pdfOps";
import { downloadBlob, formatBytes } from "@/lib/utils";

const tool = getTool("organize-pdf")!;

interface PageRow {
  originalIndex: number; // 0-based index into the source PDF
  label: number; // 1-based, for display — stays fixed even after reordering
}

export default function OrganizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(
    null
  );

  const onFiles = async ([f]: File[]) => {
    setFile(f);
    setResult(null);
    setLoading(true);
    try {
      const count = await getPdfPageCount(f);
      setRows(
        Array.from({ length: count }, (_, i) => ({
          originalIndex: i,
          label: i + 1,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (originalIndex: number) => {
    setRows((prev) => prev.filter((r) => r.originalIndex !== originalIndex));
  };

  const save = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const order = rows.map((r) => r.originalIndex);
      const res = await organizePdf(file, order);
      setResult(res);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPageShell tool={tool}>
      {!file && (
        <FileDropzone
          accept={tool.accepts}
          multiple={false}
          onFiles={onFiles}
          label="one PDF at a time"
        />
      )}

      {loading && <p className="text-sm text-paper-dim">Reading page count…</p>}

      {!loading && rows.length > 0 && (
        <div>
          <p className="font-mono-label text-xs text-paper-dim mb-3">
            {rows.length} page{rows.length !== 1 ? "s" : ""} — reorder or
            remove, then save
          </p>
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {rows.map((row, idx) => (
              <div
                key={row.originalIndex}
                className="flex items-center gap-3 border hairline rounded-lg px-3 py-2"
              >
                <span className="font-mono-label text-xs text-paper-dim w-16">
                  Page {row.label}
                </span>
                <span className="flex-1" />
                <button
                  onClick={() => move(idx, -1)}
                  className="text-paper-dim hover:text-paper px-1"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  className="text-paper-dim hover:text-paper px-1"
                >
                  ↓
                </button>
                <button
                  onClick={() => remove(row.originalIndex)}
                  className="text-paper-dim hover:text-squish px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <PrimaryButton onClick={save} disabled={busy || rows.length === 0}>
              {busy ? "Saving…" : "Save changes"}
            </PrimaryButton>
            <button
              onClick={() => {
                setFile(null);
                setRows([]);
                setResult(null);
              }}
              className="font-mono-label text-xs text-paper-dim hover:text-paper"
            >
              Choose a different PDF
            </button>
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
