"use client";

import { useState } from "react";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import PrimaryButton from "@/components/PrimaryButton";
import CropBox, { type CropRect } from "@/components/CropBox";
import { getTool } from "@/lib/registry";
import { cropImage, rotateImage, loadImageDimensions } from "@/lib/engines/imageOps";
import { formatBytes, downloadBlob } from "@/lib/utils";

const tool = getTool("crop-image")!;

const MAX_W = 640;
const MAX_H = 520;

function fitDisplaySize(naturalW: number, naturalH: number) {
  const cap = typeof window !== "undefined" ? Math.min(MAX_W, window.innerWidth - 64) : MAX_W;
  const scale = Math.min(1, cap / naturalW, MAX_H / naturalH);
  return { width: Math.round(naturalW * scale), height: Math.round(naturalH * scale) };
}

function centeredRect(w: number, h: number): CropRect {
  const width = w * 0.8;
  const height = h * 0.8;
  return { x: (w - width) / 2, y: (h - height) / 2, width, height };
}

export default function CropImagePage() {
  const [workingFile, setWorkingFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [display, setDisplay] = useState<{ width: number; height: number } | null>(null);
  const [rect, setRect] = useState<CropRect | null>(null);
  const [rotating, setRotating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const loadWorkingFile = async (f: File) => {
    const dims = await loadImageDimensions(f);
    const disp = fitDisplaySize(dims.width, dims.height);
    setNatural(dims);
    setDisplay(disp);
    setRect(centeredRect(disp.width, disp.height));
    setImgUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const onFiles = async ([f]: File[]) => {
    setResult(null);
    setWorkingFile(f);
    await loadWorkingFile(f);
  };

  const rotate = async (deg: 90 | 270) => {
    if (!workingFile) return;
    setRotating(true);
    try {
      const { blob } = await rotateImage(workingFile, deg);
      const newFile = new File([blob], workingFile.name, { type: blob.type });
      setWorkingFile(newFile);
      await loadWorkingFile(newFile);
      setResult(null);
    } finally {
      setRotating(false);
    }
  };

  const doCrop = async () => {
    if (!workingFile || !rect || !natural || !display) return;
    setBusy(true);
    try {
      const scaleX = natural.width / display.width;
      const scaleY = natural.height / display.height;
      const res = await cropImage(workingFile, {
        x: rect.x * scaleX,
        y: rect.y * scaleY,
        width: rect.width * scaleX,
        height: rect.height * scaleY,
      });
      setResult(res);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setWorkingFile(null);
    setImgUrl(null);
    setNatural(null);
    setDisplay(null);
    setRect(null);
    setResult(null);
  };

  return (
    <ToolPageShell tool={tool}>
      {!workingFile && (
        <FileDropzone accept={tool.accepts} multiple={false} onFiles={onFiles} label="one image at a time" />
      )}

      {workingFile && imgUrl && display && rect && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => rotate(270)}
              disabled={rotating}
              className="font-mono-label text-xs px-4 py-2 rounded-full border hairline hover:border-squish hover:text-squish transition-colors disabled:opacity-50"
            >
              ↺ Rotate left
            </button>
            <button
              onClick={() => rotate(90)}
              disabled={rotating}
              className="font-mono-label text-xs px-4 py-2 rounded-full border hairline hover:border-squish hover:text-squish transition-colors disabled:opacity-50"
            >
              ↻ Rotate right
            </button>
          </div>

          <div
            className="relative bg-ink-raised rounded-xl overflow-hidden border hairline select-none"
            style={{ width: display.width, height: display.height }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt="Image to crop"
              draggable={false}
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
            />
            <CropBox rect={rect} bounds={display} onChange={setRect} />
          </div>

          <p className="mt-3 text-xs text-paper-dim">
            Drag inside the box to move it, or drag any edge/corner to resize from that side.
          </p>

          <div className="mt-4 flex gap-3">
            <PrimaryButton onClick={doCrop} disabled={busy}>
              {busy ? "Cropping…" : "Crop"}
            </PrimaryButton>
            <button
              onClick={reset}
              className="font-mono-label text-xs text-paper-dim hover:text-paper"
            >
              Choose a different image
            </button>
          </div>
        </div>
      )}

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