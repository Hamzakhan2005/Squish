"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-40 flex items-start justify-between pointer-events-none">
      <Link
        href="/"
        className="pointer-events-auto px-4 py-2 rounded-full bg-ink/85 backdrop-blur-sm border hairline font-display text-lg sm:text-xl tracking-tight text-paper"
      >
        SQUISH<span className="text-squish">.</span>
      </Link>

      <div className="pointer-events-auto flex items-stretch rounded-full overflow-hidden bg-ink/85 backdrop-blur-sm border hairline">
        <span className="hidden sm:flex items-center px-3 font-mono-label text-[10px] text-paper-dim">
          runs on your device
        </span>
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-paper text-ink flex items-center justify-center font-display text-lg">
          S.
        </div>
      </div>
    </header>
  );
}
