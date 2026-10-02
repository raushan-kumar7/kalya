'use client';

import { useCallback, useState } from 'react';

export interface UseTooltipReturn {
  hoveredItem: string | null;
  rotate: number;
  translateX: number;
  handleHover: (id: string | null) => void;
}

/**
 * Hook for coordinating floating animated tooltips across sidebar navigation items.
 */
export function useTooltip(): UseTooltipReturn {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleHover = useCallback((id: string | null) => {
    setHoveredItem(id);
  }, []);

  return {
    hoveredItem,
    rotate: 0,
    translateX: 0,
    handleHover,
  };
}
