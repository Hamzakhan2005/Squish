"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ToolMeta } from "@/lib/types";

const categoryLabel: Record<ToolMeta["category"], string> = {
  convert: "Convert",
  compress: "Compress",
  edit: "Edit",
};

export default function ToolCard({ tool }: { tool: ToolMeta }) {
  return (
    <Link href={`/${tool.slug}`} className="group block">
      <motion.div
        className="relative aspect-[4/3] border-b border-r hairline flex items-center justify-center overflow-hidden bg-ink"
        whileHover="hover"
        initial="idle"
      >
        <motion.div
          className="absolute inset-0"
          variants={{ idle: { opacity: 0 }, hover: { opacity: 1 } }}
          transition={{ duration: 0.25 }}
          style={{ background: "var(--squish)" }}
        />

        <motion.span
          className="relative font-display text-[13vw] sm:text-4xl md:text-5xl leading-none text-center px-4"
          variants={{
            idle: { color: "var(--paper)" },
            hover: { color: "var(--ink)" },
          }}
          transition={{ duration: 0.2 }}
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
          style={{ color: "var(--ink)" }}
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
      </motion.div>
    </Link>
  );
}
