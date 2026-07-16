"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  accept: string;
  multiple: boolean;
  onFiles: (files: File[]) => void;
  label: string;
}

export default function FileDropzone({ accept, multiple, onFiles, label }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(multiple ? Array.from(list) : [list[0]]);
    },
    [multiple, onFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer border-2 border-dashed rounded-2xl px-6 py-16 text-center transition-colors ${
        dragging ? "border-squish bg-squish/10" : "hairline hover:border-paper-dim"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="font-display text-2xl sm:text-3xl">DROP FILES HERE</p>
      <p className="mt-2 text-paper-dim text-sm">
        or click to browse — {label}
      </p>
    </div>
  );
}
