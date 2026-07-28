export default function ToolNotes({ notes }: { notes?: string[] }) {
  if (!notes || notes.length === 0) return null;
  return (
    <div className="mb-6 border hairline rounded-xl px-4 py-3 max-w-xl">
      <p className="font-mono-label text-[10px] text-paper-dim mb-2">
        Good to know
      </p>
      <ul className="space-y-1.5">
        {notes.map((note, i) => (
          <li key={i} className="text-sm text-paper-dim flex gap-2">
            <span className="text-squish">·</span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
