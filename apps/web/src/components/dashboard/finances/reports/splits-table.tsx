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
import { KpiCard, KpiGrid } from '@/components/shared';
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
      <KpiGrid cols={4}>
        <KpiCard
          title="Paid for Friends"
          value={formatInr(totals.paidForFriends)}
          hint="Total you fronted in group bills"
          icon={HandCoins}
          tone="default"
          isLoading={isLoading}
        />
        <KpiCard
          title="Owed to You"
          value={formatInr(totals.owedToYou)}
          hint="Outstanding receivables from friends"
          icon={ArrowDownLeft}
          tone="positive"
          isLoading={isLoading}
        />
        <KpiCard
          title="You Owe"
          value={formatInr(totals.youOwe)}
          hint="Pending payables to friends"
          icon={ArrowUpRight}
          tone="negative"
          isLoading={isLoading}
        />
        <KpiCard
          title="Settled Volume"
          value={formatInr(totals.settled)}
          hint="Successfully closed split dues"
          icon={CheckCircle2}
          tone="accent"
          isLoading={isLoading}
        />
      </KpiGrid>

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
