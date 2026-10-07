import type {
  Bucket,
  Category,
  Expense,
  Income,
  SplitContactMember,
  SplitExpense,
} from '@kalya/types';

/* ── feed items (discriminated by `kind`) ─────────────────── */

export type TransactionKind = 'personal_expense' | 'split_bill' | 'income';

/** Fields every row of the unified feed has. */
interface BaseFeedItem {
  id: string;
  /** 'YYYY-MM-DD' */
  date: string;
  createdAt?: string;
  description: string;
  /** Primary amount shown in lists: personal amount, YOUR share of a split, or total income. */
  amount: number;
}

/** Shared by the two expense kinds (income has no taxonomy / payment method). */
interface ExpenseFeedFields {
  raw: Expense;
  category?: Category;
  bucket?: Bucket;
  paymentMethod: Expense['payment_method'];
}

export interface PersonalExpenseFeedItem extends BaseFeedItem, ExpenseFeedFields {
  kind: 'personal_expense';
}

export interface SplitMemberShareDetail {
  shareId: string;
  memberId: string;
  memberName: string;
  memberImage?: SplitContactMember['image'];
  amount: number;
  settled: boolean;
  settledAmount: number;
  settledAt: SplitExpense['settled_at'];
}

export interface SplitBillFeedItem extends BaseFeedItem, ExpenseFeedFields {
  kind: 'split_bill';
  isUserPayer: boolean;
  payerName: string;
  payerId: string | null;
  yourShare: number;
  totalBill: number;
  participantsCount: number;
  members: SplitMemberShareDetail[];
  pendingDuesNarration: string;
  isSettled: boolean;
  /** What you owe the payer (0 when you paid or it is settled). */
  userOwesAmount: number;
  /** What friends owe you (0 when a friend paid or it is settled). */
  friendsOweUserAmount: number;
}

export interface IncomeFeedItem extends BaseFeedItem {
  kind: 'income';
  raw: Income;
  salary: number;
  other: number;
  previousMonthLeft: number;
  totalIncome: number;
  creditDate: Income['credit_date'];
  /** 'YYYY-MM', the month this income belongs to. */
  month: string;
}

export type UnifiedTransactionItem = PersonalExpenseFeedItem | SplitBillFeedItem | IncomeFeedItem;

/* ── filters ──────────────────────────────────────────────── */

/** Row tabs: 'all' plus one per feed kind. */
export type TransactionTab = 'all' | 'expense' | 'split' | 'income';

export type TransactionDateRange = 'this-month' | 'last-month' | 'custom' | 'all';

export type SplitStatusFilter = 'all' | 'pending' | 'settled';

export type PaymentMethodFilter = NonNullable<Expense['payment_method']> | 'all';

export type TransactionSortBy =
  | 'date-desc'
  | 'date-asc'
  | 'amount-desc'
  | 'amount-asc'
  | 'description-asc'
  | 'description-desc'
  | 'category-asc'
  | 'category-desc';

export interface TransactionFilterState {
  searchQuery: string;
  dateRange: TransactionDateRange;
  /** 'YYYY-MM-DD', used when dateRange is 'custom'. */
  customStartDate?: string;
  customEndDate?: string;
  categoryId?: string;
  categoryIds?: string[];
  bucketId?: string;
  paymentMethod?: PaymentMethodFilter;
  paymentMethods?: PaymentMethodFilter[];
  kinds?: TransactionKind[];
  minAmount?: number;
  maxAmount?: number;
  splitStatus: SplitStatusFilter;
  sortBy: TransactionSortBy;
}

/* ── derived views ────────────────────────────────────────── */

export interface DayTransactionGroup {
  /** 'YYYY-MM-DD' */
  date: string;
  /** 'Today - 6 Oct 2026', 'Yesterday - ...', or a plain card date. */
  label: string;
  totalOutflow: number;
  totalInflow: number;
  items: UnifiedTransactionItem[];
}

export interface TransactionSummaryMetrics {
  totalIncome: number;
  totalSpentPersonal: number;
  friendsOweYou: number;
  youOwe: number;
  netCashflow: number;
}

export const INITIAL_TRANSACTION_FILTERS: TransactionFilterState = {
  searchQuery: '',
  dateRange: 'this-month',
  splitStatus: 'all',
  sortBy: 'date-desc',
};
