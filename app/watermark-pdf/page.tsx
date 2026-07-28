"use client";

import { useCallback, useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { watermarkPdf } from "@/lib/engines/pdfOps";

const tool = getTool("watermark-pdf")!;

export default function WatermarkPdfPage() {
  const [text, setText] = useState("SQUISH");

  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void) => {
      onProgress(30);
      const result = await watermarkPdf(file, text || "SQUISH");
      onProgress(100);
      return result;
    },
    [text]
  );

  const { items, addFiles, remove, runAll, running } = useToolQueue(processor);
  const hasQueued = items.some((i) => i.status === "queued");

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone
        accept={tool.accepts}
        multiple={false}
        onFiles={addFiles}
        label="one PDF at a time"
      />

      <label className="block mt-6 max-w-sm">
        <span className="font-mono-label text-xs text-paper-dim">
          Watermark text
        </span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. CONFIDENTIAL"
          className="mt-1 block w-full bg-ink-raised border hairline rounded-lg px-3 py-2 text-sm outline-none focus:border-squish"
        />
      </label>

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Stamping…" : "Add watermark"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
