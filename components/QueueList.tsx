"use client";

import type { QueueItem } from "@/lib/types";
import { formatBytes, downloadBlob } from "@/lib/utils";

export default function QueueList({
  items,
  onRemove,
}: {
  items: QueueItem[];
  onRemove?: (id: string) => void;
}) {
  if (items.length === 0) return null;

  const doneItems = items.filter((i) => i.status === "done");

  return (
    <div className="mt-6 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 border hairline rounded-xl px-4 py-3"
        >
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm">{item.file.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono-label text-[10px] text-paper-dim">
                {formatBytes(item.file.size)}
              </span>
              {item.status === "done" && item.resultSize !== undefined && (
                <>
                  <span className="text-paper-dim text-[10px]">→</span>
                  <span className="font-mono-label text-[10px] text-squish">
                    {formatBytes(item.resultSize)}
                    {item.resultSize < item.file.size &&
                      ` (${Math.round(
                        (1 - item.resultSize / item.file.size) * 100
                      )}% smaller)`}
                  </span>
                </>
              )}
              {item.status === "error" && (
                <span className="font-mono-label text-[10px] text-squish">
                  {item.errorMessage ?? "Failed"}
                </span>
              )}
            </div>
            {item.status === "processing" && (
              <div className="mt-2 h-1 bg-ink-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-squish transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
          </div>

          {item.status === "done" && item.resultBlob && (
            <button
              onClick={() => downloadBlob(item.resultBlob!, item.resultName!)}
              className="font-mono-label text-xs px-3 py-2 rounded-full bg-paper text-ink hover:bg-squish hover:text-paper transition-colors shrink-0"
            >
              Download
            </button>
          )}
          {item.status === "queued" && onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="font-mono-label text-xs text-paper-dim hover:text-paper shrink-0"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {doneItems.length > 1 && (
        <button
          onClick={() =>
            doneItems.forEach((i) => downloadBlob(i.resultBlob!, i.resultName!))
          }
          className="mt-2 font-mono-label text-xs px-4 py-2 rounded-full border hairline hover:border-squish hover:text-squish transition-colors"
        >
          Download all ({doneItems.length})
        </button>
      )}
    </div>
  );
}
