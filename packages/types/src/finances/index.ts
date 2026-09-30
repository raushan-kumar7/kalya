import {
  BudgetPeriod,
  BudgetStatus,
  Decimal,
  DigitalAssetType,
  ExchangeType,
  GoalStatus,
  Identifiable,
  ISODate,
  ISOTimestamp,
  MonthString,
  Origin,
  PaymentMethod,
  SettlementMethod,
  SplitType,
  Timestamps,
  UUID,
} from '../core';

// ============================================================================
// Core Finance Entities
// ============================================================================

/**
 * Top-level budgetary allocation bucket (e.g., Needs, Wants, Savings).
 */
export interface Bucket extends Identifiable, Timestamps {
  /** Owning user */
  user_id: UUID;
  /** Machine-readable slug key, e.g. 'needs' | 'wants' | 'savings' */
  key: string;
  /** Human-readable display title */
  label: string;
  /** Source classification ('built-in' or 'custom') */
  origin: Origin;
  /** Target percentage of net income (e.g. 50.0 for 50%) */
  target_percent?: Decimal | null;
  /** Optional hex or theme color code */
  color?: string | null;
  /** Optional icon identifier or ligature */
  icon?: string | null;
}

/**
 * Transactional categorization node nested under a parent bucket.
 */
export interface Category extends Identifiable, Timestamps {
  /** Owning user */
  user_id: UUID;
  /** Foreign key pointing to Bucket.id */
  bucket_id: UUID;
  /** Machine-readable slug key, e.g. 'groceries' | 'rent' */
  key: string;
  /** Human-readable label */
  label: string;
  /** Source classification ('built-in' or 'custom') */
  origin: Origin;
  /** Category theme color hex */
  color?: string | null;
  /** Category icon name/identifier */
  icon?: string | null;
}

/**
 * Monthly income record capturing all earnings for budget distribution.
 */
export interface Income extends Identifiable, Timestamps {
  /** Owning user */
  user_id: UUID;
  /** ISO Date the income was credited */
  credit_date: ISODate;
  /** Calendar month represented in 'YYYY-MM' format */
  month: MonthString;
  /** Primary salary earnings */
  salary: Decimal;
  /** Secondary or freelance earnings */
  other: Decimal;
  /** Carry-over balance from previous month */
  previous_month_left: Decimal;
  /** Derived total available: salary + other + previous_month_left */
  total_income: Decimal;
}

/**
 * Budget boundary plan for a specific bucket and income period.
 */
export interface Budget extends Identifiable, Timestamps {
  /** Owning user */
  user_id: UUID;
  /** Foreign key pointing to Bucket.id */
  bucket_id: UUID;
  /** Foreign key pointing to Income.id */
  income_id: UUID;
  /** Budget period cadence */
  period: BudgetPeriod;
  /** Allocated target amount (Derived: income.total_income * bucket.target_percent / 100) */
  amount: Decimal;
  /** Consumption threshold percentage for caution warnings (e.g. 80%) */
  alert_threshold_amber: Decimal;
  /** Consumption threshold percentage for overspent alerts (e.g. 100%) */
  alert_threshold_red: Decimal;
  /** Whether unspent budget rolls over to subsequent cycle */
  rollover: boolean;
  /** Real-time budget health status */
  status: BudgetStatus;
}

/**
 * Recorded transaction of outgoing funds.
 */
export interface Expense extends Identifiable, Timestamps {
  /** Owning user */
  user_id: UUID;
  /** Date transaction occurred */
  date: ISODate;
  /** Foreign key pointing to Category.id */
  category_id: UUID;
  /** Descriptive narration of the spend */
  description: string;
  /** Total transaction monetary value */
  amount: Decimal;
  /** Payment instrument used */
  payment_method?: PaymentMethod | null;
  /** Whether this expense is split with peers */
  is_split: boolean;
  /** Foreign key pointing to SplitContactMember.id, or null if paid by logged-in user */
  paid_by?: UUID | null;
  /** Share of this expense owed or paid by the logged-in user */
  your_share: Decimal;
  /** Algorithm used for splitting */
  split_type: SplitType;
}

/**
 * Peer contact participant in split expenses.
 */
export interface SplitContactMember extends Identifiable, Timestamps {
  /** User who added this contact */
  user_id: UUID;
  /** Contact full display name */
  name?: string | null;
  /** Contact phone number */
  phone?: string | null;
  /** Contact email address */
  email?: string | null;
  /** Contact avatar or image URL */
  image?: string | null;
  /** Whether linked to an active Kalya registered user account */
  is_linked: boolean;
}

/**
 * Ledger entry tracking an individual participant's share in a split expense.
 */
export interface SplitExpense extends Identifiable {
  /** Owning user */
  user_id: UUID;
  /** Foreign key pointing to Expense.id */
  expense_id: UUID;
  /** Foreign key pointing to SplitContactMember.id */
  split_member_id: UUID;
  /** Assigned monetary obligation */
  amount?: Decimal | null;
  /** Amount successfully reimbursed */
  settled_amount?: Decimal | null;
  /** Whether the share has been completely paid off */
  settled: boolean;
  /** Payment method used to settle the balance */
  settled_via?: SettlementMethod | null;
  /** Timestamp when final settlement was completed */
  settled_at?: ISOTimestamp | null;
}

/**
 * Financial savings objective targeting a designated future date.
 */
export interface Goal extends Identifiable, Timestamps {
  /** Owning user */
  user_id: UUID;
  /** Target bucket this goal draws from (typically 'savings') */
  bucket_id: UUID;
  /** Goal name / title */
  name: string;
  /** Target financial amount */
  target_amount: Decimal;
  /** Desired target completion date (YYYY-MM-DD) */
  target_date: ISODate;
  /** Current progress balance accumulated toward target */
  current_progress: Decimal;
  /** Recommended or planned monthly contribution */
  monthly_contribution_plan: Decimal;
  /** Goal progress status */
  status: GoalStatus;
}

/** Per-bucket snapshot stored in monthly_summary.bucket_totals (keyed by bucket_id). */
export interface BucketTotalSnapshot {
  spent: Decimal;
  budgeted: Decimal;
  status: BudgetStatus;
}

/** Per-category snapshot stored in monthly_summary.category_totals (keyed by category_id). */
export interface CategoryTotalSnapshot {
  spent: Decimal;
}

/**
 * Aggregated monthly ledger statement.
 */
export interface MonthlySummary extends Identifiable {
  /** Owning user */
  user_id: UUID;
  /** Calendar month (YYYY-MM) */
  month: MonthString;
  /** Start of statement period */
  period_start: ISODate;
  /** End of statement period */
  period_end: ISODate;
  /** Map of bucket UUID to summarized status */
  bucket_totals: Record<UUID, BucketTotalSnapshot>;
  /** Map of category UUID to expenditure */
  category_totals: Record<UUID, CategoryTotalSnapshot>;
  /** Grand total spent during statement window */
  total_spent: Decimal;
  /** Timestamp summary was generated */
  generated_at: ISOTimestamp;
}

/**
 * Precious metals or digital commodities asset ledger.
 */
export interface DigitalAsset extends Identifiable, Timestamps {
  /** Owning user */
  user_id: UUID;
  /** Asset commodity type */
  type: DigitalAssetType;
  /** Purchase date */
  date: ISODate;
  /** Provider / broker platform */
  platform: string;
  /** Purchase price per gram */
  rate_per_gram: Decimal;
  /** Gross price paid */
  amount_paid: Decimal;
  /** GST tax amount paid (3%) */
  gst_3_percent: Decimal;
  /** Acquired weight in grams */
  weight_in_gram: Decimal;
  /** Current market valuation */
  asset_value: Decimal;
}

/**
 * Public equities / shares portfolio holding.
 */
export interface EquityAsset extends Identifiable, Timestamps {
  /** Owning user */
  user_id: UUID;
  /** Stock exchange */
  exchange_type: ExchangeType;
  /** Transaction date */
  date: ISODate;
  /** Listed company name or ticker symbol */
  company: string;
  /** Purchase price per share */
  price_per_share: Decimal;
  /** Number of shares acquired */
  total_shared: number;
  /** Derived total: price_per_share * total_shared */
  total_amount: Decimal;
}

// ============================================================================
// Data Transfer Objects (DTOs) & Payloads
// ============================================================================

/** Input DTO for creating a new Bucket */
export interface CreateBucketDto {
  key: string;
  label: string;
  origin?: Origin;
  target_percent?: Decimal | null;
  color?: string | null;
  icon?: string | null;
}

/** Input DTO for updating a Bucket */
export interface UpdateBucketDto {
  key?: string;
  label?: string;
  origin?: Origin;
  target_percent?: Decimal | null;
  color?: string | null;
  icon?: string | null;
}

/** Input DTO for creating a new Category */
export interface CreateCategoryDto {
  bucket_id: UUID;
  key: string;
  label: string;
  origin?: Origin;
  color?: string | null;
  icon?: string | null;
}

/** Input DTO for updating a Category */
export interface UpdateCategoryDto {
  bucket_id?: UUID;
  key?: string;
  label?: string;
  origin?: Origin;
  color?: string | null;
  icon?: string | null;
}

/** Input DTO for registering monthly Income */
export interface CreateIncomeDto {
  credit_date: ISODate;
  month: MonthString;
  salary: Decimal;
  other?: Decimal;
  previous_month_left?: Decimal;
  total_income?: Decimal;
}

/** Input DTO for updating monthly Income */
export interface UpdateIncomeDto {
  credit_date?: ISODate;
  month?: MonthString;
  salary?: Decimal;
  other?: Decimal;
  previous_month_left?: Decimal;
  total_income?: Decimal;
}

/** Filter criteria for income queries */
export interface IncomeFilterQueryDto {
  month?: MonthString;
  from?: ISODate;
  to?: ISODate;
  limit?: number;
  offset?: number;
}

/** Input DTO for creating a Budget */
export interface CreateBudgetDto {
  bucket_id: UUID;
  income_id: UUID;
  period?: BudgetPeriod;
  amount: Decimal;
  alert_threshold_amber?: Decimal;
  alert_threshold_red?: Decimal;
  rollover?: boolean;
  status?: BudgetStatus;
}

/** Input DTO for updating an existing Budget */
export interface UpdateBudgetDto {
  bucket_id?: UUID;
  income_id?: UUID;
  period?: BudgetPeriod;
  amount?: Decimal;
  alert_threshold_amber?: Decimal;
  alert_threshold_red?: Decimal;
  rollover?: boolean;
  status?: BudgetStatus;
}

/** Filter query for budget queries */
export interface BudgetFilterQueryDto {
  bucket_id?: UUID;
  income_id?: UUID;
  period?: BudgetPeriod;
  status?: BudgetStatus;
}

/** Input item when creating a split expense share */
export interface SplitExpenseShareInput {
  split_member_id: UUID;
  amount?: Decimal;
  settled?: boolean;
}

/** Input DTO for creating an Expense */
export interface CreateExpenseDto {
  date: ISODate;
  category_id: UUID;
  description: string;
  amount: Decimal;
  payment_method?: PaymentMethod | null;
  is_split?: boolean;
  paid_by?: UUID | null;
  your_share?: Decimal;
  split_type?: SplitType;
  splits?: SplitExpenseShareInput[];
}

/** Input DTO for updating an Expense */
export interface UpdateExpenseDto {
  date?: ISODate;
  category_id?: UUID;
  description?: string;
  amount?: Decimal;
  payment_method?: PaymentMethod | null;
  is_split?: boolean;
  paid_by?: UUID | null;
  your_share?: Decimal;
  split_type?: SplitType;
}

/** Filter criteria for expense list queries */
export interface ExpenseFilterQueryDto {
  category_id?: UUID;
  bucket_id?: UUID;
  from?: ISODate;
  to?: ISODate;
  is_split?: boolean;
  payment_method?: PaymentMethod;
  search?: string;
  min_amount?: Decimal;
  max_amount?: Decimal;
  limit?: number;
  offset?: number;
}

/** Input DTO for creating a Split Contact Member */
export interface CreateSplitContactMemberDto {
  name: string;
  phone?: string | null;
  email?: string | null;
  image?: string | null;
  is_linked?: boolean;
}

/** Input DTO for updating a Split Contact Member */
export interface UpdateSplitContactMemberDto {
  name?: string;
  phone?: string | null;
  email?: string | null;
  image?: string | null;
  is_linked?: boolean;
}

/** Input DTO for creating a Split Expense share */
export interface CreateSplitExpenseDto {
  expense_id: UUID;
  split_member_id: UUID;
  amount?: Decimal;
  settled_amount?: Decimal;
  settled?: boolean;
  settled_via?: SettlementMethod | null;
  settled_at?: ISOTimestamp | null;
}

/** Input DTO for updating a Split Expense share */
export interface UpdateSplitExpenseDto {
  amount?: Decimal;
  settled_amount?: Decimal;
  settled?: boolean;
  settled_via?: SettlementMethod | null;
  settled_at?: ISOTimestamp | null;
}

/** Input DTO for settling a split expense share */
export interface SettleSplitExpenseDto {
  settled_amount: Decimal;
  settled_via: SettlementMethod;
  settled_at?: ISOTimestamp;
}

/** Input DTO for creating a Goal */
export interface CreateGoalDto {
  bucket_id: UUID;
  name: string;
  target_amount: Decimal;
  target_date: ISODate;
  current_progress?: Decimal;
  monthly_contribution_plan?: Decimal;
  status?: GoalStatus;
}

/** Input DTO for updating a Goal */
export interface UpdateGoalDto {
  bucket_id?: UUID;
  name?: string;
  target_amount?: Decimal;
  target_date?: ISODate;
  current_progress?: Decimal;
  monthly_contribution_plan?: Decimal;
  status?: GoalStatus;
}

/** Filter query for goal queries */
export interface GoalFilterQueryDto {
  bucket_id?: UUID;
  status?: GoalStatus;
}

/** Input DTO for creating a Digital Asset transaction */
export interface CreateDigitalAssetDto {
  type: DigitalAssetType;
  date: ISODate;
  platform: string;
  rate_per_gram: Decimal;
  amount_paid: Decimal;
  gst_3_percent?: Decimal;
  weight_in_gram: Decimal;
  asset_value?: Decimal;
}

/** Input DTO for updating a Digital Asset */
export interface UpdateDigitalAssetDto {
  type?: DigitalAssetType;
  date?: ISODate;
  platform?: string;
  rate_per_gram?: Decimal;
  amount_paid?: Decimal;
  gst_3_percent?: Decimal;
  weight_in_gram?: Decimal;
  asset_value?: Decimal;
}

/** Filter query for digital asset records */
export interface DigitalAssetFilterQueryDto {
  type?: DigitalAssetType;
  platform?: string;
  from?: ISODate;
  to?: ISODate;
}

/** Input DTO for creating an Equity Asset purchase */
export interface CreateEquityAssetDto {
  exchange_type: ExchangeType;
  date: ISODate;
  company: string;
  price_per_share: Decimal;
  total_shared: number;
  total_amount?: Decimal;
}

/** Input DTO for updating an Equity Asset */
export interface UpdateEquityAssetDto {
  exchange_type?: ExchangeType;
  date?: ISODate;
  company?: string;
  price_per_share?: Decimal;
  total_shared?: number;
  total_amount?: Decimal;
}

/** Filter query for equity assets */
export interface EquityAssetFilterQueryDto {
  exchange_type?: ExchangeType;
  company?: string;
  from?: ISODate;
  to?: ISODate;
}

/** Input DTO for generating monthly financial statements */
export interface GenerateMonthlySummaryDto {
  month: MonthString;
  period_start?: ISODate;
  period_end?: ISODate;
}

/** Filter query for monthly summaries */
export interface MonthlySummaryFilterQueryDto {
  month?: MonthString;
  from?: ISODate;
  to?: ISODate;
}

/** High-level financial overview summary response */
export interface MonthlyFinancialOverview {
  month: MonthString;
  total_income: Decimal;
  total_expenses: Decimal;
  net_savings: Decimal;
  savings_rate: Decimal;
  budget_adherence_percent: Decimal;
  unsettled_split_amount: Decimal;
}
