'use client';

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltip } from './chart-tooltip';
import { formatCompactInr, formatInr } from '@kalya/utils';
import { SEMANTIC, chartColor } from './theme';
import type { CartesianSeries, ReferenceLineConfig } from './types';

export interface CartesianChartProps<T extends Record<string, any>> {
  data: T[];
  xKey: keyof T & string;
  series: CartesianSeries<T>[];
  height?: number;
  /** 'vertical' = horizontal bars (ranked lists such as top categories) */
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  showLegend?: boolean;
  showYAxis?: boolean;
  xFormatter?: (v: any) => string;
  /** axis ticks (compact) */
  axisFormatter?: (v: number) => string;
  /** tooltip values (full) */
  valueFormatter?: (v: number) => string;
  referenceLines?: ReferenceLineConfig[];
  barRadius?: number;
  /** width of the category axis in 'vertical' layout */
  categoryAxisWidth?: number;
}

const axisTick = { fontSize: 11, fill: 'var(--text-muted)' };

/**
 * One generic chart for bar / line / area / combo / stacked / horizontal-bar.
 * Choose the shape per series: series={[{ key:'income', type:'bar' }, { key:'savings', type:'line' }]}
 */
export function CartesianChart<T extends Record<string, any>>({
  data,
  xKey,
  series,
  height = 260,
  layout = 'horizontal',
  showGrid = true,
  showLegend = true,
  showYAxis = true,
  xFormatter,
  axisFormatter = formatCompactInr,
  valueFormatter = formatInr,
  referenceLines,
  barRadius = 4,
  categoryAxisWidth = 100,
}: CartesianChartProps<T>) {
  const isVertical = layout === 'vertical';
  const gradId = (k: string) => `grad-${k}`;
  // Recharts v3 types dataKey against the row type; with a generic T that fails to compile.
  // Internally treat rows as loose records and keys as plain strings (the public API stays typed).
  const rows = data as Record<string, any>[];
  const xDataKey: string = xKey;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={rows}
        layout={layout}
        margin={{ top: 8, right: 8, bottom: 0, left: isVertical ? 0 : -8 }}
      >
        <defs>
          {series
            .filter((s) => s.type === 'area')
            .map((s, i) => {
              const c = s.color ?? chartColor(series.indexOf(s) + i * 0);
              return (
                <linearGradient key={s.key} id={gradId(s.key)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
        </defs>

        {showGrid && (
          <CartesianGrid
            stroke={SEMANTIC.grid}
            strokeDasharray="3 3"
            vertical={isVertical}
            horizontal={!isVertical}
          />
        )}

        {isVertical ? (
          <>
            <XAxis
              type="number"
              tick={axisTick}
              tickFormatter={axisFormatter}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey={xDataKey}
              tick={axisTick}
              tickFormatter={xFormatter}
              width={categoryAxisWidth}
              axisLine={false}
              tickLine={false}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xDataKey}
              tick={axisTick}
              tickFormatter={xFormatter}
              axisLine={false}
              tickLine={false}
            />
            {showYAxis && (
              <YAxis
                tick={axisTick}
                tickFormatter={axisFormatter}
                axisLine={false}
                tickLine={false}
                width={48}
              />
            )}
          </>
        )}

        <Tooltip
          cursor={{ fill: 'var(--surface-raised)', opacity: 0.6 }}
          content={<ChartTooltip valueFormatter={valueFormatter} labelFormatter={xFormatter} />}
        />
        {showLegend && series.length > 1 && (
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        )}

        {referenceLines?.map((r) => (
          <ReferenceLine
            key={`${r.y}-${r.label}`}
            {...(isVertical ? { x: r.y } : { y: r.y })}
            stroke={r.color ?? SEMANTIC.muted}
            strokeDasharray="4 4"
            label={{
              value: r.label,
              fontSize: 10,
              fill: 'var(--text-muted)',
              position: 'insideTopRight',
            }}
          />
        ))}

        {series.map((s, i) => {
          const color = s.color ?? chartColor(i);
          const type = s.type ?? 'bar';

          if (type === 'line') {
            return (
              <Line
                key={s.key}
                dataKey={s.key as string}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? '5 5' : undefined}
                dot={false}
                activeDot={{ r: 4 }}
                type="monotone"
              />
            );
          }
          if (type === 'area') {
            return (
              <Area
                key={s.key}
                dataKey={s.key as string}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradId(s.key)})`}
                stackId={s.stackId}
                type="monotone"
              />
            );
          }
          return (
            <Bar
              key={s.key}
              dataKey={s.key as string}
              name={s.label}
              fill={color}
              stackId={s.stackId}
              radius={isVertical ? [0, barRadius, barRadius, 0] : [barRadius, barRadius, 0, 0]}
              maxBarSize={36}
            />
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
