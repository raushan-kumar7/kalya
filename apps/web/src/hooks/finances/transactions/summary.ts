import { roundMoney } from '@kalya/utils';
import type { TransactionSummaryMetrics, UnifiedTransactionItem } from './types';
import { getItemMonth } from './date';

/** Amount that counts as "spent" for the user: personal amount, or only your share of a split. */
export function spentAmount(item: UnifiedTransactionItem): number {
  if (item.kind === 'personal_expense') return item.amount;
  if (item.kind === 'split_bill') return item.yourShare;
  return 0;
}

/**
 * Summary strip for the selected month.
 * - income / spent: only items that belong to `selectedMonth`
 * - friendsOweYou / youOwe: running balances across ALL months (open dues
 *   do not disappear when you navigate away from the month they were created)
 */
export function computeSummaryMetrics(
  items: UnifiedTransactionItem[],
  selectedMonth: string
): TransactionSummaryMetrics {
  let totalIncome = 0;
  let totalSpentPersonal = 0;
  let friendsOweYou = 0;
  let youOwe = 0;

  for (const item of items) {
    const inMonth = getItemMonth(item) === selectedMonth;

    if (item.kind === 'income') {
      if (inMonth) totalIncome += item.totalIncome;
      continue;
    }

    if (inMonth) totalSpentPersonal += spentAmount(item);

    if (item.kind === 'split_bill') {
      friendsOweYou += item.friendsOweUserAmount;
      youOwe += item.userOwesAmount;
    }
  }

  return {
    totalIncome: roundMoney(totalIncome),
    totalSpentPersonal: roundMoney(totalSpentPersonal),
    friendsOweYou: roundMoney(friendsOweYou),
    youOwe: roundMoney(youOwe),
    netCashflow: roundMoney(totalIncome - totalSpentPersonal),
  };
}

/** Footer totals for whatever is currently filtered. */
export function computeFilteredTotals(items: UnifiedTransactionItem[]) {
  let income = 0;
  let spent = 0;
  let friendsOwe = 0;

  for (const item of items) {
    if (item.kind === 'income') {
      income += item.totalIncome;
    } else {
      spent += spentAmount(item);
      if (item.kind === 'split_bill' && item.isUserPayer && !item.isSettled) {
        friendsOwe += item.friendsOweUserAmount;
      }
    }
  }

  return {
    rowsCount: items.length,
    income: roundMoney(income),
    spent: roundMoney(spent),
    friendsOwe: roundMoney(friendsOwe),
  };
}
