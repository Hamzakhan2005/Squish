"use client";

import { useCallback, useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { convertImageFormat, type ImageFormat } from "@/lib/engines/imageOps";

const tool = getTool("convert-image")!;

const formats: { label: string; value: ImageFormat }[] = [
  { label: "JPG", value: "image/jpeg" },
  { label: "PNG", value: "image/png" },
  { label: "WEBP", value: "image/webp" },
];

export default function ConvertImagePage() {
  const [target, setTarget] = useState<ImageFormat>("image/png");

  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void) => {
      onProgress(30);
      const result = await convertImageFormat(file, target);
      onProgress(100);
      return result;
    },
    [target]
  );

  const { items, addFiles, remove, runAll, running } = useToolQueue(processor);
  const hasQueued = items.some((i) => i.status === "queued");

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone accept={tool.accepts} multiple onFiles={addFiles} label="drop as many as you like" />

      <div className="mt-6">
        <span className="font-mono-label text-xs text-paper-dim">Convert to</span>
        <div className="flex gap-2 mt-2">
          {formats.map((f) => (
            <button
              key={f.value}
              onClick={() => setTarget(f.value)}
              className={`px-4 py-2 rounded-full font-mono-label text-xs border hairline transition-colors ${
                target === f.value
                  ? "bg-squish text-paper border-squish"
                  : "text-paper-dim hover:text-paper"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Converting…" : "Convert"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
