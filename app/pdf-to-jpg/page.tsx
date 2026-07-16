"use client";

import { useCallback, useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import QualitySlider from "@/components/QualitySlider";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { pdfToJpg } from "@/lib/engines/pdfToJpg";

const tool = getTool("pdf-to-jpg")!;

export default function PdfToJpgPage() {
  const [quality, setQuality] = useState(0.8);

  const processor = useCallback(
    (file: File, onProgress: (pct: number) => void) =>
      pdfToJpg(file, quality, (done, total) => onProgress((done / total) * 100)),
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

      <div className="mt-6">
        <QualitySlider value={quality} onChange={setQuality} />
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Rendering…" : "Export pages"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
