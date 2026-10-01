'use client';

import * as React from 'react';

export type TableDensity = 'compact' | 'normal' | 'relaxed';

export interface TableConfig {
  defaultPageSize: number;
  pageSizeOptions: number[];
  density: TableDensity;
  setDensity: (density: TableDensity) => void;
  showColumnFilters: boolean;
  setShowColumnFilters: (show: boolean | ((prev: boolean) => boolean)) => void;
}

const TableContext = React.createContext<TableConfig | undefined>(undefined);

export interface TableProviderProps {
  children: React.ReactNode;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  defaultDensity?: TableDensity;
}

export function TableProvider({
  children,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  defaultDensity = 'normal',
}: TableProviderProps) {
  const [density, setDensity] = React.useState<TableDensity>(defaultDensity);
  const [showColumnFilters, setShowColumnFilters] = React.useState<boolean>(false);

  const value = React.useMemo<TableConfig>(
    () => ({
      defaultPageSize,
      pageSizeOptions,
      density,
      setDensity,
      showColumnFilters,
      setShowColumnFilters,
    }),
    [defaultPageSize, pageSizeOptions, density, showColumnFilters]
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTableConfig(): TableConfig {
  const context = React.useContext(TableContext);
  if (!context) {
    return {
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50, 100],
      density: 'normal',
      setDensity: () => {},
      showColumnFilters: false,
      setShowColumnFilters: () => {},
    };
  }
  return context;
}
