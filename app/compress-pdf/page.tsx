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

export default function CompressPdfPage() {
  const [quality, setQuality] = useState(0.6);

  const processor = useCallback(
    (file: File, onProgress: (pct: number) => void) =>
      compressPdf(file, quality, (done, total) => onProgress((done / total) * 100)),
    [quality]
  );

  const { items, addFiles, remove, runAll, running } = useToolQueue(processor);
  const hasQueued = items.some((i) => i.status === "queued");

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone accept={tool.accepts} multiple={false} onFiles={addFiles} label="one PDF at a time" />

      <div className="mt-6">
        <QualitySlider value={quality} onChange={setQuality} />
      </div>
      <p className="mt-2 max-w-sm text-xs text-paper-dim">
        Works best on image-heavy PDFs (scans, exports). Text-only PDFs are
        already small and may not shrink much further.
      </p>

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
