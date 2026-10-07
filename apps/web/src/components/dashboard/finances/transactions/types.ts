import type {
  Bucket,
  Category,
  Expense,
  Income,
  PaymentMethod,
  SplitContactMember,
  SplitExpense,
} from '@kalya/types';

export type TransactionTab = 'all' | 'expense' | 'split' | 'income';

export type SplitStatusFilter = 'all' | 'pending' | 'settled';

export type DateRangePreset = 'this-month' | 'last-month' | 'all' | 'custom';

export type TransactionSortOption =
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
  categoryId: string | null;
  categoryIds?: string[];
  bucketId: string | null;
  paymentMethod: PaymentMethod | 'all';
  paymentMethods?: (PaymentMethod | 'all')[];
  kinds?: UnifiedTransactionKind[];
  minAmount?: number;
  maxAmount?: number;
  dateRange: DateRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  splitStatus: SplitStatusFilter;
  sortBy: TransactionSortOption;
}

export const INITIAL_TRANSACTION_FILTERS: TransactionFilterState = {
  searchQuery: '',
  categoryId: null,
  categoryIds: [],
  bucketId: null,
  paymentMethod: 'all',
  paymentMethods: [],
  kinds: [],
  minAmount: undefined,
  maxAmount: undefined,
  dateRange: 'this-month',
  customStartDate: undefined,
  customEndDate: undefined,
  splitStatus: 'all',
  sortBy: 'date-desc',
};

export type UnifiedTransactionKind = 'personal_expense' | 'split_bill' | 'income';

export interface BaseTransactionFeedItem {
  id: string;
  kind: UnifiedTransactionKind;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO Timestamp
  description: string;
  amount: number;
}

export interface PersonalExpenseFeedItem extends BaseTransactionFeedItem {
  kind: 'personal_expense';
  raw: Expense;
  category?: Category;
  bucket?: Bucket;
  paymentMethod?: PaymentMethod | null;
}

export interface SplitMemberShareDetail {
  memberId: string;
  memberName: string;
  memberImage?: string | null;
  amount: number;
  settled: boolean;
  settledAmount?: number | null;
  settledAt?: string | null;
}

export interface SplitBillFeedItem extends BaseTransactionFeedItem {
  kind: 'split_bill';
  raw: Expense;
  category?: Category;
  bucket?: Bucket;
  paymentMethod?: PaymentMethod | null;
  isUserPayer: boolean;
  payerName: string;
  payerId: string | null;
  yourShare: number;
  totalBill: number;
  participantsCount: number;
  members: SplitMemberShareDetail[];
  pendingDuesNarration: string;
  isSettled: boolean;
  userOwesAmount: number;
  friendsOweUserAmount: number;
}

export interface IncomeFeedItem extends BaseTransactionFeedItem {
  kind: 'income';
  raw: Income;
  salary: number;
  other: number;
  previousMonthLeft: number;
  totalIncome: number;
  creditDate: string;
  month: string;
}

export type UnifiedTransactionItem = PersonalExpenseFeedItem | SplitBillFeedItem | IncomeFeedItem;

export interface DayTransactionGroup {
  date: string;
  label: string; // e.g. "Today - 3 Oct 2026"
  totalOutflow: number; // your share + personal expenses
  totalInflow: number; // total income
  items: UnifiedTransactionItem[];
}

export interface TransactionSummaryMetrics {
  totalIncome: number;
  totalSpentPersonal: number;
  friendsOweYou: number;
  youOwe: number;
  netCashflow: number;
}
