/** Chart colours come from the CSS tokens in globals.css, so light/dark switch automatically. */
export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const;

export const chartColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length];

/** Same meaning = same colour on every chart. */
export const SEMANTIC = {
  income: 'var(--chart-1)',
  expense: 'var(--chart-5)',
  savings: 'var(--chart-2)',
  neutral: 'var(--chart-3)',
  muted: 'var(--text-muted)',
  grid: 'var(--border)',
} as const;

export const STATUS_COLORS = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  primary: 'var(--primary)',
} as const;
