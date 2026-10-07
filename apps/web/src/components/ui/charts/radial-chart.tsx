'use client';

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

export interface RadialChartProps {
  value: number;
  /** default 100 */
  max?: number;
  /** caption under the number, e.g. "Savings rate" */
  label?: string;
  /** centre text; defaults to the rounded percentage */
  centerText?: string;
  color?: string;
  height?: number;
}

/** Single-value ring/gauge: savings rate, one goal's progress. */
export function RadialChart({
  value,
  max = 100,
  label,
  centerText,
  color = 'var(--chart-1)',
  height = 140,
}: RadialChartProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={[{ name: label ?? 'value', value: pct }]}
          innerRadius="75%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={10}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
          <RadialBar
            dataKey="value"
            cornerRadius={8}
            fill={color}
            background={{ fill: 'var(--surface-raised)' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-numeric text-body-md font-semibold text-text-primary">
          {centerText ?? `${Math.round(pct)}%`}
        </span>
        {label && <span className="text-caption text-text-muted">{label}</span>}
      </div>
    </div>
  );
}
