"use client";

import { useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { textToPdf } from "@/lib/engines/textToPdf";
import { downloadBlob, formatBytes } from "@/lib/utils";

const tool = getTool("text-to-pdf")!;

export default function TextToPdfPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(
    null
  );

  const build = () => {
    if (!text.trim()) return;
    setResult(textToPdf(text));
  };

  return (
    <ToolPageShell tool={tool}>
      <label className="block max-w-xl">
        <span className="font-mono-label text-xs text-paper-dim">
          Your text
        </span>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setResult(null);
          }}
          placeholder="Paste or type anything…"
          rows={10}
          className="mt-1 block w-full bg-ink-raised border hairline rounded-lg px-3 py-3 text-sm outline-none focus:border-squish resize-y"
        />
      </label>

      <div className="mt-4">
        <PrimaryButton onClick={build} disabled={!text.trim()}>
          Build PDF
        </PrimaryButton>
      </div>

      {result && (
        <div className="mt-6 flex items-center gap-4 border hairline rounded-xl px-4 py-3 max-w-sm">
          <div className="flex-1">
            <p className="text-sm">{result.name}</p>
            <p className="font-mono-label text-[10px] text-squish mt-1">
              {formatBytes(result.blob.size)}
            </p>
          </div>
          <button
            onClick={() => downloadBlob(result.blob, result.name)}
            className="font-mono-label text-xs px-3 py-2 rounded-full bg-paper text-ink hover:bg-squish hover:text-paper transition-colors"
          >
            Download
          </button>
        </div>
      )}
    </ToolPageShell>
  );
}
