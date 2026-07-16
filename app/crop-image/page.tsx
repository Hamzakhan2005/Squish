"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import ToolPageShell from "@/components/ToolPageShell";
import FileDropzone from "@/components/FileDropzone";
import PrimaryButton from "@/components/PrimaryButton";
import { getTool } from "@/lib/registry";
import { cropImage } from "@/lib/engines/imageOps";
import { formatBytes, downloadBlob } from "@/lib/utils";

const tool = getTool("crop-image")!;

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CropImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const onFiles = (files: File[]) => {
    const f = files[0];
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setResult(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const doCrop = async () => {
    if (!file || !croppedArea) return;
    setBusy(true);
    try {
      const res = await cropImage(file, croppedArea);
      setResult(res);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPageShell tool={tool}>
      {!imageUrl && (
        <FileDropzone accept={tool.accepts} multiple={false} onFiles={onFiles} label="one image at a time" />
      )}

      {imageUrl && (
        <div>
          <div className="relative w-full h-[420px] bg-ink-raised rounded-2xl overflow-hidden border hairline">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="mt-4 max-w-sm">
            <span className="font-mono-label text-xs text-paper-dim">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#e72a00] mt-1"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <PrimaryButton onClick={doCrop} disabled={busy}>
              {busy ? "Cropping…" : "Crop"}
            </PrimaryButton>
            <button
              onClick={() => {
                setFile(null);
                setImageUrl(null);
                setResult(null);
              }}
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
