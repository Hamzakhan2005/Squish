"use client";

import { useRef } from "react";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type HandleType = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface Props {
  rect: CropRect;
  bounds: { width: number; height: number };
  onChange: (rect: CropRect) => void;
  minSize?: number;
}

/** Clamp a rect so it never resizes below minSize or moves outside bounds. */
function clampRect(r: CropRect, bounds: Props["bounds"], minSize: number): CropRect {
  let { x, y, width, height } = r;
  width = Math.max(minSize, Math.min(width, bounds.width));
  height = Math.max(minSize, Math.min(height, bounds.height));
  x = Math.max(0, Math.min(x, bounds.width - width));
  y = Math.max(0, Math.min(y, bounds.height - height));
  return { x, y, width, height };
}

const HANDLES: { type: HandleType; className: string }[] = [
  { type: "nw", className: "-left-1.5 -top-1.5 cursor-nwse-resize" },
  { type: "n", className: "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize" },
  { type: "ne", className: "-right-1.5 -top-1.5 cursor-nesw-resize" },
  { type: "e", className: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize" },
  { type: "se", className: "-right-1.5 -bottom-1.5 cursor-nwse-resize" },
  { type: "s", className: "left-1/2 -bottom-1.5 -translate-x-1/2 cursor-ns-resize" },
  { type: "sw", className: "-left-1.5 -bottom-1.5 cursor-nesw-resize" },
  { type: "w", className: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize" },
];

export default function CropBox({ rect, bounds, onChange, minSize = 32 }: Props) {
  const drag = useRef<{ type: HandleType; startX: number; startY: number; startRect: CropRect } | null>(
    null
  );

  const beginDrag = (type: HandleType) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { type, startX: e.clientX, startY: e.clientY, startRect: rect };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    let { x, y, width, height } = d.startRect;

    if (d.type === "move") {
      x = d.startRect.x + dx;
      y = d.startRect.y + dy;
    } else {
      if (d.type.includes("e")) width = d.startRect.width + dx;
      if (d.type.includes("s")) height = d.startRect.height + dy;
      if (d.type.includes("w")) {
        width = d.startRect.width - dx;
        x = d.startRect.x + dx;
      }
      if (d.type.includes("n")) {
        height = d.startRect.height - dy;
        y = d.startRect.y + dy;
      }
    }

    onChange(clampRect({ x, y, width, height }, bounds, minSize));
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      className="absolute border-2 border-squish cursor-move touch-none"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
      }}
      onPointerDown={beginDrag("move")}
      onPointerMove={onMove}
      onPointerUp={endDrag}
    >
      {/* Rule-of-thirds guide lines, purely visual */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-paper" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-paper" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-paper" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-paper" />
      </div>

      {HANDLES.map((h) => (
        <div
          key={h.type}
          onPointerDown={beginDrag(h.type)}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          className={`absolute w-4 h-4 bg-squish rounded-full border-2 border-paper touch-none ${h.className}`}
        />
      ))}
    </div>
  );
}