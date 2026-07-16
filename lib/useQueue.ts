"use client";

import { useCallback, useState } from "react";
import type { QueueItem } from "./types";
import { uid } from "./utils";

type Processor = (
  file: File,
  onProgress: (pct: number) => void
) => Promise<{ blob: Blob; name: string }>;

export function useToolQueue(process: Processor) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);

  const addFiles = useCallback((files: File[]) => {
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: uid(),
        file,
        status: "queued" as const,
        progress: 0,
      })),
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const reset = useCallback(() => setItems([]), []);

  const runAll = useCallback(async () => {
    setRunning(true);
    // Snapshot current queued ids so we process exactly what's pending.
    const pending = items.filter((i) => i.status === "queued").map((i) => i.id);

    for (const id of pending) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "processing" } : i))
      );
      const target = items.find((i) => i.id === id)!;

      try {
        const { blob, name } = await process(target.file, (pct) => {
          setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, progress: pct } : i))
          );
        });
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "done",
                  progress: 100,
                  resultBlob: blob,
                  resultName: name,
                  resultSize: blob.size,
                }
              : i
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "error",
                  errorMessage: err instanceof Error ? err.message : "Failed",
                }
              : i
          )
        );
      }
    }

    setRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, process]);

  return { items, addFiles, remove, reset, runAll, running };
}
