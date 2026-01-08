// components/category-distribution.tsx
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DataItem {
  name: string;
  value: number;
}

// Eine saubere, monochrome Palette für den Stealth-Look
const COLORS = [
  '#ffffff', // Akzent
  '#e4e4e7',
  '#a1a1aa',
  '#71717a',
  '#52525b',
  '#3f3f46',
];

export function CategoryDistribution({ data }: { data: DataItem[] }) {
  // Falls keine Daten vorhanden sind, zeigen wir einen "leeren" Platzhalter
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-2 opacity-30">
        <div className="w-24 h-24 rounded-full border-4 border-dashed border-muted" />
        <p className="text-[10px] font-black uppercase tracking-widest">Keine Ausgaben im Zeitraum</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={10}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={1000}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))', 
              borderRadius: '16px', 
              fontSize: '11px',
              fontWeight: 'bold',
            }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => `${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
          />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            formatter={(value) => (
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}