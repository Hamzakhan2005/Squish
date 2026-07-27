"use client";

import { useCallback } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { pdfToWord } from "@/lib/engines/docOps";

const tool = getTool("pdf-to-word")!;

export default function PdfToWordPage() {
  const processor = useCallback(
    (file: File, onProgress: (pct: number) => void) =>
      pdfToWord(file, (done, total) => onProgress((done / total) * 100)),
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

      <p className="mt-4 max-w-md text-xs text-paper-dim">
        Pulls out the text in reading order and lays it into a .docx. Layout,
        columns, tables, and images from the original PDF aren&apos;t
        reconstructed — this is a real fix for &quot;I just need the words
        editable,&quot; not a layout-perfect rebuild.
      </p>

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Extracting…" : "Convert"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
