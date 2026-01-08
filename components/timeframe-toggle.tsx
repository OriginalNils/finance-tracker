// components/timeframe-toggle.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation';

const ranges = [
  { label: '7T', value: '7D' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: 'YTD', value: 'YTD' },
  { label: '1J', value: '1Y' },
];

const intervals = [
  { label: 'Tag', value: 'day' },
  { label: 'Woche', value: 'week' },
  { label: 'Monat', value: 'month' },
];

export function TimeframeToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentRange = searchParams.get('range') || '7D';
  const currentInterval = searchParams.get('interval') || 'day';

  const updateParams = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, val);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 items-end">
      {/* Zeitraum Auswahl */}
      <div className="flex p-1 bg-muted/20 border border-border/40 rounded-xl">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => updateParams('range', r.value)}
            className={`px-3 py-1 text-[9px] font-black transition-all rounded-lg ${
              currentRange === r.value ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Intervall Auswahl */}
      <div className="flex p-1 bg-muted/10 border border-border/20 rounded-lg">
        {intervals.map((i) => (
          <button
            key={i.value}
            onClick={() => updateParams('interval', i.value)}
            className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest transition-all rounded-md ${
              currentInterval === i.value ? 'bg-zinc-700 text-white' : 'text-muted-foreground/60 hover:text-foreground'
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}