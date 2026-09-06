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

const presets: { label: string; width: number; height: number }[] = [
  { label: "US / India Passport (2×2in, 600×600px)", width: 600, height: 600 },
  { label: "UK / EU Passport (35×45mm, 413×531px)", width: 413, height: 531 },
];

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

      <div className="mt-6">
        <span className="font-mono-label text-xs text-paper-dim">Presets</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setWidth(p.width);
                setHeight(p.height);
              }}
              className={`px-4 py-2 rounded-full font-mono-label text-xs border hairline transition-colors ${
                width === p.width && height === p.height
                  ? "bg-squish text-paper border-squish"
                  : "text-paper-dim hover:text-paper"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

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