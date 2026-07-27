"use client";

import { useCallback, useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import QualitySlider from "@/components/QualitySlider";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { compressPdf } from "@/lib/engines/pdfOps";

const tool = getTool("compress-pdf")!;

const presets: { label: string; value: number }[] = [
  { label: "Extreme", value: 0.15 },
  { label: "Recommended", value: 0.5 },
  { label: "High quality", value: 0.85 },
];

export default function CompressPdfPage() {
  const [quality, setQuality] = useState(0.5);

  const processor = useCallback(
    (file: File, onProgress: (pct: number) => void) =>
      compressPdf(file, quality, (done, total) =>
        onProgress((done / total) * 100)
      ),
    [quality]
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

      <div className="mt-6 flex gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setQuality(p.value)}
            className={`px-4 py-2 rounded-full font-mono-label text-xs border hairline transition-colors ${
              Math.abs(quality - p.value) < 0.02
                ? "bg-squish text-paper border-squish"
                : "text-paper-dim hover:text-paper"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <QualitySlider value={quality} onChange={setQuality} />
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Squishing…" : "Squish it"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
