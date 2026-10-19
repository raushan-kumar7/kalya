'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Input,
  Progress,
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from '@/components/ui';
import {
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  QrCode,
  Receipt,
  RotateCw,
  Search,
  User,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { formatTimeAgo, Temporal } from '@kalya/utils';
import { resolveContactColor, getContactInitials } from './contacts/card';
import type { SettlementMethod, SplitContactMember } from '@kalya/types';
import {
  usePendingSplitSharesQuery,
  useSplitContactsQuery,
  useSplitInvitationsQuery,
  useSplitShareActions,
} from '@/hooks/finances';
import {
  type UnsettledSplitItem,
  type FilterTab,
  type SortOption,
  type SettleState,
  getOwed,
  getSettled,
  getRemaining,
  isLinkedMember,
  buildPersonGroups,
  computeSplitsStats,
  filterAndSortGroups,
  computeSettleTarget,
  validateSettlementAmount,
  planFifoSettlement,
  isUserPaidItem,
  inr,
  fmtDate,
} from './helper';
import { KpiCard, KpiGrid } from '@/components/shared';

// Re-export contacts and calculation helpers for convenience and backward compatibility
export * from './contacts';
export * from './helper';

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function BalancesAndSettlements() {
  // Queries
  const {
    data: pendingShares = [],
    isLoading: unsettledLoading,
    isRefetching: isPendingSplitsRefetching,
    error: pendingQueryError,
    refetch: refetchUnsettledSplits,
  } = usePendingSplitSharesQuery();

  const { data: contacts = [] } = useSplitContactsQuery();
  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
  } = useSplitInvitationsQuery();

  // Actions
  const { settleShare, respondInvitation, isSettling: isSettlingSplit } = useSplitShareActions();

  // Pending split invitations sent to this user
  const pendingInvitations = useMemo(
    () => (invitations ?? []).filter((inv) => inv.status === 'pending'),
    [invitations]
  );

  // Toolbar
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('highest');
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const handleRespondInvitation = async (id: string, action: 'accept' | 'decline') => {
    setRespondingId(id);
    try {
      await respondInvitation(id, { action });
    } finally {
      setRespondingId(null);
    }
  };

  // Dialogs
  const [detailsKey, setDetailsKey] = useState<string | null>(null);
  const [settleState, setSettleState] = useState<SettleState | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState<SettlementMethod>('upi');
  const [settleError, setSettleError] = useState<string | null>(null);

  const unsettledError = pendingQueryError?.message ?? null;
  const allItems = (pendingShares ?? []) as UnsettledSplitItem[];

  // Unfiltered groups: source of truth for the dialogs and KPI cards
  const allGroups = useMemo(() => buildPersonGroups(allItems), [allItems]);

  const stats = useMemo(
    () => computeSplitsStats(allGroups, allItems.length),
    [allGroups, allItems.length]
  );

  // Filter shares -> group by person -> sort people
  const visibleGroups = useMemo(
    () => filterAndSortGroups(allItems, filterTab, searchQuery, sortBy),
    [allItems, filterTab, searchQuery, sortBy]
  );

  // Resolve dialog targets from live data so they refresh after each settlement
  const detailsGroup = useMemo(
    () => allGroups.find((g) => g.key === detailsKey) ?? null,
    [allGroups, detailsKey]
  );

  const settleTarget = useMemo(
    () => computeSettleTarget(allGroups, settleState),
    [allGroups, settleState]
  );

  /* ------------------------------ handlers ------------------------------ */

  const openSettle = (groupKey: string, itemId?: string) => {
    const target = computeSettleTarget(allGroups, { groupKey, itemId });
    if (!target) return;

    setDetailsKey(null);
    setSettleState({ groupKey, itemId });
    setSettleAmount(String(target.remaining));
    setSettleMethod('upi');
    setSettleError(null);
  };

  const closeSettle = () => {
    setSettleState(null);
    setSettleAmount('');
    setSettleError(null);
  };

  const confirmSettle = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!settleTarget) return;

    const validation = validateSettlementAmount(settleAmount, settleTarget.remaining);
    if (!validation.isValid) {
      setSettleError(validation.error);
      return;
    }
    setSettleError(null);

    const allocations = planFifoSettlement(
      settleTarget.items,
      validation.amount,
      settleTarget.group.direction
    );
    if (allocations.length === 0) return;

    const settledAt = Temporal.Now.instant().toString();

    try {
      for (const alloc of allocations) {
        await settleShare(alloc.itemId, {
          settled_amount: alloc.amount,
          settled_via: settleMethod,
          settled_at: settledAt,
        });
      }
      closeSettle();
    } catch {
      // The hook already shows the error toast. Keep the dialog open so the person can retry;
      // shares already recorded drop out of the remaining balance after the refetch.
      setSettleError('Some payments could not be recorded. Check the balance and try again.');
    }
  };

  /* -------------------------------- render ------------------------------- */

  const tabClass = (active: boolean) =>
    cn(
      'rounded-md px-3 py-1 text-caption font-medium transition-colors',
      active
        ? 'bg-surface text-text-primary shadow-xs'
        : 'text-text-muted hover:text-text-secondary'
    );

  const methodOptions: {
    id: SettlementMethod;
    label: string;
    hint: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'upi', label: 'UPI / QR', hint: 'GPay, PhonePe', icon: <QrCode className="h-5 w-5" /> },
    { id: 'cash', label: 'Cash', hint: 'Hand-to-hand', icon: <Banknote className="h-5 w-5" /> },
    {
      id: 'bank_transfer',
      label: 'Net Banking',
      hint: 'NEFT / IMPS',
      icon: <Building2 className="h-5 w-5" />,
    },
  ];

  return (
    <section className="flex h-full min-h-0 flex-col space-y-6">
      {/* Header */}
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
              ) : stats.shareCount === 0 ? (
                'All caught up · No outstanding balances'
              ) : (
                `${inr(stats.totalOutstanding)} outstanding from ${stats.peopleCount} ${
                  stats.peopleCount === 1 ? 'person' : 'people'
                } · ${stats.shareCount} ${stats.shareCount === 1 ? 'share' : 'shares'}`
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refetchUnsettledSplits();
                refetchInvitations();
              }}
              disabled={unsettledLoading}
              className="gap-1.5"
            >
              <RotateCw
                size={15}
                className={cn(
                  'shrink-0',
                  (isPendingSplitsRefetching || invitationsLoading) && 'animate-spin'
                )}
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

        {/* Incoming Split Bill Invitations from Peers */}
        {pendingInvitations.length > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary-subtle/20 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-display text-body-md font-semibold text-text-primary flex items-center gap-2">
                    Split Bill Invitations
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">
                      {pendingInvitations.length} new
                    </span>
                  </h3>
                  <p className="text-caption text-text-secondary mt-0.5">
                    Your peers added you to shared expenses. Review and accept to sync them directly
                    into your ledger.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {pendingInvitations.map((inv) => {
                const inviterName = inv.sender?.name || 'A Kalya peer';
                const inviterInitials = getContactInitials(inviterName);
                const inviterColor = resolveContactColor(inv.sender?.id || inviterName);
                const expenseDesc = inv.expense?.description || 'Shared expense';
                const dateStr = fmtDate(inv.expense?.date);
                const shareAmount = inv.share_amount;

                return (
                  <div
                    key={inv.id}
                    className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface p-4 shadow-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-on-primary overflow-hidden"
                            style={{ backgroundColor: inviterColor }}
                          >
                            {inv.sender?.image ? (
                              <img
                                src={inv.sender.image}
                                alt={inviterName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              inviterInitials || <User size={12} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-caption font-medium text-text-primary block truncate">
                              {inviterName}
                            </span>
                            <span className="text-[10px] text-text-muted block truncate">
                              Logged bill
                            </span>
                          </div>
                        </div>

                        <span className="font-display text-body-md font-bold text-primary">
                          {inr(shareAmount)}
                        </span>
                      </div>

                      <div className="rounded-lg bg-surface-raised/50 p-2.5 space-y-1 text-caption">
                        <p className="font-medium text-text-primary truncate">{expenseDesc}</p>
                        <p className="text-[11px] text-text-muted flex items-center gap-1.5">
                          <Calendar size={11} />
                          {dateStr}
                          {inv.expense?.split_type && (
                            <span className="capitalize">· {inv.expense.split_type} split</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border/40">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRespondInvitation(inv.id, 'decline')}
                        disabled={Boolean(respondingId)}
                        className="flex-1 text-caption text-text-muted hover:text-danger"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRespondInvitation(inv.id, 'accept')}
                        disabled={Boolean(respondingId)}
                        isLoading={respondingId === inv.id}
                        className="flex-1 text-caption gap-1"
                      >
                        <Check size={14} />
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KPI cards */}
        <KpiGrid cols={4}>
          <KpiCard
            title="Net Outstanding"
            value={inr(Math.abs(stats.totalOutstanding))}
            hint={
              stats.totalOutstanding > 0
                ? `You are owed net across ${stats.peopleCount} ${stats.peopleCount === 1 ? 'person' : 'people'}`
                : stats.totalOutstanding < 0
                  ? `You owe net across ${stats.peopleCount} ${stats.peopleCount === 1 ? 'person' : 'people'}`
                  : 'All accounts balanced · ₹0 net'
            }
            icon={Wallet}
            tone={stats.totalOutstanding >= 0 ? 'positive' : 'warning'}
          />
          <KpiCard
            title="You Are Owed"
            value={inr(stats.totalYouAreOwed)}
            hint="Receivables from peers"
            icon={Receipt}
            tone="positive"
          />
          <KpiCard
            title="You Owe"
            value={inr(stats.totalYouOwe)}
            hint="Payables to peers"
            icon={Banknote}
            tone={stats.totalYouOwe > 0 ? 'warning' : 'default'}
          />
          <KpiCard
            title="Collected So Far"
            value={inr(stats.totalSettled)}
            hint={`From ${inr(stats.totalObligation)} total obligation`}
            icon={CheckCircle2}
            tone="accent"
          />
        </KpiGrid>

        {/* Toolbar */}
        {!unsettledLoading && stats.shareCount > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface-raised p-1">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={tabClass(filterTab === 'all')}
              >
                All ({stats.peopleCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('unpaid')}
                className={tabClass(filterTab === 'unpaid')}
              >
                Unpaid ({stats.unpaidCount})
              </button>
              {stats.partialCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterTab('partial')}
                  className={tabClass(filterTab === 'partial')}
                >
                  Partially Settled ({stats.partialCount})
                </button>
              )}
              {stats.linkedPeople > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterTab('linked')}
                  className={tabClass(filterTab === 'linked')}
                >
                  Linked Accounts ({stats.linkedPeople})
                </button>
              )}
            </div>

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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort balances"
                className="h-9 shrink-0 cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-caption font-medium text-text-secondary transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="highest">Highest balance</option>
                <option value="lowest">Lowest balance</option>
                <option value="newest">Newest expense</option>
                <option value="oldest">Oldest expense</option>
                <option value="name">Contact name (A-Z)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {unsettledLoading && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex animate-pulse flex-col gap-5 rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-surface-raised" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded bg-surface-raised" />
                    <div className="h-3 w-20 rounded bg-surface-raised" />
                  </div>
                </div>
                <div className="mx-auto h-10 w-32 rounded bg-surface-raised" />
                <div className="h-2 w-full rounded-full bg-surface-raised" />
                <div className="h-9 w-full rounded-lg bg-surface-raised" />
              </div>
            ))}
          </div>
        )}

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

        {!unsettledLoading && !unsettledError && stats.shareCount === 0 && (
          <EmptyState
            icon={<CheckCircle2 className="h-8 w-8 text-success" />}
            title="All settled up!"
            description="You have no outstanding split expenses right now. Everyone is squared away."
            action={
              <Link href="/dashboard/splits/contacts">
                <Button variant="outline" leadingIcon={<Users className="h-4 w-4" />}>
                  View Contacts Directory
                </Button>
              </Link>
            }
          />
        )}

        {!unsettledLoading &&
          !unsettledError &&
          stats.shareCount > 0 &&
          visibleGroups.length === 0 && (
            <EmptyState
              icon={<Search className="h-7 w-7 text-text-muted" />}
              title="No matching balances"
              description={
                searchQuery
                  ? `No balances match "${searchQuery}". Try a different keyword or clear the filters.`
                  : 'No balances found under this filter.'
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

        {/* One card per person */}
        {!unsettledLoading && !unsettledError && visibleGroups.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {visibleGroups.map((g) => {
              const name = g.member?.name?.trim() || 'Unnamed Contact';
              const color = resolveContactColor(g.member?.id || g.member?.name || g.member?.email);
              const linked = isLinkedMember(g.member);
              const count = g.items.length;
              const isPartial = g.settled > 0;
              const hasOldest = g.oldestTime > 0 && g.oldestTime !== Number.MAX_SAFE_INTEGER;

              return (
                <div
                  key={g.key}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div
                    className="h-1 w-full opacity-80 group-hover:opacity-100"
                    style={{ backgroundColor: color }}
                  />

                  <div className="flex flex-1 flex-col p-5">
                    {/* Person */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar member={g.member} name={name} color={color} />
                        <div className="min-w-0">
                          <h4 className="font-display text-body-md font-semibold text-text-primary truncate">
                            {name}
                          </h4>
                          <p className="text-caption text-text-muted truncate">
                            {g.member?.email || g.member?.phone || 'External contact'}
                          </p>
                        </div>
                      </div>
                      {linked ? (
                        <span className="text-caption bg-success-subtle text-success border border-success/30 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                          <UserCheck size={11} />
                          Linked
                        </span>
                      ) : (
                        <span className="text-caption bg-surface-raised text-text-muted border border-border/50 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                          <User size={11} />
                          External
                        </span>
                      )}
                    </div>

                    {/* Centered total */}
                    <div className="my-5 rounded-lg border border-border/50 bg-surface-raised/40 px-4 py-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center gap-2">
                          <span className="text-caption text-text-muted">
                            {g.direction === 'they_owe_you'
                              ? 'Owes you'
                              : g.direction === 'you_owe_them'
                                ? 'You owe'
                                : 'Net balance'}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              g.direction === 'settled'
                                ? 'bg-success-subtle text-success'
                                : g.direction === 'they_owe_you'
                                  ? 'bg-primary-subtle text-primary'
                                  : 'bg-warning-subtle text-warning'
                            )}
                          >
                            {g.direction === 'settled'
                              ? 'All Square'
                              : g.direction === 'they_owe_you'
                                ? 'Receivable'
                                : 'Payable'}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'mt-1 font-display text-display-md font-bold leading-tight',
                            g.direction === 'settled'
                              ? 'text-success'
                              : g.direction === 'they_owe_you'
                                ? 'text-primary'
                                : 'text-warning'
                          )}
                        >
                          {inr(g.remaining)}
                        </span>
                        <span className="mt-1 text-caption text-text-secondary">
                          {g.direction === 'settled'
                            ? `Mutual splits cancel out across ${count} ${count === 1 ? 'bill' : 'bills'}`
                            : `across ${count} ${count === 1 ? 'expense' : 'expenses'}${
                                isPartial ? ` · ${inr(g.settled)} paid` : ''
                              }`}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-auto space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span>{g.progressPct}% settled</span>
                        <span className="font-numeric">of {inr(g.owed)}</span>
                      </div>
                      <Progress value={g.progressPct} className="h-1.5 bg-surface-raised" />
                      {hasOldest && (
                        <p className="flex items-center gap-1 pt-1 text-[11px] text-text-muted">
                          <Calendar size={11} className="shrink-0" />
                          Oldest expense {formatTimeAgo(g.oldestTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2.5 p-5 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsKey(g.key)}
                      aria-label={`View expenses for ${name}`}
                    >
                      {count === 1 ? 'View' : `View all (${count})`}
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => openSettle(g.key)}
                      disabled={g.direction === 'settled' || g.remaining === 0}
                      aria-label={`Settle ${inr(g.remaining)} with ${name}`}
                    >
                      <CheckCircle2 size={15} />
                      {g.direction === 'settled'
                        ? 'Settled'
                        : count === 1
                          ? 'Settle'
                          : 'Settle all'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details dialog: every unsettled share for one person */}
      <Modal open={Boolean(detailsGroup)} onOpenChange={(open) => !open && setDetailsKey(null)}>
        <ModalContent size="md">
          <ModalHeader icon={<Receipt className="h-5 w-5" />}>
            <ModalTitle>{detailsGroup?.member?.name || 'Contact'}</ModalTitle>
            <ModalDescription>
              {detailsGroup && (
                <span className="flex flex-col gap-1 mt-1 text-caption text-text-secondary">
                  <span>
                    {detailsGroup.direction === 'settled'
                      ? 'Mutual expenses are completely balanced (Net ₹0).'
                      : detailsGroup.direction === 'they_owe_you'
                        ? `They owe you net ${inr(detailsGroup.remaining)} across ${detailsGroup.items.length} ${
                            detailsGroup.items.length === 1 ? 'expense' : 'expenses'
                          }.`
                        : `You owe them net ${inr(detailsGroup.remaining)} across ${detailsGroup.items.length} ${
                            detailsGroup.items.length === 1 ? 'expense' : 'expenses'
                          }.`}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Total lent by you: {inr(detailsGroup.theyOweYou)} · Total borrowed by you:{' '}
                    {inr(detailsGroup.youOweThem)}
                  </span>
                </span>
              )}
            </ModalDescription>
          </ModalHeader>

          {detailsGroup && (
            <>
              <ModalBody className="max-h-[60vh] space-y-2.5 overflow-y-auto">
                {[...detailsGroup.items].reverse().map((item) => {
                  const remaining = getRemaining(item);
                  const settled = getSettled(item);
                  const isPayer = isUserPaidItem(item);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-raised/40 p-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-body-sm font-medium text-text-primary truncate">
                            {item.expense?.description || 'Shared Expense'}
                          </p>
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.2 text-[10px] font-semibold tracking-wide border shrink-0',
                              isPayer
                                ? 'bg-primary-subtle text-primary border-primary/30'
                                : 'bg-warning-subtle text-warning border-warning/30'
                            )}
                          >
                            {isPayer ? 'You paid' : 'Peer paid'}
                          </span>
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-caption text-text-muted">
                          <Calendar size={12} className="shrink-0" />
                          {fmtDate(item.expense?.date)}
                          {item.expense?.split_type && (
                            <span className="rounded border border-border/40 bg-surface px-1.5 text-[11px] capitalize">
                              {item.expense.split_type}
                            </span>
                          )}
                          {item.sync_status && (
                            <span
                              className={cn(
                                'rounded px-1.5 text-[10px] font-medium tracking-wide border',
                                item.sync_status === 'synced'
                                  ? 'bg-success-subtle text-success border-success/30'
                                  : item.sync_status === 'pending_acceptance'
                                    ? 'bg-warning-subtle text-warning border-warning/30'
                                    : 'bg-surface-raised text-text-muted border-border/50'
                              )}
                            >
                              {item.sync_status === 'synced'
                                ? 'Synced'
                                : item.sync_status === 'pending_acceptance'
                                  ? 'Pending peer'
                                  : 'Local'}
                            </span>
                          )}
                          {item.creator && (
                            <span className="text-[11px] text-text-secondary">
                              · Logged by {item.creator.name || item.creator.username}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-caption text-text-secondary">
                          Share {inr(getOwed(item))}
                          {settled > 0 && (
                            <span className="text-success"> · {inr(settled)} paid</span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="font-display text-body-md font-bold text-text-primary">
                          {inr(remaining)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openSettle(detailsGroup.key, item.id)}
                        >
                          Settle
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={() => setDetailsKey(null)}>
                  Close
                </Button>
                <Button
                  className="gap-1.5"
                  onClick={() => openSettle(detailsGroup.key)}
                  disabled={detailsGroup.direction === 'settled' || detailsGroup.remaining === 0}
                >
                  <CheckCircle2 size={15} />
                  {detailsGroup.direction === 'settled'
                    ? 'All settled (₹0)'
                    : `Settle all (${inr(detailsGroup.remaining)})`}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Settlement dialog: one share or the whole person */}
      <Modal open={Boolean(settleTarget)} onOpenChange={(open) => !open && closeSettle()}>
        <ModalContent size="md">
          <ModalHeader tone="success" icon={<CheckCircle2 className="h-5 w-5" />}>
            <ModalTitle>Record settlement</ModalTitle>
            <ModalDescription>
              Payment received from{' '}
              <strong className="text-text-primary">
                {settleTarget?.group.member?.name || 'this contact'}
              </strong>
              {settleTarget && !settleTarget.isSingle && settleTarget.items.length > 1
                ? `. It's applied to the oldest expenses first.`
                : '.'}
            </ModalDescription>
          </ModalHeader>

          {settleTarget && (
            <form onSubmit={confirmSettle}>
              <ModalBody className="space-y-5">
                <div className="rounded-xl border border-border bg-surface-raised/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-caption font-semibold text-on-primary"
                        style={{
                          backgroundColor: resolveContactColor(
                            settleTarget.group.member?.id || settleTarget.group.member?.name
                          ),
                        }}
                      >
                        {getContactInitials(settleTarget.group.member?.name)}
                      </div>
                      <div>
                        <span className="font-display text-body-sm font-semibold text-text-primary block">
                          {settleTarget.group.member?.name || 'Contact'}
                        </span>
                        <span className="text-caption text-text-muted">
                          {settleTarget.group.member?.email ||
                            settleTarget.group.member?.phone ||
                            'External'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-caption text-text-muted block">Remaining owed</span>
                      <span className="font-display text-body-md font-bold text-text-primary">
                        {inr(settleTarget.remaining)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-2 text-caption text-text-secondary">
                    {settleTarget.items.length === 1
                      ? `${settleTarget.items[0].expense?.description || 'Shared Expense'} · ${fmtDate(
                          settleTarget.items[0].expense?.date
                        )}`
                      : `${settleTarget.items.length} expenses`}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="settle-amount-input"
                      className="text-body-sm font-medium text-text-primary"
                    >
                      Amount received (₹)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <QuickAmount
                        label={`Full (${inr(settleTarget.remaining)})`}
                        onClick={() => setSettleAmount(String(settleTarget.remaining))}
                      />
                      {settleTarget.remaining > 10 && (
                        <QuickAmount
                          label={`50% (${inr(Math.round(settleTarget.remaining / 2))})`}
                          onClick={() =>
                            setSettleAmount(String(Math.round(settleTarget.remaining / 2)))
                          }
                        />
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
                      inputMode="decimal"
                      step="any"
                      min="0.01"
                      max={settleTarget.remaining}
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

                <div className="space-y-2">
                  <span className="text-body-sm font-medium text-text-primary">Payment method</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {methodOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSettleMethod(opt.id)}
                        aria-pressed={settleMethod === opt.id}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all',
                          settleMethod === opt.id
                            ? 'border-primary bg-primary-subtle/40 text-primary shadow-xs'
                            : 'border-border bg-surface text-text-secondary hover:bg-surface-raised'
                        )}
                      >
                        {opt.icon}
                        <span className="text-caption font-semibold">{opt.label}</span>
                        <span className="text-[10px] text-text-muted">{opt.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeSettle}
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
                  Confirm settlement ({inr(Number(settleAmount) || 0)})
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Small presentational pieces                                                */
/* -------------------------------------------------------------------------- */

function Avatar({
  member,
  name,
  color,
}: {
  member?: SplitContactMember | null;
  name: string;
  color: string;
}) {
  const [broken, setBroken] = useState(false);
  const initials = getContactInitials(member?.name);
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-on-primary ring-2 ring-surface shadow-xs"
      style={{ backgroundColor: color }}
    >
      {member?.image && !broken ? (
        <img
          src={member.image}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="font-display text-body-sm font-semibold tracking-wider">
          {initials || <User className="h-5 w-5" />}
        </span>
      )}
    </div>
  );
}

function QuickAmount({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-border/60 bg-surface-raised px-2 py-0.5 text-caption font-medium text-text-secondary transition-colors hover:text-text-primary"
    >
      {label}
    </button>
  );
}

export default BalancesAndSettlements;
