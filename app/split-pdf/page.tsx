"use client";

import { useCallback } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { splitPdf } from "@/lib/engines/pdfOps";

const tool = getTool("split-pdf")!;

export default function SplitPdfPage() {
  const processor = useCallback(async (file: File, onProgress: (pct: number) => void) => {
    onProgress(30);
    const result = await splitPdf(file);
    onProgress(100);
    return result;
  }, []);

  const { items, addFiles, remove, runAll, running } = useToolQueue(processor);
  const hasQueued = items.some((i) => i.status === "queued");

  return (
    <ToolPageShell tool={tool}>
      <FileDropzone accept={tool.accepts} multiple={false} onFiles={addFiles} label="one PDF at a time" />

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Splitting…" : "Split"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
