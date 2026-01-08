// components/monthly-net-worth-chart.tsx
'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function MonthlyNetWorthChart({ data }: { data: { month: string, balance: number }[] }) {
  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.1} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))', 
              borderRadius: '16px', 
              fontSize: '11px',
              fontWeight: 'bold' 
            }}
            formatter={(value: number) => [`${value.toLocaleString('de-DE')} €`, 'Net Worth']}
          />
          <Bar 
            dataKey="balance" 
            fill="hsl(var(--primary))" 
            radius={[10, 10, 10, 10]} 
            barSize={40}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}