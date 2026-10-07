'use client';

import { formatInr } from '@kalya/utils';
import { tooltipSurfaceClass } from '@/components/ui/overlays/tooltip';
import { cn } from '@/libs/utils';

interface Props {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  valueFormatter?: (v: number) => string;
  labelFormatter?: (l: string | number) => string;
}

/**
 * Recharts tooltip content. Positioned by recharts (not Radix), but it reuses the exact
 * surface style of ui/overlays/tooltip so every hint in the app looks the same.
 * Usage: <Tooltip content={<ChartTooltip />} />
 */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = formatInr,
  labelFormatter,
}: Props) {
  if (!active || !payload?.length) return null;
  const title = labelFormatter && label !== undefined ? labelFormatter(label) : label;

  return (
    <div className={cn(tooltipSurfaceClass, 'min-w-32')}>
      {title !== undefined && title !== '' && (
        <div className="mb-1 font-display text-on-primary/80">{title}</div>
      )}
      <div className="space-y-0.5">
        {payload.map((p, i) => (
          <div key={`${p.dataKey ?? p.name}-${i}`} className="flex items-center gap-2">
            {/* ring keeps dark series (e.g. chart-1) visible on the green surface */}
            <span
              className="h-2 w-2 shrink-0 rounded-full ring-1 ring-on-primary/60"
              style={{ backgroundColor: p.color ?? p.payload?.fill ?? p.payload?.color }}
            />
            <span className="text-on-primary/80">{p.name}</span>
            <span className="ml-auto pl-4 font-numeric font-semibold">
              {valueFormatter(Number(p.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
