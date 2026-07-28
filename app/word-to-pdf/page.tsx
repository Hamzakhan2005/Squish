"use client";

import { useCallback } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { wordToPdf } from "@/lib/engines/docOps";

const tool = getTool("word-to-pdf")!;

export default function WordToPdfPage() {
  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void) => {
      onProgress(30);
      const result = await wordToPdf(file);
      onProgress(100);
      return result;
    },
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
        label="one .docx at a time"
      />

      <p className="mt-4 max-w-md text-xs text-paper-dim">
        Handles headings, paragraphs, lists, bold/italic, and simple images
        well. Complex tables or exact page breaks from the original document may
        reflow slightly — it&apos;s re-laying the content out, not replaying
        Word&apos;s own layout engine.
      </p>

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
