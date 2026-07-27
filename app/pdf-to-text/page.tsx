"use client";

import { useCallback } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { pdfToText } from "@/lib/engines/docOps";

const tool = getTool("pdf-to-text")!;

export default function PdfToTextPage() {
  const processor = useCallback(
    (file: File, onProgress: (pct: number) => void) =>
      pdfToText(file, (done, total) => onProgress((done / total) * 100)),
    []
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

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Extracting…" : "Extract text"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
