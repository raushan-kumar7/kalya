'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import { ChartTooltip } from './chart-tooltip';
import { chartColor } from './theme';
import type { DonutDatum } from './types';

export interface DonutChartProps {
  data: DonutDatum[];
  height?: number;
  innerRadius?: number | string;
  /** small caption in the centre, e.g. "Spent" */
  centerLabel?: string;
  /** big value in the centre; defaults to the sum of all slices */
  centerValue?: string;
  valueFormatter?: (v: number) => string;
  /** list with value + % next to / under the donut */
  showLegend?: boolean;
  /** layout orientation: legend on the right or centered chart with legend below */
  legendPosition?: 'right' | 'bottom';
  className?: string;
}

/** Donut or Pie for slices: buckets, net-worth split. */
export function DonutChart({
  data,
  height = 220,
  innerRadius = '65%',
  centerLabel,
  centerValue,
  valueFormatter = formatInr,
  showLegend = true,
  legendPosition = 'right',
  className,
}: DonutChartProps) {
  const rows = data.map((d, i) => ({ ...d, color: d.color ?? chartColor(i) }));
  const total = rows.reduce((a, r) => a + (Number(r.value) || 0), 0);
  const pctOf = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
  const isDonut = Boolean(innerRadius && innerRadius !== 0 && innerRadius !== '0%');
  const isBottom = legendPosition === 'bottom';

  return (
    <div
      className={cn(
        'flex items-center gap-4',
        isBottom ? 'flex-col justify-center' : 'flex-col sm:flex-row',
        className
      )}
    >
      <div
        className={cn('relative w-full', isBottom ? 'max-w-65 mx-auto' : 'sm:w-1/2')}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius="90%"
              paddingAngle={rows.length > 1 ? 2 : 0}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {rows.map((r) => (
                <Cell key={r.name} fill={r.color} />
              ))}
            </Pie>
            <RechartsTooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
          </PieChart>
        </ResponsiveContainer>

        {isDonut && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerLabel && (
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {centerLabel}
              </span>
            )}
            <span className="font-numeric text-body-md font-bold text-text-primary">
              {centerValue ?? valueFormatter(total)}
            </span>
          </div>
        )}
      </div>

      {showLegend && (
        <TooltipProvider>
          <ul className={cn('w-full space-y-2', !isBottom && 'sm:w-1/2')}>
            {rows.map((r) => (
              <li key={r.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-default items-center gap-2 text-body-sm">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="truncate text-text-secondary">{r.name}</span>
                      <span className="ml-auto font-numeric font-medium text-text-primary">
                        {valueFormatter(r.value)}
                      </span>
                      <span className="w-10 text-right font-numeric text-caption text-text-muted">
                        {pctOf(r.value)}%
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side={isBottom ? 'top' : 'left'}>
                    {r.name}: {valueFormatter(r.value)} ({pctOf(r.value)}% of total)
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      )}
    </div>
  );
}
