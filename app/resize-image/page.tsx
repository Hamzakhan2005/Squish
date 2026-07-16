"use client";

import { useCallback, useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { resizeImage } from "@/lib/engines/imageOps";

const tool = getTool("resize-image")!;

export default function ResizeImagePage() {
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(768);

  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void) => {
      onProgress(30);
      const result = await resizeImage(file, width, height);
      onProgress(100);
      return result;
    },
    [width, height]
  );

  const { items, addFiles, remove, runAll, running } = useToolQueue(processor);
  const hasQueued = items.some((i) => i.status === "queued");

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone accept={tool.accepts} multiple onFiles={addFiles} label="applies the same size to every file" />

      <div className="mt-6 flex items-end gap-4">
        <label className="block">
          <span className="font-mono-label text-xs text-paper-dim">Width (px)</span>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="mt-1 block w-28 bg-ink-raised border hairline rounded-lg px-3 py-2 text-sm outline-none focus:border-squish"
          />
        </label>
        <span className="pb-2 text-paper-dim">×</span>
        <label className="block">
          <span className="font-mono-label text-xs text-paper-dim">Height (px)</span>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="mt-1 block w-28 bg-ink-raised border hairline rounded-lg px-3 py-2 text-sm outline-none focus:border-squish"
          />
        </label>
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Resizing…" : "Resize"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
