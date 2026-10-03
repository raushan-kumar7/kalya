'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFinances } from '@/hooks/finances';
import {
  Button,
  Input,
  Badge,
  Progress,
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui';
import {
  AlertCircle,
  ArrowUpDown,
  Banknote,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  QrCode,
  Receipt,
  RotateCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  User,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { roundMoney } from '@kalya/utils';
import { resolveContactColor, getContactInitials } from './contacts/card';
import type { Expense, SettlementMethod, SplitContactMember, SplitExpense } from '@kalya/types';

// Re-export contacts module for backward compatibility
export * from './contacts';

export type UnsettledSplitItem = SplitExpense & {
  expense: Expense;
  member: SplitContactMember;
};

type FilterTab = 'all' | 'unpaid' | 'partial' | 'linked';
type SortOption = 'highest' | 'lowest' | 'newest' | 'oldest' | 'name';

function safeFormatDate(value?: string | null): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return String(value);
  } catch {
    return String(value);
  }
}

/**
 * Universal Balances & Settlements Dashboard View.
 * Displays real-time unsettled split shares, high-level metrics, filtering/sorting,
 * and an interactive payment settlement dialog.
 */
export function BalancesAndSettlements() {
  const {
    unsettledSplits,
    unsettledLoading,
    unsettledError,
    isPendingSplitsRefetching,
    refetchUnsettledSplits,
    settleSplit,
    isSettlingSplit,
    contacts,
  } = useFinances();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('highest');

  // Settlement Dialog state
  const [activeShareToSettle, setActiveShareToSettle] = useState<UnsettledSplitItem | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleMethod, setSettleMethod] = useState<SettlementMethod>('upi');
  const [settleError, setSettleError] = useState<string | null>(null);

  // High-level aggregate metrics
  const stats = useMemo(() => {
    let totalObligation = 0;
    let totalSettled = 0;
    let totalOutstanding = 0;
    let partialCount = 0;
    let unpaidCount = 0;
    let linkedCount = 0;
    const distinctMembers = new Set<string>();

    for (const item of unsettledSplits) {
      const owed = Number(item.amount ?? 0);
      const settled = Number(item.settled_amount ?? (item as any).settledAmount ?? 0);
      const remaining = Math.max(0, owed - settled);

      totalObligation += owed;
      totalSettled += settled;
      totalOutstanding += remaining;

      if (settled > 0 && settled < owed) {
        partialCount += 1;
      } else if (settled === 0) {
        unpaidCount += 1;
      }

      const isLinked = Boolean(item.member?.is_linked ?? (item.member as any)?.isLinked);
      if (isLinked) {
        linkedCount += 1;
      }

      if (item.split_member_id) {
        distinctMembers.add(item.split_member_id);
      }
    }

    const recoveryRate =
      totalObligation > 0 ? Math.min(100, Math.round((totalSettled / totalObligation) * 100)) : 0;

    return {
      totalObligation: roundMoney(totalObligation),
      totalSettled: roundMoney(totalSettled),
      totalOutstanding: roundMoney(totalOutstanding),
      uniquePeopleCount: distinctMembers.size,
      partialCount,
      unpaidCount,
      linkedCount,
      recoveryRate,
    };
  }, [unsettledSplits]);

  // Filtered and Sorted Shares
  const filteredShares = useMemo(() => {
    let list = [...(unsettledSplits as UnsettledSplitItem[])];

    // Filter by tab
    if (filterTab === 'unpaid') {
      list = list.filter((item) => {
        const settled = Number(item.settled_amount ?? (item as any).settledAmount ?? 0);
        return settled === 0;
      });
    } else if (filterTab === 'partial') {
      list = list.filter((item) => {
        const settled = Number(item.settled_amount ?? (item as any).settledAmount ?? 0);
        const owed = Number(item.amount ?? 0);
        return settled > 0 && settled < owed;
      });
    } else if (filterTab === 'linked') {
      list = list.filter((item) => {
        return Boolean(item.member?.is_linked ?? (item.member as any)?.isLinked);
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const memberName = item.member?.name?.toLowerCase() ?? '';
        const memberEmail = item.member?.email?.toLowerCase() ?? '';
        const memberPhone = item.member?.phone?.toLowerCase() ?? '';
        const expenseDesc = item.expense?.description?.toLowerCase() ?? '';
        return (
          memberName.includes(q) ||
          memberEmail.includes(q) ||
          memberPhone.includes(q) ||
          expenseDesc.includes(q)
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      const owedA = Number(a.amount ?? 0);
      const settledA = Number(a.settled_amount ?? (a as any).settledAmount ?? 0);
      const remainingA = Math.max(0, owedA - settledA);

      const owedB = Number(b.amount ?? 0);
      const settledB = Number(b.settled_amount ?? (b as any).settledAmount ?? 0);
      const remainingB = Math.max(0, owedB - settledB);

      switch (sortBy) {
        case 'highest':
          return remainingB - remainingA;
        case 'lowest':
          return remainingA - remainingB;
        case 'newest': {
          const dateA = new Date(a.expense?.date || 0).getTime();
          const dateB = new Date(b.expense?.date || 0).getTime();
          return dateB - dateA;
        }
        case 'oldest': {
          const dateA = new Date(a.expense?.date || 0).getTime();
          const dateB = new Date(b.expense?.date || 0).getTime();
          return dateA - dateB;
        }
        case 'name': {
          const nameA = a.member?.name || '';
          const nameB = b.member?.name || '';
          return nameA.localeCompare(nameB);
        }
        default:
          return 0;
      }
    });

    return list;
  }, [unsettledSplits, filterTab, searchQuery, sortBy]);

  // Handle opening settlement modal
  const handleOpenSettle = (share: UnsettledSplitItem) => {
    const owed = Number(share.amount ?? 0);
    const settled = Number(share.settled_amount ?? (share as any).settledAmount ?? 0);
    const remaining = Math.max(0, owed - settled);

    setActiveShareToSettle(share);
    setSettleAmount(String(roundMoney(remaining)));
    setSettleMethod('upi');
    setSettleError(null);
  };

  // Close settlement modal
  const handleCloseSettle = () => {
    setActiveShareToSettle(null);
    setSettleAmount('');
    setSettleError(null);
  };

  // Confirm settlement submission
  const handleConfirmSettle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeShareToSettle) return;

    const amountNum = parseFloat(settleAmount);
    const owed = Number(activeShareToSettle.amount ?? 0);
    const settled = Number(
      activeShareToSettle.settled_amount ?? (activeShareToSettle as any).settledAmount ?? 0
    );
    const remaining = Math.max(0, owed - settled);

    if (isNaN(amountNum) || amountNum <= 0) {
      setSettleError('Please enter a valid amount greater than ₹0');
      return;
    }

    if (amountNum > remaining + 0.01) {
      setSettleError(
        `Amount cannot exceed the remaining balance of ₹${remaining.toLocaleString('en-IN')}`
      );
      return;
    }

    setSettleError(null);

    try {
      await settleSplit(activeShareToSettle.id, {
        settled_amount: roundMoney(amountNum),
        settled_via: settleMethod,
        settled_at: new Date().toISOString(),
      });
      handleCloseSettle();
    } catch {
      // Error notifications are already handled by runAction in useFinances hook
    }
  };

  // Compute remaining for currently active dialog share
  const activeShareRemaining = useMemo(() => {
    if (!activeShareToSettle) return 0;
    const owed = Number(activeShareToSettle.amount ?? 0);
    const settled = Number(
      activeShareToSettle.settled_amount ?? (activeShareToSettle as any).settledAmount ?? 0
    );
    return Math.max(0, owed - settled);
  }, [activeShareToSettle]);

  return (
    <section className="flex h-full min-h-0 flex-col space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* 1. Header Section                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 shrink-0 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-display-md text-text-primary">
              Balances &amp; Settle
            </h2>
            <p className="text-body-sm text-text-secondary mt-1">
              {unsettledLoading ? (
                'Loading balances…'
              ) : unsettledError ? (
                <span className="text-danger">{unsettledError}</span>
              ) : unsettledSplits.length === 0 ? (
                'All caught up · No outstanding balances'
              ) : (
                `₹${stats.totalOutstanding.toLocaleString('en-IN')} outstanding across ${
                  unsettledSplits.length
                } ${unsettledSplits.length === 1 ? 'split share' : 'split shares'}`
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchUnsettledSplits()}
              disabled={unsettledLoading}
              className="gap-1.5"
            >
              <RotateCw
                size={15}
                className={cn('shrink-0', isPendingSplitsRefetching && 'animate-spin')}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Link href="/dashboard/splits/contacts">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Users size={15} className="shrink-0" />
                <span>Contacts ({contacts.length})</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. Hero Summary KPI Cards                                          */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Outstanding */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-muted">Total Outstanding</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-subtle text-warning">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-display text-display-xs font-bold text-text-primary">
                ₹{stats.totalOutstanding.toLocaleString('en-IN')}
              </div>
              <p className="text-caption text-text-secondary mt-1">
                Owed by {stats.uniquePeopleCount}{' '}
                {stats.uniquePeopleCount === 1 ? 'person' : 'people'}
              </p>
            </div>
          </div>

          {/* Card 2: Pending Shares */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-muted">Unsettled Shares</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-display text-display-xs font-bold text-text-primary">
                {unsettledSplits.length}
              </div>
              <p className="text-caption text-text-secondary mt-1">
                {stats.unpaidCount} unpaid · {stats.partialCount} partial
              </p>
            </div>
          </div>

          {/* Card 3: Recovered So Far */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-muted">Collected So Far</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-subtle text-success">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-display text-display-xs font-bold text-text-primary">
                ₹{stats.totalSettled.toLocaleString('en-IN')}
              </div>
              <p className="text-caption text-text-secondary mt-1">
                From ₹{stats.totalObligation.toLocaleString('en-IN')} total obligation
              </p>
            </div>
          </div>

          {/* Card 4: Recovery Progress */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-muted">Recovery Rate</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="font-display text-display-xs font-bold text-text-primary">
                  {stats.recoveryRate}%
                </div>
                <span className="text-caption text-text-muted">Settled</span>
              </div>
              <Progress value={stats.recoveryRate} className="h-1.5 bg-surface-raised" />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 3. Toolbar: Search + Filter Tabs + Sort Selector                   */}
        {/* ------------------------------------------------------------------ */}
        {!unsettledLoading && unsettledSplits.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface-raised p-1">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={cn(
                  'rounded-md px-3 py-1 text-caption font-medium transition-colors',
                  filterTab === 'all'
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                All ({unsettledSplits.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('unpaid')}
                className={cn(
                  'rounded-md px-3 py-1 text-caption font-medium transition-colors',
                  filterTab === 'unpaid'
                    ? 'bg-surface text-text-primary shadow-xs'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                Unpaid ({stats.unpaidCount})
              </button>

              {stats.partialCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterTab('partial')}
                  className={cn(
                    'rounded-md px-3 py-1 text-caption font-medium transition-colors',
                    filterTab === 'partial'
                      ? 'bg-surface text-text-primary shadow-xs'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  Partially Settled ({stats.partialCount})
                </button>
              )}

              {stats.linkedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterTab('linked')}
                  className={cn(
                    'rounded-md px-3 py-1 text-caption font-medium transition-colors',
                    filterTab === 'linked'
                      ? 'bg-surface text-text-primary shadow-xs'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  Linked Accounts ({stats.linkedCount})
                </button>
              )}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search person or expense…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leadingIcon={<Search size={15} />}
                  trailingIcon={
                    searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-text-muted hover:text-text-primary p-0.5"
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    ) : undefined
                  }
                  className="h-9 text-body-sm"
                />
              </div>

              {/* Sort Selector */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-caption font-medium text-text-secondary transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="highest">Highest balance</option>
                  <option value="lowest">Lowest balance</option>
                  <option value="newest">Newest expense</option>
                  <option value="oldest">Oldest expense</option>
                  <option value="name">Contact name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Content Area: Skeletons, Error, Empty, or Cards Grid            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1">
        {/* Loading Skeletons */}
        {unsettledLoading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex animate-pulse flex-col justify-between rounded-xl border border-border bg-surface p-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-surface-raised" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-28 rounded bg-surface-raised" />
                        <div className="h-3 w-20 rounded bg-surface-raised" />
                      </div>
                    </div>
                    <div className="h-6 w-16 rounded-full bg-surface-raised" />
                  </div>

                  <div className="rounded-lg bg-surface-raised/50 p-3 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-surface-raised" />
                    <div className="h-3 w-1/2 rounded bg-surface-raised" />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="h-6 w-24 rounded bg-surface-raised" />
                    <div className="h-2 w-full rounded-full bg-surface-raised" />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/50">
                  <div className="h-9 w-full rounded-lg bg-surface-raised" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Query Error State */}
        {!unsettledLoading && unsettledError && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-danger-subtle/30 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <h3 className="font-display text-body-lg font-semibold text-text-primary mt-3">
              Unable to load unsettled splits
            </h3>
            <p className="text-body-sm text-text-secondary mt-1 max-w-md">{unsettledError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchUnsettledSplits()}
              className="mt-4 gap-1.5"
            >
              <RotateCw size={14} />
              Try again
            </Button>
          </div>
        )}

        {/* Global Empty State (0 total unsettled items) */}
        {!unsettledLoading && !unsettledError && unsettledSplits.length === 0 && (
          <EmptyState
            icon={<CheckCircle2 className="h-8 w-8 text-success" />}
            title="All settled up!"
            description="You have no outstanding split expenses right now. Everyone is squared away and all balances are settled."
            action={
              <Link href="/dashboard/splits/contacts">
                <Button variant="outline" leadingIcon={<Users className="h-4 w-4" />}>
                  View Contacts Directory
                </Button>
              </Link>
            }
          />
        )}

        {/* Search / Filter Empty State */}
        {!unsettledLoading &&
          !unsettledError &&
          unsettledSplits.length > 0 &&
          filteredShares.length === 0 && (
            <EmptyState
              icon={<Search className="h-7 w-7 text-text-muted" />}
              title="No matching balances"
              description={
                searchQuery
                  ? `No split balances match "${searchQuery}". Try a different keyword or reset filters.`
                  : 'No split balances found under this filter.'
              }
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterTab('all');
                  }}
                  leadingIcon={<X className="h-4 w-4" />}
                >
                  Clear filters
                </Button>
              }
            />
          )}

        {/* Split Shares Grid */}
        {!unsettledLoading && !unsettledError && filteredShares.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {filteredShares.map((item) => {
              const owed = Number(item.amount ?? 0);
              const settled = Number(item.settled_amount ?? (item as any).settledAmount ?? 0);
              const remaining = Math.max(0, owed - settled);
              const progressPct = owed > 0 ? Math.min(100, Math.round((settled / owed) * 100)) : 0;

              const isLinked = Boolean(item.member?.is_linked ?? (item.member as any)?.isLinked);
              const memberName = item.member?.name?.trim() || 'Unnamed Contact';
              const initials = getContactInitials(item.member?.name);
              const color = resolveContactColor(
                item.member?.id || item.member?.name || item.member?.email
              );

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  {/* Top color accent stripe */}
                  <div
                    className="h-1 w-full opacity-80 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: color }}
                  />

                  <div className="p-5 space-y-4">
                    {/* Header: Member Avatar, Name, and Link Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-primary ring-2 ring-surface shadow-xs overflow-hidden"
                          style={{ backgroundColor: color }}
                        >
                          {item.member?.image ? (
                            <img
                              src={item.member.image}
                              alt={memberName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="font-display text-body-sm font-semibold tracking-wider">
                              {initials || <User className="h-5 w-5" />}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-display text-body-md font-semibold text-text-primary truncate">
                            {memberName}
                          </h4>
                          <p className="text-caption text-text-muted truncate">
                            {item.member?.email || item.member?.phone || 'External contact'}
                          </p>
                        </div>
                      </div>

                      {isLinked ? (
                        <span className="text-caption bg-success-subtle text-success border border-success/30 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium shrink-0">
                          <UserCheck size={11} />
                          Linked
                        </span>
                      ) : (
                        <span className="text-caption bg-surface-raised text-text-muted border border-border/50 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium shrink-0">
                          <User size={11} />
                          External
                        </span>
                      )}
                    </div>

                    {/* Expense Context Box */}
                    <div className="rounded-lg border border-border/50 bg-surface-raised/40 p-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-body-sm font-medium text-text-primary truncate">
                          {item.expense?.description || 'Shared Expense'}
                        </span>
                        <span className="font-numeric text-caption font-medium text-text-secondary shrink-0">
                          ₹{Number(item.expense?.amount ?? 0).toLocaleString('en-IN')} total
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-caption text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="shrink-0" />
                          <span>{safeFormatDate(item.expense?.date)}</span>
                        </span>
                        {item.expense?.split_type && (
                          <span className="capitalize text-[11px] px-1.5 py-0.2 rounded bg-surface border border-border/40">
                            {item.expense.split_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Balance Highlight & Progress */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-caption text-text-muted block">Remaining Owed</span>
                          <span className="font-display text-display-sm font-bold text-text-primary">
                            ₹{remaining.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-caption text-text-muted block">Total Share</span>
                          <span className="font-numeric text-body-sm font-medium text-text-secondary">
                            ₹{owed.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-text-muted">
                          <span>{progressPct}% Settled</span>
                          {settled > 0 && (
                            <span className="text-success font-numeric">
                              ₹{settled.toLocaleString('en-IN')} paid
                            </span>
                          )}
                        </div>
                        <Progress value={progressPct} className="h-1.5 bg-surface-raised" />
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="p-5 pt-0">
                    <Button
                      onClick={() => handleOpenSettle(item)}
                      className="w-full gap-1.5"
                      size="sm"
                    >
                      <CheckCircle2 size={15} />
                      Settle Balance
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. Settlement Dialog Modal                                         */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={Boolean(activeShareToSettle)}
        onOpenChange={(open) => {
          if (!open) handleCloseSettle();
        }}
      >
        <ModalContent size="md">
          <ModalHeader tone="success" icon={<CheckCircle2 className="h-5 w-5" />}>
            <ModalTitle>Record Settlement</ModalTitle>
            <ModalDescription>
              Record payment reimbursement received from{' '}
              <strong className="text-text-primary">
                {activeShareToSettle?.member?.name || 'this contact'}
              </strong>
              .
            </ModalDescription>
          </ModalHeader>

          {activeShareToSettle && (
            <form onSubmit={handleConfirmSettle}>
              <ModalBody className="space-y-5">
                {/* Summary Context Banner */}
                <div className="rounded-xl border border-border bg-surface-raised/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-caption font-semibold text-on-primary"
                        style={{
                          backgroundColor: resolveContactColor(
                            activeShareToSettle.member?.id || activeShareToSettle.member?.name
                          ),
                        }}
                      >
                        {getContactInitials(activeShareToSettle.member?.name)}
                      </div>
                      <div>
                        <span className="font-display text-body-sm font-semibold text-text-primary block">
                          {activeShareToSettle.member?.name || 'Contact'}
                        </span>
                        <span className="text-caption text-text-muted">
                          {activeShareToSettle.member?.email ||
                            activeShareToSettle.member?.phone ||
                            'External'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-caption text-text-muted block">Remaining Owed</span>
                      <span className="font-display text-body-md font-bold text-text-primary">
                        ₹{activeShareRemaining.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-2 flex items-center justify-between text-caption text-text-secondary">
                    <span>{activeShareToSettle.expense?.description}</span>
                    <span>{safeFormatDate(activeShareToSettle.expense?.date)}</span>
                  </div>
                </div>

                {/* Amount to Settle Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="settle-amount-input"
                      className="text-body-sm font-medium text-text-primary"
                    >
                      Settlement Amount (₹)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSettleAmount(String(roundMoney(activeShareRemaining)))}
                        className="rounded bg-surface-raised px-2 py-0.5 text-caption font-medium text-text-secondary hover:text-text-primary transition-colors border border-border/60"
                      >
                        Full (₹{activeShareRemaining})
                      </button>
                      {activeShareRemaining > 10 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSettleAmount(
                              String(roundMoney(Math.round(activeShareRemaining / 2)))
                            )
                          }
                          className="rounded bg-surface-raised px-2 py-0.5 text-caption font-medium text-text-secondary hover:text-text-primary transition-colors border border-border/60"
                        >
                          50% (₹{Math.round(activeShareRemaining / 2)})
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-numeric">
                      ₹
                    </span>
                    <input
                      id="settle-amount-input"
                      type="number"
                      step="any"
                      min="1"
                      max={activeShareRemaining}
                      value={settleAmount}
                      onChange={(e) => {
                        setSettleAmount(e.target.value);
                        setSettleError(null);
                      }}
                      className={cn(
                        'h-10 w-full rounded-lg border border-border bg-surface pl-8 pr-4 text-body-md font-numeric text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                        settleError && 'border-danger focus:border-danger focus:ring-danger/20'
                      )}
                      placeholder="Enter amount"
                      required
                    />
                  </div>

                  {settleError && (
                    <p className="text-caption text-danger flex items-center gap-1">
                      <AlertCircle size={12} />
                      {settleError}
                    </p>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-body-sm font-medium text-text-primary">
                    Settlement Method
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* UPI Option */}
                    <button
                      type="button"
                      onClick={() => setSettleMethod('upi')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all',
                        settleMethod === 'upi'
                          ? 'border-primary bg-primary-subtle/40 text-primary shadow-xs'
                          : 'border-border bg-surface text-text-secondary hover:border-border/80 hover:bg-surface-raised'
                      )}
                    >
                      <QrCode className="h-5 w-5" />
                      <span className="text-caption font-semibold">UPI / QR</span>
                      <span className="text-[10px] text-text-muted">GPay, PhonePe</span>
                    </button>

                    {/* Cash Option */}
                    <button
                      type="button"
                      onClick={() => setSettleMethod('cash')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all',
                        settleMethod === 'cash'
                          ? 'border-primary bg-primary-subtle/40 text-primary shadow-xs'
                          : 'border-border bg-surface text-text-secondary hover:border-border/80 hover:bg-surface-raised'
                      )}
                    >
                      <Banknote className="h-5 w-5" />
                      <span className="text-caption font-semibold">Cash</span>
                      <span className="text-[10px] text-text-muted">Hand-to-hand</span>
                    </button>

                    {/* Bank Transfer Option */}
                    <button
                      type="button"
                      onClick={() => setSettleMethod('bank_transfer')}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all',
                        settleMethod === 'bank_transfer'
                          ? 'border-primary bg-primary-subtle/40 text-primary shadow-xs'
                          : 'border-border bg-surface text-text-secondary hover:border-border/80 hover:bg-surface-raised'
                      )}
                    >
                      <Building2 className="h-5 w-5" />
                      <span className="text-caption font-semibold">Net Banking</span>
                      <span className="text-[10px] text-text-muted">NEFT / IMPS</span>
                    </button>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseSettle}
                  disabled={isSettlingSplit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSettlingSplit}
                  disabled={isSettlingSplit || !settleAmount}
                  className="gap-1.5"
                >
                  <Check size={16} />
                  Confirm Settlement (₹{settleAmount || '0'})
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}

export default BalancesAndSettlements;
