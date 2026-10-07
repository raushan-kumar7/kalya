import type { SplitType } from '@kalya/types';
import { roundMoney } from './money';

export interface SplitMemberShareInput {
  memberId: string;
  share?: number;
}

export interface SplitMemberShareOutput {
  memberId: string;
  amount: number;
}

/**
 * Distributes an expense total across participants according to SplitType.
 * Backwards-compatible core utility.
 */
export function calculateSplitShares(
  totalAmount: number,
  type: SplitType,
  participants: SplitMemberShareInput[]
): SplitMemberShareOutput[] {
  const safeTotal = roundMoney(totalAmount);
  if (participants.length === 0 || safeTotal <= 0) return [];

  const count = participants.length;

  if (type === 'equal') {
    const baseShare = roundMoney(Math.floor((safeTotal / count) * 100) / 100);
    const allocated = roundMoney(baseShare * count);
    const remainder = roundMoney(safeTotal - allocated);
    const remainderCents = Math.round(remainder * 100);

    return participants.map((p, idx) => ({
      memberId: p.memberId,
      // Allocate the remaining pennies to first participants
      amount: roundMoney(baseShare + (idx < remainderCents ? 0.01 : 0)),
    }));
  }

  if (type === 'percentage') {
    return participants.map((p) => {
      const pct = p.share ?? 0;
      return {
        memberId: p.memberId,
        amount: roundMoney((safeTotal * pct) / 100),
      };
    });
  }

  if (type === 'shares') {
    const totalShares = participants.reduce((acc, p) => acc + (p.share ?? 1), 0);
    if (totalShares <= 0) {
      return participants.map((p) => ({ memberId: p.memberId, amount: 0 }));
    }

    return participants.map((p) => {
      const shareRatio = (p.share ?? 1) / totalShares;
      return {
        memberId: p.memberId,
        amount: roundMoney(safeTotal * shareRatio),
      };
    });
  }

  // Exact type: preserves specified amounts
  return participants.map((p) => ({
    memberId: p.memberId,
    amount: roundMoney(p.share ?? 0),
  }));
}

// ============================================================================
// Enhanced Interactive Split Breakdown Engine
// ============================================================================

export interface SplitParticipantInfo {
  id: string; // 'self' or contact UUID
  name?: string;
  isPayer?: boolean;
}

export interface SplitItemCalculation {
  id: string;
  name?: string;
  isPayer: boolean;
  inputValue: number; // raw value in user input: ₹ amount, % percentage, or ratio shares
  amount: number; // final computed currency amount in ₹
  percentage: number; // share percentage of total (0 - 100)
  shares: number; // share weight (for shares mode)
}

export interface SplitBreakdownCalculation {
  participants: SplitItemCalculation[];
  yourShare: number; // amount owed by primary user ('self')
  peerTotal: number; // sum of amounts owed by peers (excluding 'self')
  payerId: string; // who paid the bill ('self' or a friend's UUID)
  payerName: string; // display name of who paid
  isUserPayer: boolean; // true if 'self' paid
  userOwedSummary: string; // e.g. "Friends owe you ₹400.00" or "You owe Ritik ₹200.00"
  totalAllocated: number; // sum of all shares
  targetTotal: number; // the total expense amount
  remainingAmount: number; // targetTotal - totalAllocated
  isBalanced: boolean; // whether total matches (within 0.01 tolerance)
  percentageSum: number; // sum of percentages
  totalShares: number; // total shares weight
  validationError?: string | null;
}

export interface DetailedSplitBreakdownParams {
  totalAmount: number;
  splitType: SplitType;
  participants: (string | SplitParticipantInfo)[];
  values?: Record<string, number>;
  primaryUserId?: string;
  paidById?: string | null; // who actually paid the bill (null or 'self' means primary user)
}

/**
 * Calculates a complete, real-time split breakdown for any split type and participant configuration.
 * Handles penny remainder rounding, custom peer allocations, payer tracking, live validation, and summaries.
 */
export function calculateDetailedSplitBreakdown({
  totalAmount,
  splitType,
  participants,
  values = {},
  primaryUserId = 'self',
  paidById = 'self',
}: DetailedSplitBreakdownParams): SplitBreakdownCalculation {
  const safeTotal = roundMoney(Number(totalAmount) || 0);
  const effectivePaidById = paidById || primaryUserId;

  // Normalize participants list
  const normalizedParticipants: SplitParticipantInfo[] = participants.map((p) => {
    if (typeof p === 'string') {
      return { id: p, isPayer: p === effectivePaidById };
    }
    return {
      ...p,
      isPayer: p.id === effectivePaidById,
    };
  });

  const count = normalizedParticipants.length;
  if (count === 0 || safeTotal <= 0) {
    const isUserPayer = effectivePaidById === primaryUserId;
    return {
      participants: normalizedParticipants.map((p) => ({
        id: p.id,
        name: p.name,
        isPayer: p.id === effectivePaidById,
        inputValue: 0,
        amount: 0,
        percentage: 0,
        shares: splitType === 'shares' ? 1 : 0,
      })),
      yourShare: safeTotal,
      peerTotal: 0,
      payerId: effectivePaidById,
      payerName: isUserPayer ? 'You' : 'Friend',
      isUserPayer,
      userOwedSummary: '',
      totalAllocated: 0,
      targetTotal: safeTotal,
      remainingAmount: safeTotal,
      isBalanced: safeTotal <= 0,
      percentageSum: 0,
      totalShares: 0,
      validationError:
        safeTotal <= 0 ? 'Amount must be greater than zero' : 'No participants selected',
    };
  }

  let calculatedItems: SplitItemCalculation[] = [];

  if (splitType === 'equal') {
    // Equal distribution with penny remainder allocated to first participants
    const baseShare = roundMoney(Math.floor((safeTotal / count) * 100) / 100);
    const allocated = roundMoney(baseShare * count);
    const remainder = roundMoney(safeTotal - allocated);
    const remainderCents = Math.round(remainder * 100);

    calculatedItems = normalizedParticipants.map((p, idx) => {
      const amount = roundMoney(baseShare + (idx < remainderCents ? 0.01 : 0));
      const percentage = safeTotal > 0 ? roundMoney((amount / safeTotal) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        isPayer: Boolean(p.isPayer),
        inputValue: amount,
        amount,
        percentage,
        shares: 1,
      };
    });
  } else if (splitType === 'exact') {
    // Each participant has an exact rupee amount
    calculatedItems = normalizedParticipants.map((p) => {
      const rawVal = values[p.id];
      const amount =
        typeof rawVal === 'number' && !isNaN(rawVal) ? roundMoney(Math.max(0, rawVal)) : 0;
      const percentage = safeTotal > 0 ? roundMoney((amount / safeTotal) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        isPayer: Boolean(p.isPayer),
        inputValue: amount,
        amount,
        percentage,
        shares: amount,
      };
    });
  } else if (splitType === 'percentage') {
    // Each participant has a percentage (0 - 100%)
    calculatedItems = normalizedParticipants.map((p) => {
      const rawVal = values[p.id];
      const pct =
        typeof rawVal === 'number' && !isNaN(rawVal) ? roundMoney(Math.max(0, rawVal)) : 0;
      const amount = roundMoney((safeTotal * pct) / 100);
      return {
        id: p.id,
        name: p.name,
        isPayer: Boolean(p.isPayer),
        inputValue: pct,
        amount,
        percentage: pct,
        shares: pct,
      };
    });
  } else if (splitType === 'shares') {
    // Each participant has a share count/weight (e.g. 1, 2, 0.5)
    const rawShares = normalizedParticipants.map((p) => {
      const rawVal = values[p.id];
      return typeof rawVal === 'number' && !isNaN(rawVal) && rawVal > 0 ? rawVal : 1;
    });
    const totalSharesWeight = roundMoney(rawShares.reduce((acc, s) => acc + s, 0));

    calculatedItems = normalizedParticipants.map((p, idx) => {
      const shareWeight = rawShares[idx];
      const shareRatio = totalSharesWeight > 0 ? shareWeight / totalSharesWeight : 0;
      const amount = roundMoney(safeTotal * shareRatio);
      const percentage = totalSharesWeight > 0 ? roundMoney(shareRatio * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        isPayer: Boolean(p.isPayer),
        inputValue: shareWeight,
        amount,
        percentage,
        shares: shareWeight,
      };
    });
  }

  // Derive sums and balance
  const selfItem = calculatedItems.find((item) => item.id === primaryUserId);
  const yourShare = selfItem ? selfItem.amount : 0;

  const peerItems = calculatedItems.filter((item) => item.id !== primaryUserId);
  const peerTotal = roundMoney(peerItems.reduce((acc, item) => acc + item.amount, 0));
  const totalAllocated = roundMoney(calculatedItems.reduce((acc, item) => acc + item.amount, 0));
  const remainingAmount = roundMoney(safeTotal - totalAllocated);

  const isUserPayer = effectivePaidById === primaryUserId;
  const payerItem = calculatedItems.find((item) => item.id === effectivePaidById);
  const payerName = payerItem?.name || (isUserPayer ? 'You' : 'Friend');

  let userOwedSummary = '';
  if (isUserPayer) {
    userOwedSummary =
      peerTotal > 0
        ? `Friends owe you ₹${peerTotal.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : 'All allocated';
  } else {
    userOwedSummary =
      yourShare > 0
        ? `You owe ${payerName} ₹${yourShare.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : 'All settled';
  }

  const percentageSum = roundMoney(calculatedItems.reduce((acc, item) => acc + item.percentage, 0));
  const totalShares = roundMoney(calculatedItems.reduce((acc, item) => acc + item.shares, 0));

  let isBalanced = false;
  let validationError: string | null = null;

  if (splitType === 'equal') {
    isBalanced = true;
  } else if (splitType === 'exact') {
    isBalanced = Math.abs(remainingAmount) < 0.01;
    if (!isBalanced) {
      if (remainingAmount > 0) {
        validationError = `₹${remainingAmount.toFixed(2)} remaining to allocate`;
      } else {
        validationError = `Over-allocated by ₹${Math.abs(remainingAmount).toFixed(2)}`;
      }
    }
  } else if (splitType === 'percentage') {
    const diff = roundMoney(100 - percentageSum);
    isBalanced = Math.abs(diff) < 0.05;
    if (!isBalanced) {
      if (diff > 0) {
        validationError = `${diff.toFixed(1)}% remaining to allocate`;
      } else {
        validationError = `Total percentage is ${percentageSum}% (exceeds 100%)`;
      }
    }
  } else if (splitType === 'shares') {
    isBalanced = totalShares > 0;
    if (!isBalanced) {
      validationError = 'Total shares must be greater than zero';
    }
  }

  return {
    participants: calculatedItems,
    yourShare,
    peerTotal,
    payerId: effectivePaidById,
    payerName,
    isUserPayer,
    userOwedSummary,
    totalAllocated,
    targetTotal: safeTotal,
    remainingAmount,
    isBalanced,
    percentageSum,
    totalShares,
    validationError,
  };
}

/**
 * Returns balanced initial input values for a given split type and participant set.
 */
export function getDefaultSplitInputValues(
  totalAmount: number,
  splitType: SplitType,
  participantIds: string[]
): Record<string, number> {
  const values: Record<string, number> = {};
  const count = participantIds.length;
  const safeTotal = roundMoney(Number(totalAmount) || 0);

  if (count === 0) return values;

  if (splitType === 'equal' || splitType === 'exact') {
    const base = roundMoney(Math.floor((safeTotal / count) * 100) / 100);
    const allocated = roundMoney(base * count);
    const remainder = roundMoney(safeTotal - allocated);
    const remainderCents = Math.round(remainder * 100);

    participantIds.forEach((id, idx) => {
      values[id] = roundMoney(base + (idx < remainderCents ? 0.01 : 0));
    });
  } else if (splitType === 'percentage') {
    const basePct = roundMoney(Math.floor((100 / count) * 100) / 100);
    const allocatedPct = roundMoney(basePct * count);
    const remainderPct = roundMoney(100 - allocatedPct);
    const remainderPoints = Math.round(remainderPct * 100);

    participantIds.forEach((id, idx) => {
      values[id] = roundMoney(basePct + (idx < remainderPoints ? 0.01 : 0));
    });
  } else if (splitType === 'shares') {
    participantIds.forEach((id) => {
      values[id] = 1;
    });
  }

  return values;
}

/**
 * Automatically adjusts the target participant's share to balance the split.
 * For exact amounts: sets target to (total - otherParticipantsSum).
 * For percentages: sets target to (100 - otherPercentagesSum).
 */
export function autoBalanceSplitValues(
  totalAmount: number,
  splitType: SplitType,
  participantIds: string[],
  currentValues: Record<string, number>,
  targetId = 'self'
): Record<string, number> {
  const next = { ...currentValues };
  const safeTotal = roundMoney(Number(totalAmount) || 0);

  if (splitType === 'exact') {
    const otherSum = roundMoney(
      participantIds
        .filter((id) => id !== targetId)
        .reduce((sum, id) => sum + (currentValues[id] ?? 0), 0)
    );
    next[targetId] = roundMoney(Math.max(0, safeTotal - otherSum));
  } else if (splitType === 'percentage') {
    const otherPct = roundMoney(
      participantIds
        .filter((id) => id !== targetId)
        .reduce((sum, id) => sum + (currentValues[id] ?? 0), 0)
    );
    next[targetId] = roundMoney(Math.max(0, 100 - otherPct));
  } else if (splitType === 'equal') {
    return getDefaultSplitInputValues(totalAmount, 'equal', participantIds);
  }

  return next;
}
