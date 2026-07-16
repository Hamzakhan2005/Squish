"use client";

import { useCallback, useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { rotatePdf } from "@/lib/engines/pdfOps";
import { rotateImage } from "@/lib/engines/imageOps";

const tool = getTool("rotate")!;
const angles: (90 | 180 | 270)[] = [90, 180, 270];

export default function RotatePage() {
  const [angle, setAngle] = useState<90 | 180 | 270>(90);

  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void) => {
      onProgress(30);
      const result =
        file.type === "application/pdf"
          ? await rotatePdf(file, angle)
          : await rotateImage(file, angle);
      onProgress(100);
      return result;
    },
    [angle]
  );

  const { items, addFiles, remove, runAll, running } = useToolQueue(processor);
  const hasQueued = items.some((i) => i.status === "queued");

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone accept={tool.accepts} multiple onFiles={addFiles} label="PDFs and images, mixed is fine" />

      <div className="mt-6">
        <span className="font-mono-label text-xs text-paper-dim">Rotate by</span>
        <div className="flex gap-2 mt-2">
          {angles.map((a) => (
            <button
              key={a}
              onClick={() => setAngle(a)}
              className={`px-4 py-2 rounded-full font-mono-label text-xs border hairline transition-colors ${
                angle === a ? "bg-squish text-paper border-squish" : "text-paper-dim hover:text-paper"
              }`}
            >
              {a}°
            </button>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Rotating…" : "Rotate"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
