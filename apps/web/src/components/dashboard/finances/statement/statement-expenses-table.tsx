'use client';

import React from 'react';
import { formatInrPrecise } from '@kalya/utils';
import type { StatementData } from './types';
import { Badge } from '@/components/ui/data-display/badge';

interface StatementExpensesTableProps {
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

function formatPaymentMode(mode: string): string {
  const map: Record<string, string> = {
    upi: 'UPI',
    phonepe: 'PhonePe',
    gpay: 'Google Pay',
    paytm: 'Paytm',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    cash: 'Cash',
    net_banking: 'Net Banking',
  };
  return map[mode?.toLowerCase()] || mode?.toUpperCase() || 'UPI';
}

export function StatementExpensesTable({ statement }: StatementExpensesTableProps) {
  const { expenses, kpis } = statement;

  return (
    <div className="flex flex-col gap-3 my-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="font-display text-body-md font-bold text-text-primary">
          Itemized Expense History
        </h3>
        <span className="text-caption text-text-muted font-body">
          Section 2 · {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'}
        </span>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-raised p-8 text-center text-caption text-text-muted font-body">
          No expenses recorded for the selected period ({statement.period.label}).
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm border-collapse font-body">
              <thead>
                <tr className="border-b border-border bg-surface-raised text-caption font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Date</th>
                  <th className="px-3.5 py-2.5">Description</th>
                  <th className="px-3.5 py-2.5">Category</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Payment Mode</th>
                  <th className="px-3.5 py-2.5 whitespace-nowrap">Bill Type</th>
                  <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Total Bill</th>
                  <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Amount Paid</th>
                  <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {expenses.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-surface-raised/60 transition-colors">
                    <td className="px-3.5 py-2.5 font-numeric text-caption text-text-secondary whitespace-nowrap">
                      {formatDisplayDate(item.date)}
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-text-primary">
                      {item.description}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-caption font-medium border border-border/80 bg-surface-raised">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.categoryColor || '#0d3e26' }}
                        />
                        <span className="text-text-primary">{item.categoryName}</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-caption text-text-muted whitespace-nowrap font-numeric">
                      {formatPaymentMode(item.paymentMethod)}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <Badge variant={item.isSplit ? 'warning' : 'subtle'} size="sm">
                        {item.isSplit ? 'Split Bill' : 'Personal'}
                      </Badge>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-numeric text-caption text-text-muted whitespace-nowrap">
                      {item.isSplit ? formatInrPrecise(item.totalBill) : '—'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-numeric font-bold text-text-primary whitespace-nowrap">
                      {formatInrPrecise(item.yourShare)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right text-caption text-text-secondary whitespace-nowrap">
                      <span className="text-[11px] font-medium text-text-muted">
                        {item.splitStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-primary-subtle/30 font-semibold text-text-primary">
                  <td colSpan={6} className="px-3.5 py-3 text-right text-body-sm font-medium">
                    Total Expenses ({expenses.length} {expenses.length === 1 ? 'item' : 'items'}):
                  </td>
                  <td className="px-3.5 py-3 text-right font-numeric text-body-md font-bold text-primary whitespace-nowrap">
                    {formatInrPrecise(kpis.totalExpenses)}
                  </td>
                  <td className="px-3.5 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
