export default function MetaList({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <dl className="text-xs sm:text-sm space-y-1.5">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-4 justify-between sm:justify-start">
          <dt className="font-mono-label text-paper-dim w-32 shrink-0 text-left sm:text-right">
            {row.label}
          </dt>
          <dd className="text-paper text-left">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
