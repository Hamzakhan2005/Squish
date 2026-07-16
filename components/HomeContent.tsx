"use client";

import { useMemo, useState } from "react";
import { tools } from "@/lib/registry";
import type { ToolCategory } from "@/lib/types";
import ToolCard from "./ToolCard";

const filters: { label: string; value: ToolCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Convert", value: "convert" },
  { label: "Compress", value: "compress" },
  { label: "Edit", value: "edit" },
];

export default function HomeContent() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ToolCategory | "all">("all");

  const visible = useMemo(() => {
    return tools.filter((t) => {
      const matchesFilter = filter === "all" || t.category === filter;
      const matchesQuery =
        query.trim() === "" ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.tagline.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  return (
    <>
      <section className="pt-28 sm:pt-36 pb-10 px-5 sm:px-8 border-b hairline">
        <h1 className="font-display leading-[0.9] text-[13vw] sm:text-7xl md:text-8xl">
          <span className="text-paper">CONVERT, COMPRESS,</span>
          <br />
          <span className="text-squish">SQUISH.</span>
        </h1>
        <p className="mt-6 max-w-lg text-paper-dim text-sm sm:text-base">
          Ten small tools for JPGs and PDFs. Everything runs right here in
          your browser — nothing you drop in ever leaves your device.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-l hairline">
          {visible.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
          {visible.length === 0 && (
            <div className="col-span-full py-24 text-center text-paper-dim font-body">
              No tool matches “{query}”.
            </div>
          )}
        </div>
      </section>

      <div className="h-24" />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl flex items-center gap-2 bg-ink-raised border hairline rounded-full px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a tool…"
          className="flex-1 bg-transparent outline-none px-3 text-sm placeholder:text-paper-dim"
        />
        <div className="hidden sm:flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono-label transition-colors ${
                filter === f.value
                  ? "bg-squish text-paper"
                  : "text-paper-dim hover:text-paper"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
