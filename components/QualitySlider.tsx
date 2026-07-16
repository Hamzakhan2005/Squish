"use client";

export default function QualitySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const label = value < 0.34 ? "Smaller file" : value < 0.7 ? "Balanced" : "Higher quality";
  return (
    <div className="max-w-sm">
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono-label text-xs text-paper-dim">Quality</span>
        <span className="font-mono-label text-xs text-squish">{label}</span>
      </div>
      <input
        type="range"
        min={0.1}
        max={0.95}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#e72a00]"
      />
    </div>
  );
}
