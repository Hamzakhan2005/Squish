"use client";

export default function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="font-mono-label text-sm px-6 py-3 rounded-full bg-squish text-paper disabled:bg-ink-line disabled:text-paper-dim transition-colors hover:bg-[#ff3300] disabled:hover:bg-ink-line"
    >
      {children}
    </button>
  );
}
