export type SeriesType = 'bar' | 'line' | 'area';

export interface CartesianSeries<T> {
  /** key in each data row */
  key: keyof T & string;
  label: string;
  /** default: 'bar' */
  type?: SeriesType;
  color?: string;
  /** same stackId => stacked */
  stackId?: string;
  dashed?: boolean;
}

export interface ReferenceLineConfig {
  y: number;
  label?: string;
  color?: string;
}

export interface DonutDatum {
  name: string;
  value: number;
  color?: string;
}
