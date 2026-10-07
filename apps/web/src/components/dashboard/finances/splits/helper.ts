import type { Expense, SettlementMethod, SplitContactMember, SplitExpense } from '@kalya/types';
import type { PendingSplitShare } from '@/hooks/finances';
import { roundMoney, formatCardDate } from '@kalya/utils';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type UnsettledSplitItem = PendingSplitShare;

export type FilterTab = 'all' | 'unpaid' | 'partial' | 'linked';
export type SortOption = 'highest' | 'lowest' | 'newest' | 'oldest' | 'name';

/** One card = one person, with all of their unsettled shares inside. */
export type PersonGroup = {
  key: string;
  member: SplitContactMember;
  items: UnsettledSplitItem[]; // sorted oldest -> newest (used for FIFO allocation)
  owed: number;
  settled: number;
  remaining: number;
  progressPct: number;
  unpaidCount: number;
  partialCount: number;
  latestTime: number;
  oldestTime: number;
};

export type SplitsStats = {
  totalObligation: number;
  totalSettled: number;
  totalOutstanding: number;
  peopleCount: number;
  shareCount: number;
  partialCount: number;
  unpaidCount: number;
  linkedPeople: number;
  recoveryRate: number;
};

/** Which shares the settle dialog is working on. No itemId = settle the whole person. */
export type SettleState = {
  groupKey: string;
  itemId?: string;
};

export type SettlementTarget = {
  group: PersonGroup;
  items: UnsettledSplitItem[];
  remaining: number;
  isSingle: boolean;
};

export type SettlementAllocation = {
  itemId: string;
  amount: number;
};

export type SettlementValidationResult = {
  isValid: boolean;
  amount: number;
  error: string | null;
};

/* -------------------------------------------------------------------------- */
/* Formatting & Property Extractors                                           */
/* -------------------------------------------------------------------------- */

/** Formats a number to Indian Rupee representation (e.g., ₹1,234.50 or ₹1,234) */
export const formatInr = (n: number): string => {
  const safe = Number.isFinite(n) ? n : 0;
  return `₹${safe.toLocaleString('en-IN')}`;
};

/** Alias for formatInr for concise call sites */
export const inr = formatInr;

/**
 * Formats an expense date via @kalya/utils. Only the "YYYY-MM-DD" part is passed on,
 * so it also works when the API returns a full ISO timestamp.
 */
export const formatSplitDate = (value?: string | null): string => {
  return formatCardDate(value?.slice(0, 10));
};

/** Alias for formatSplitDate */
export const fmtDate = formatSplitDate;

export const getOwed = (item: UnsettledSplitItem): number => {
  return roundMoney(Number(item.amount ?? 0));
};

export const getSettled = (item: UnsettledSplitItem): number => {
  return roundMoney(Number(item.settled_amount ?? (item as any)?.settledAmount ?? 0));
};

export const getRemaining = (item: UnsettledSplitItem): number => {
  return Math.max(0, roundMoney(getOwed(item) - getSettled(item)));
};

export const isLinkedMember = (member?: SplitContactMember | null): boolean => {
  return Boolean(member?.is_linked ?? (member as any)?.isLinked);
};

export const getItemDateTimestamp = (item: UnsettledSplitItem): number => {
  const dateStr = item.expense?.date;
  if (!dateStr) return 0;
  return new Date(dateStr).getTime() || 0;
};

/**
 * Identity of a person. Email/phone first so duplicate contact rows for the
 * same human still collapse into one card.
 */
export function getGroupKey(item: UnsettledSplitItem): string {
  const m = item.member;
  return (
    m?.email?.trim().toLowerCase() ||
    m?.phone?.trim() ||
    item.split_member_id ||
    m?.id ||
    m?.name?.trim().toLowerCase() ||
    item.id
  );
}

/* -------------------------------------------------------------------------- */
/* Grouping and Aggregation                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Aggregates a flat list of unsettled split items into person-centric groups.
 * Items inside each group are sorted chronologically (oldest -> newest) for FIFO settlement.
 */
export function buildPersonGroups(items: UnsettledSplitItem[]): PersonGroup[] {
  const map = new Map<
    string,
    {
      key: string;
      member: SplitContactMember;
      items: UnsettledSplitItem[];
      owed: number;
      settled: number;
      remaining: number;
      unpaidCount: number;
      partialCount: number;
      latestTime: number;
      oldestTime: number;
    }
  >();

  for (const item of items) {
    const key = getGroupKey(item);
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        member: item.member,
        items: [],
        owed: 0,
        settled: 0,
        remaining: 0,
        unpaidCount: 0,
        partialCount: 0,
        latestTime: 0,
        oldestTime: 0,
      };
      map.set(key, g);
    }

    const owed = getOwed(item);
    const settled = getSettled(item);
    const remaining = getRemaining(item);
    const timestamp = getItemDateTimestamp(item);

    g.items.push(item);
    g.owed += owed;
    g.settled += settled;
    g.remaining += remaining;

    if (settled === 0) {
      g.unpaidCount += 1;
    } else if (settled < owed) {
      g.partialCount += 1;
    }

    if (timestamp > 0) {
      g.latestTime = Math.max(g.latestTime, timestamp);
      g.oldestTime = g.oldestTime === 0 ? timestamp : Math.min(g.oldestTime, timestamp);
    }
  }

  return Array.from(map.values()).map((g) => {
    const owed = roundMoney(g.owed);
    const settled = roundMoney(g.settled);
    const remaining = roundMoney(g.remaining);
    const progressPct =
      owed > 0 ? Math.min(100, Math.max(0, Math.round((settled / owed) * 100))) : 0;

    return {
      key: g.key,
      member: g.member,
      owed,
      settled,
      remaining,
      progressPct,
      unpaidCount: g.unpaidCount,
      partialCount: g.partialCount,
      latestTime: g.latestTime,
      oldestTime: g.oldestTime,
      items: g.items.sort((a, b) => getItemDateTimestamp(a) - getItemDateTimestamp(b)),
    };
  });
}

/**
 * Computes top-level KPI metrics across all person groups.
 */
export function computeSplitsStats(
  allGroups: PersonGroup[],
  totalSharesCount: number
): SplitsStats {
  let totalObligation = 0;
  let totalSettled = 0;
  let totalOutstanding = 0;
  let partialCount = 0;
  let unpaidCount = 0;
  let linkedPeople = 0;

  for (const g of allGroups) {
    totalObligation += g.owed;
    totalSettled += g.settled;
    totalOutstanding += g.remaining;
    partialCount += g.partialCount;
    unpaidCount += g.unpaidCount;
    if (isLinkedMember(g.member)) linkedPeople += 1;
  }

  const roundedObligation = roundMoney(totalObligation);
  const roundedSettled = roundMoney(totalSettled);
  const roundedOutstanding = roundMoney(totalOutstanding);

  return {
    totalObligation: roundedObligation,
    totalSettled: roundedSettled,
    totalOutstanding: roundedOutstanding,
    peopleCount: allGroups.length,
    shareCount: totalSharesCount,
    partialCount,
    unpaidCount,
    linkedPeople,
    recoveryRate:
      roundedObligation > 0
        ? Math.min(100, Math.max(0, Math.round((roundedSettled / roundedObligation) * 100)))
        : 0,
  };
}

/**
 * Filters split items by category tab and search query, groups them by person,
 * and sorts the resulting person cards.
 */
export function filterAndSortGroups(
  allItems: UnsettledSplitItem[],
  filterTab: FilterTab,
  searchQuery: string,
  sortBy: SortOption
): PersonGroup[] {
  let list = allItems;

  if (filterTab === 'unpaid') {
    list = list.filter((i) => getSettled(i) === 0);
  } else if (filterTab === 'partial') {
    list = list.filter((i) => getSettled(i) > 0 && getSettled(i) < getOwed(i));
  } else if (filterTab === 'linked') {
    list = list.filter((i) => isLinkedMember(i.member));
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    list = list.filter((i) =>
      [i.member?.name, i.member?.email, i.member?.phone, i.expense?.description].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }

  const groups = buildPersonGroups(list);

  groups.sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.remaining - a.remaining;
      case 'lowest':
        return a.remaining - b.remaining;
      case 'newest':
        return b.latestTime - a.latestTime;
      case 'oldest':
        return a.oldestTime - b.oldestTime;
      case 'name':
        return (a.member?.name || '').localeCompare(b.member?.name || '');
      default:
        return 0;
    }
  });

  return groups;
}

/* -------------------------------------------------------------------------- */
/* Settlement Calculations & FIFO Allocation                                  */
/* -------------------------------------------------------------------------- */

/**
 * Determines the target shares and outstanding balance for a settlement dialog.
 */
export function computeSettleTarget(
  allGroups: PersonGroup[],
  settleState: SettleState | null
): SettlementTarget | null {
  if (!settleState) return null;

  const group = allGroups.find((g) => g.key === settleState.groupKey);
  if (!group) return null;

  const items = settleState.itemId
    ? group.items.filter((i) => i.id === settleState.itemId)
    : group.items;

  if (items.length === 0) return null;

  const remaining = roundMoney(items.reduce((sum, i) => sum + getRemaining(i), 0));
  return {
    group,
    items,
    remaining,
    isSingle: Boolean(settleState.itemId),
  };
}

/**
 * Validates a user-entered settlement amount string against the maximum remaining balance.
 */
export function validateSettlementAmount(
  amountStr: string,
  maxRemaining: number
): SettlementValidationResult {
  const amountNum = parseFloat(amountStr);

  if (isNaN(amountNum) || amountNum <= 0) {
    return {
      isValid: false,
      amount: 0,
      error: 'Enter an amount greater than ₹0',
    };
  }

  if (amountNum > maxRemaining + 0.01) {
    return {
      isValid: false,
      amount: amountNum,
      error: `Amount can't exceed the remaining balance of ${formatInr(maxRemaining)}`,
    };
  }

  return {
    isValid: true,
    amount: roundMoney(amountNum),
    error: null,
  };
}

/**
 * Distributes an incoming payment amount across items in FIFO order (oldest first).
 * Returns individual payment allocations for each item.
 */
export function planFifoSettlement(
  items: UnsettledSplitItem[],
  amountToPay: number
): SettlementAllocation[] {
  let left = roundMoney(amountToPay);
  if (left <= 0 || items.length === 0) return [];

  // Guarantee oldest to newest sorting
  const sortedItems = [...items].sort((a, b) => getItemDateTimestamp(a) - getItemDateTimestamp(b));

  const allocations: SettlementAllocation[] = [];

  for (const item of sortedItems) {
    if (left <= 0) break;
    const remaining = getRemaining(item);
    if (remaining <= 0) continue;

    const pay = roundMoney(Math.min(left, remaining));
    if (pay > 0) {
      allocations.push({
        itemId: item.id,
        amount: pay,
      });
      left = roundMoney(left - pay);
    }
  }

  return allocations;
}
