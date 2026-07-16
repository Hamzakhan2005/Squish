import Header from "./Header";
import MetaList from "./MetaList";
import Link from "next/link";
import type { ToolMeta } from "@/lib/types";

export default function ToolPageShell({
  tool,
  children,
}: {
  tool: ToolMeta;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-28 sm:pt-36 px-5 sm:px-8 pb-10 border-b hairline">
        <Link
          href="/"
          className="font-mono-label text-xs text-paper-dim hover:text-paper"
        >
          ← All tools
        </Link>
        <h1 className="font-display leading-[0.9] text-[14vw] sm:text-6xl md:text-7xl mt-4">
          {tool.name}
        </h1>
        <p className="mt-4 max-w-md text-paper-dim text-sm sm:text-base">
          {tool.tagline}
        </p>
      </section>

      <section className="px-5 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
        <div>{children}</div>
        <div className="lg:pt-2">
          <MetaList
            rows={[
              { label: "Input", value: tool.inputLabel },
              { label: "Output", value: tool.outputLabel },
              { label: "Processing", value: "In your browser" },
              { label: "Upload", value: "None — fully local" },
            ]}
          />
        </div>
      </section>

      <div className="h-16" />
    </main>
  );
}
