// components/trend-chart.tsx
'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function TrendChart({ data }: { data: { date: string, balance: number }[] }) {
  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.1} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9, fontWeight: 'bold' }}
            interval={data.length > 20 ? Math.floor(data.length / 5) : 0}
          />
          <YAxis 
            hide={false}
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 8 }}
            tickFormatter={(value) => `${value}€`}
            domain={['auto', 'auto']} // Skaliert automatisch um den Kontostand herum
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`, 'Kontostand']}
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#chartGradient)" 
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}