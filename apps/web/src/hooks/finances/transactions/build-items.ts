import { roundMoney } from '@kalya/utils';
import type { Bucket, Category, Expense, Income, SplitContactMember } from '@kalya/types';
import type { PendingSplitShare } from '../shared/types';
import type {
  IncomeFeedItem,
  PersonalExpenseFeedItem,
  SplitBillFeedItem,
  SplitMemberShareDetail,
  UnifiedTransactionItem,
} from './types';

/* ── helpers ─────────────────────────────────────────────── */

const toNumber = (value: unknown): number => Number(value) || 0;
const formatINR = (amount: number): string => `₹${roundMoney(amount).toLocaleString('en-IN')}`;

function indexById<T extends { id?: string | null }>(list: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of list) {
    if (item.id) map.set(item.id, item);
  }
  return map;
}

/** Unsettled shares grouped by the expense they belong to. */
function groupPendingByExpense(shares: PendingSplitShare[]): Map<string, PendingSplitShare[]> {
  const map = new Map<string, PendingSplitShare[]>();
  for (const share of shares) {
    if (!share.expense_id || share.settled) continue;
    const list = map.get(share.expense_id);
    if (list) list.push(share);
    else map.set(share.expense_id, [share]);
  }
  return map;
}

interface Lookups {
  contactsById: Map<string, SplitContactMember>;
  pendingByExpenseId: Map<string, PendingSplitShare[]>;
}

interface Taxonomy {
  category?: Category;
  bucket?: Bucket;
}

/* ── mappers ─────────────────────────────────────────────── */

function toPersonalExpenseItem(
  exp: Expense,
  { category, bucket }: Taxonomy
): PersonalExpenseFeedItem {
  return {
    id: exp.id,
    kind: 'personal_expense',
    date: exp.date,
    createdAt: exp.created_at,
    description: exp.description,
    amount: toNumber(exp.amount),
    raw: exp,
    category,
    bucket,
    paymentMethod: exp.payment_method,
  };
}

function toSplitBillItem(
  exp: Expense,
  { category, bucket }: Taxonomy,
  { contactsById, pendingByExpenseId }: Lookups
): SplitBillFeedItem {
  const isUserPayer = !exp.paid_by;
  const payer = exp.paid_by ? contactsById.get(exp.paid_by) : undefined;
  const payerName = isUserPayer ? 'You' : payer?.name || 'Friend';

  const pending = pendingByExpenseId.get(exp.id) ?? [];
  const isSettled = pending.length === 0;

  const yourShare = toNumber(exp.your_share);
  const totalBill = toNumber(exp.amount);

  const resolveMember = (share: PendingSplitShare) =>
    share.member ?? contactsById.get(share.split_member_id);

  const members: SplitMemberShareDetail[] = pending.map((share) => {
    const member = resolveMember(share);
    return {
      shareId: share.id,
      memberId: share.split_member_id,
      memberName: member?.name || 'Friend',
      memberImage: member?.image,
      amount: toNumber(share.amount),
      settled: Boolean(share.settled),
      settledAmount: toNumber(share.settled_amount),
      settledAt: share.settled_at,
    };
  });

  let pendingDuesNarration: string;
  let userOwesAmount = 0;
  let friendsOweUserAmount = 0;

  if (isUserPayer) {
    if (isSettled) {
      pendingDuesNarration = `All settled · Total ${formatINR(totalBill - yourShare)}`;
    } else {
      pendingDuesNarration = members
        .map((m) => `${m.memberName} owes ${formatINR(m.amount)}`)
        .join(', ');
      friendsOweUserAmount = members.reduce((sum, m) => sum + m.amount, 0);
    }
  } else if (isSettled) {
    pendingDuesNarration = `Settled with ${payerName}`;
  } else {
    userOwesAmount = yourShare;
    pendingDuesNarration = `You owe ${payerName} ${formatINR(yourShare)}`;
  }

  return {
    id: exp.id,
    kind: 'split_bill',
    date: exp.date,
    createdAt: exp.created_at,
    description: exp.description,
    amount: yourShare, // the primary amount shown is always YOUR share
    raw: exp,
    category,
    bucket,
    paymentMethod: exp.payment_method,
    isUserPayer,
    payerName,
    payerId: exp.paid_by ?? null,
    yourShare,
    totalBill,
    participantsCount: Math.max(members.length + 1, 2),
    members,
    pendingDuesNarration,
    isSettled,
    userOwesAmount,
    friendsOweUserAmount,
  };
}

function toIncomeItem(inc: Income): IncomeFeedItem {
  const total = toNumber(inc.total_income);
  return {
    id: inc.id,
    kind: 'income',
    date: inc.credit_date || `${inc.month}-01`,
    createdAt: inc.created_at,
    description: 'Monthly Salary & Inflow',
    amount: total,
    raw: inc,
    salary: toNumber(inc.salary),
    other: toNumber(inc.other),
    previousMonthLeft: toNumber(inc.previous_month_left),
    totalIncome: total,
    creditDate: inc.credit_date,
    month: inc.month,
  };
}

/* ── public ──────────────────────────────────────────────── */

export interface BuildItemsInput {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  buckets: Bucket[];
  contacts: SplitContactMember[];
  pendingShares: PendingSplitShare[];
}

/** Raw API data -> one hydrated, unified feed. Pure, no React. */
export function buildTransactionItems({
  expenses,
  incomes,
  categories,
  buckets,
  contacts,
  pendingShares,
}: BuildItemsInput): UnifiedTransactionItem[] {
  const categoriesById = indexById(categories);
  const bucketsById = indexById(buckets);
  const lookups: Lookups = {
    contactsById: indexById(contacts),
    pendingByExpenseId: groupPendingByExpense(pendingShares),
  };

  const items: UnifiedTransactionItem[] = [];

  for (const exp of expenses) {
    const category = exp.category_id ? categoriesById.get(exp.category_id) : undefined;
    const bucket = category?.bucket_id ? bucketsById.get(category.bucket_id) : undefined;
    const taxonomy: Taxonomy = { category, bucket };

    items.push(
      exp.is_split ? toSplitBillItem(exp, taxonomy, lookups) : toPersonalExpenseItem(exp, taxonomy)
    );
  }

  for (const inc of incomes) {
    items.push(toIncomeItem(inc));
  }

  return items;
}
