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
    const allocated = baseShare * count;
    const remainder = roundMoney(safeTotal - allocated);

    return participants.map((p, idx) => ({
      memberId: p.memberId,
      // Allocate the remaining pennies to first participants
      amount: roundMoney(baseShare + (idx < Math.round(remainder * 100) ? 0.01 : 0)),
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
    if (totalShares <= 0) return [];

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
