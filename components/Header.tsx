"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-start justify-between pointer-events-none">
      <Link
        href="/"
        className="pointer-events-auto px-5 py-4 font-display text-xl sm:text-2xl tracking-tight"
      >
        SQUISH<span className="text-squish">.</span>
      </Link>

      <div className="pointer-events-auto flex items-stretch">
        <span className="hidden sm:flex items-center px-3 font-mono-label text-[10px] text-paper-dim border-l border-b hairline">
          runs on your device
        </span>
        <div className="w-10 h-10 bg-paper text-ink flex items-center justify-center font-display text-lg">
          S.
        </div>
      </div>
    </header>
  );
}
