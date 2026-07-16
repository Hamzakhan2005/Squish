"use client";

import { useCallback, useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import QualitySlider from "@/components/QualitySlider";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { compressImage } from "@/lib/engines/imageOps";

const tool = getTool("compress-image")!;

export default function CompressImagePage() {
  const [quality, setQuality] = useState(0.7);

  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void) => {
      onProgress(30);
      const result = await compressImage(file, quality);
      onProgress(100);
      return result;
    },
    [quality]
  );

  const { items, addFiles, remove, runAll, running } = useToolQueue(processor);
  const hasQueued = items.some((i) => i.status === "queued");

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone
        accept={tool.accepts}
        multiple
        onFiles={addFiles}
        label="drop as many as you like"
      />

      <div className="mt-6">
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
