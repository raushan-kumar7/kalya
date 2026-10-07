import { useCallback } from 'react';
import { formatMonthLabel, getCurrentMonthString, shiftMonth } from '@kalya/utils';
import { useFinancesStore } from '@/stores/finances';

export function useMonthNavigation() {
  const selectedMonth = useFinancesStore((s) => s.selectedMonth);
  const setSelectedMonth = useFinancesStore((s) => s.setSelectedMonth);

  const currentMonth = getCurrentMonthString();

  const goToPrevMonth = useCallback(
    () => setSelectedMonth(shiftMonth(selectedMonth, -1)),
    [selectedMonth, setSelectedMonth]
  );

  const goToNextMonth = useCallback(
    () => setSelectedMonth(shiftMonth(selectedMonth, 1)),
    [selectedMonth, setSelectedMonth]
  );

  const goToCurrentMonth = useCallback(
    () => setSelectedMonth(currentMonth),
    [currentMonth, setSelectedMonth]
  );

  return {
    selectedMonth,
    monthLabel: formatMonthLabel(selectedMonth),
    isCurrentMonth: selectedMonth === currentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
}
