"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ToolMeta } from "@/lib/types";

const categoryLabel: Record<ToolMeta["category"], string> = {
  convert: "Convert",
  compress: "Compress",
  edit: "Edit",
};

export default function ToolCard({ tool }: { tool: ToolMeta }) {
  const [hovered, setHovered] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Link href={`/${tool.slug}`} className="group block">
      <motion.div
        ref={ref}
        className="relative aspect-[4/3] border-b border-r hairline flex items-center justify-center overflow-hidden bg-ink"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMove}
        initial="idle"
        animate={hovered ? "hover" : "idle"}
      >
        <motion.div
          className="absolute inset-0"
          variants={{ idle: { opacity: 0 }, hover: { opacity: 1 } }}
          transition={{ duration: 0.25 }}
          style={{ background: tool.hoverBg }}
        />

        {/* The "pushed back" press effect: text shrinks and settles down
            slightly on hover, like it's being pressed into the card. */}
        <motion.span
          className="relative text-[13vw] sm:text-4xl md:text-5xl leading-none text-center px-4"
          variants={{
            idle: { color: "var(--paper)", scale: 1, y: 0 },
            hover: { color: tool.hoverText, scale: 0.86, y: 4 },
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ fontFamily: tool.cardFont }}
        >
          {tool.name}
        </motion.span>

        <motion.div
          className="absolute left-3 bottom-3 font-mono-label text-[10px]"
          variants={{
            idle: { opacity: 0, y: 6 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.2 }}
          style={{ color: tool.hoverText }}
        >
          {categoryLabel[tool.category]}
        </motion.div>

        <motion.div
          className="absolute right-3 top-3 px-2 py-1 bg-ink font-mono-label text-[10px]"
          variants={{
            idle: { opacity: 0, y: -6 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.2 }}
          style={{ color: "var(--paper)" }}
        >
          {tool.inputLabel} → {tool.outputLabel}
        </motion.div>

        {/* Cursor-follow tag, same idea as the reference site's
            "Font: Hand-drawn" label that trails the pointer. */}
        {hovered && (
          <div
            className="absolute z-10 pointer-events-none px-2.5 py-1 bg-ink text-paper font-mono-label text-[10px] rounded whitespace-nowrap"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(18px, 6px)",
            }}
          >
            Font: {tool.cardFontLabel}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
