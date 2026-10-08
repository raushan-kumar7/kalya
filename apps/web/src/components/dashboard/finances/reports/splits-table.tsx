'use client';

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  HandCoins,
  Receipt,
  Scale,
  Users,
  Wallet,
} from 'lucide-react';
import { formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/forms/button';
import { Badge } from '@/components/ui/data-display/badge';
import type { SplitFriendBalance, SplitReportTotals } from './types';

interface SplitBalancesTableProps {
  totals: SplitReportTotals;
  friendBalances: SplitFriendBalance[];
  isLoading?: boolean;
  onSelectFriend?: (friend: SplitFriendBalance) => void;
}

export function SplitBalancesTable({
  totals,
  friendBalances,
  isLoading,
  onSelectFriend,
}: SplitBalancesTableProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Splits KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Paid for Friends */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-text-secondary">Paid for Friends</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <HandCoins className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-1.5 font-numeric text-body-xl font-bold text-text-primary tracking-tight">
            {formatInr(totals.paidForFriends)}
          </div>
          <p className="mt-1 text-caption text-text-muted">Total you fronted in group bills</p>
        </div>

        {/* Owed to You */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-text-secondary">Owed to You</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-subtle text-success">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-1.5 font-numeric text-body-xl font-bold text-success tracking-tight">
            {formatInr(totals.owedToYou)}
          </div>
          <p className="mt-1 text-caption text-text-muted">Outstanding receivables from friends</p>
        </div>

        {/* You Owe */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-text-secondary">You Owe</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-danger-subtle text-danger">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-1.5 font-numeric text-body-xl font-bold text-danger tracking-tight">
            {formatInr(totals.youOwe)}
          </div>
          <p className="mt-1 text-caption text-text-muted">Pending payables to friends</p>
        </div>

        {/* Total Settled */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-text-secondary">Settled Volume</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-subtle text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-1.5 font-numeric text-body-xl font-bold text-text-primary tracking-tight">
            {formatInr(totals.settled)}
          </div>
          <p className="mt-1 text-caption text-text-muted">Successfully closed split dues</p>
        </div>
      </div>

      {/* Per-Friend Balances Table */}
      <div className="rounded-xl border border-border bg-surface shadow-card p-4">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display text-body-md font-semibold text-text-primary">
              Friend-by-Friend Ledger
            </h3>
            <p className="text-caption text-text-muted">
              Running balances and pending dues with contacts
            </p>
          </div>
        </header>

        {friendBalances.length === 0 ? (
          <div className="py-8 text-center text-text-muted">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium text-body-sm">No split expenses found for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-0">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  <th className="py-2.5 px-3">Friend</th>
                  <th className="py-2.5 px-3 text-right">Paid for Them</th>
                  <th className="py-2.5 px-3 text-right">Owes You</th>
                  <th className="py-2.5 px-3 text-right">You Owe</th>
                  <th className="py-2.5 px-3 text-right">Net Balance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {friendBalances.map((f) => {
                  const owesYou = f.netBalance > 0;
                  const youOwe = f.netBalance < 0;
                  const settled = f.netBalance === 0;

                  return (
                    <tr
                      key={f.contactId}
                      onClick={() => onSelectFriend?.(f)}
                      className="hover:bg-surface-raised/80 group cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary-subtle border border-primary/20 flex items-center justify-center font-bold text-caption text-primary shrink-0">
                          {f.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                          {f.name}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-numeric text-text-primary">
                        {formatInr(f.totalPaidForThem)}
                      </td>

                      <td className="py-3 px-3 text-right font-numeric font-medium text-success">
                        {f.owedToYou > 0 ? formatInr(f.owedToYou) : '—'}
                      </td>

                      <td className="py-3 px-3 text-right font-numeric font-medium text-danger">
                        {f.youOwe > 0 ? formatInr(f.youOwe) : '—'}
                      </td>

                      <td className="py-3 px-3 text-right font-numeric font-bold">
                        {settled ? (
                          <span className="text-text-muted">₹0</span>
                        ) : owesYou ? (
                          <span className="text-success">+{formatInr(f.netBalance)}</span>
                        ) : (
                          <span className="text-danger">-{formatInr(Math.abs(f.netBalance))}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {settled ? (
                          <Badge variant="success" size="sm">
                            Settled
                          </Badge>
                        ) : (
                          <Badge variant={owesYou ? 'default' : 'warning'} size="sm">
                            {f.pendingTransactionsCount} pending
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-2 text-center">
                        <ExternalLink className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
