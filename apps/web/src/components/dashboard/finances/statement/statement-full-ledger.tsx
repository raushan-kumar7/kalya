'use client';

import React from 'react';
import { formatInrPrecise } from '@kalya/utils';
import type { StatementData } from './types';
import { ArrowDownRight } from 'lucide-react';

interface StatementFullLedgerProps {
  statement: StatementData;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const mIdx = parseInt(month, 10) - 1;
      return `${parseInt(day, 10)} ${months[mIdx] || month} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function StatementFullLedger({ statement }: StatementFullLedgerProps) {
  const { incomes, kpis } = statement;

  if (statement.meta.scope !== 'full' || incomes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 my-6 page-break-inside-avoid">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="font-display text-body-md font-bold text-text-primary flex items-center gap-2">
          <ArrowDownRight className="h-4 w-4 text-success" />
          <span>Income Streams &amp; Deposits</span>
        </h3>
        <span className="text-caption text-text-muted font-body">
          Section 3 · {incomes.length} {incomes.length === 1 ? 'deposit' : 'deposits'}
        </span>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm border-collapse font-body">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-caption font-semibold text-text-secondary uppercase tracking-wider">
                <th className="px-3.5 py-2.5 whitespace-nowrap">Credit Date</th>
                <th className="px-3.5 py-2.5">Income Source / Description</th>
                <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Salary</th>
                <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Other Inflow</th>
                <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Total Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {incomes.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-surface-raised/60 transition-colors">
                  <td className="px-3.5 py-2.5 font-numeric text-caption text-text-secondary whitespace-nowrap">
                    {formatDisplayDate(item.date)}
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-text-primary">{item.source}</td>
                  <td className="px-3.5 py-2.5 text-right font-numeric text-caption text-text-muted whitespace-nowrap">
                    {item.salary > 0 ? formatInrPrecise(item.salary) : '—'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-numeric text-caption text-text-muted whitespace-nowrap">
                    {item.other > 0 ? formatInrPrecise(item.other) : '—'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-numeric font-bold text-success whitespace-nowrap">
                    {formatInrPrecise(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-success-subtle/30 font-semibold text-text-primary">
                <td colSpan={4} className="px-3.5 py-3 text-right text-body-sm font-medium">
                  Total Income Received:
                </td>
                <td className="px-3.5 py-3 text-right font-numeric text-body-md font-bold text-success whitespace-nowrap">
                  {formatInrPrecise(kpis.totalIncome)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
