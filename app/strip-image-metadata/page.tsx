"use client";

import { useCallback } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import QueueList from "@/components/QueueList";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { useToolQueue } from "@/lib/useQueue";
import { stripImageMetadata } from "@/lib/engines/imageOps";

const tool = getTool("strip-image-metadata")!;

export default function StripImageMetadataPage() {
  const processor = useCallback(
    async (file: File, onProgress: (pct: number) => void) => {
      onProgress(30);
      const result = await stripImageMetadata(file);
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
        multiple
        onFiles={addFiles}
        label="drop as many as you like"
      />

      {items.length > 0 && (
        <div className="mt-5">
          <PrimaryButton onClick={runAll} disabled={running || !hasQueued}>
            {running ? "Cleaning…" : "Clean it"}
          </PrimaryButton>
        </div>
      )}

      <QueueList items={items} onRemove={remove} />
    </ToolPageShell>
  );
}
