'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import { Badge } from '@/components/ui/data-display/badge';
import { EmptyState } from '@/components/ui/states/empty-state';
import { formatCardDate } from '@kalya/utils';
import { toPlainDate } from '@/components/ui/utilities/calendar';
import { formatInr } from '@kalya/utils';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type {
  AssetAllocationRecord,
  BucketAllocationRecord,
  BudgetStatusRecord,
  CategoryBreakdownRecord,
  ExpenseTableRecord,
  GoalStatusRecord,
  IncomeTableRecord,
} from './types';

function formatDateDisplay(dateStr: string) {
  try {
    const pd = toPlainDate(dateStr);
    return pd ? formatCardDate(pd) : dateStr;
  } catch {
    return dateStr;
  }
}

// ============================================================
// 1. INCOME TABLE VIEW
// Date, source, account, amount
// ============================================================

export function IncomeTableView({
  records,
  searchQuery,
}: {
  records: IncomeTableRecord[];
  searchQuery?: string;
}) {
  const filtered = records.filter(
    (r) =>
      !searchQuery ||
      r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.account.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6 text-text-muted" />}
        title="No income transactions"
        description="No matching income items found for this period."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-36">Date</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Account / Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-numeric text-text-secondary">
              {formatDateDisplay(item.date)}
            </TableCell>
            <TableCell className="font-medium text-text-primary">{item.source}</TableCell>
            <TableCell className="text-text-muted">
              <Badge variant="subtle" size="sm">
                {item.account}
              </Badge>
            </TableCell>
            <TableCell className="font-numeric font-semibold text-right text-emerald-600 dark:text-emerald-400">
              +{formatInr(item.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 2. EXPENSES TABLE VIEW
// Date, merchant, category, bucket, amount
// ============================================================

export function ExpensesTableView({
  records,
  searchQuery,
  onSelectRow,
}: {
  records: ExpenseTableRecord[];
  searchQuery?: string;
  onSelectRow?: (item: ExpenseTableRecord) => void;
}) {
  const filtered = records.filter(
    (r) =>
      !searchQuery ||
      r.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bucket.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6 text-text-muted" />}
        title="No expenses logged"
        description="No matching expense items found for this period."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-36">Date</TableHead>
          <TableHead>Merchant / Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Bucket</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => onSelectRow?.(item)}
            className={onSelectRow ? 'cursor-pointer hover:bg-surface-raised' : undefined}
          >
            <TableCell className="font-numeric text-text-secondary">
              {formatDateDisplay(item.date)}
            </TableCell>
            <TableCell className="font-medium text-text-primary">{item.merchant}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.categoryColor }}
                />
                <span className="text-text-secondary">{item.category}</span>
              </div>
            </TableCell>
            <TableCell className="text-text-muted">
              <Badge variant="subtle" size="sm">
                {item.bucket}
              </Badge>
            </TableCell>
            <TableCell className="font-numeric font-semibold text-right text-text-primary">
              {formatInr(item.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 3. BUCKETS TABLE VIEW
// Bucket, allocated, spent, remaining
// ============================================================

export function BucketsTableView({
  records,
  searchQuery,
}: {
  records: BucketAllocationRecord[];
  searchQuery?: string;
}) {
  const filtered = records.filter(
    (r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bucket</TableHead>
          <TableHead>Target Allocation</TableHead>
          <TableHead className="text-right">Allocated Limit</TableHead>
          <TableHead className="text-right">Spent Outlay</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-semibold text-text-primary flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </TableCell>
            <TableCell className="text-text-secondary">{item.targetPct}% of Income</TableCell>
            <TableCell className="font-numeric text-right text-text-secondary">
              {formatInr(item.allocated)}
            </TableCell>
            <TableCell className="font-numeric font-semibold text-right text-text-primary">
              {formatInr(item.spent)}
            </TableCell>
            <TableCell
              className={`font-numeric font-semibold text-right ${
                item.remaining >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatInr(item.remaining)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 4. CATEGORIES TABLE VIEW
// Category, amount, % of total, change
// ============================================================

export function CategoriesTableView({
  records,
  searchQuery,
  onSelectCategory,
}: {
  records: CategoryBreakdownRecord[];
  searchQuery?: string;
  onSelectCategory?: (category: CategoryBreakdownRecord) => void;
}) {
  const filtered = records.filter(
    (r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6 text-text-muted" />}
        title="No categories"
        description="No matching category entries found."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead className="text-center">Count</TableHead>
          <TableHead className="text-right">% of Total</TableHead>
          <TableHead className="text-right">Change vs Prev</TableHead>
          <TableHead className="text-right">Total Outlay</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => onSelectCategory?.(item)}
            className="cursor-pointer hover:bg-surface-raised"
          >
            <TableCell className="font-medium text-text-primary flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </TableCell>
            <TableCell className="font-numeric text-center text-text-muted">{item.count}</TableCell>
            <TableCell className="font-numeric text-right text-text-secondary">
              {item.percent.toFixed(1)}%
            </TableCell>
            <TableCell className="font-numeric text-right">
              {item.hasComparison ? (
                <span
                  className={
                    item.changePct > 0
                      ? 'text-rose-600 dark:text-rose-400 font-medium'
                      : 'text-emerald-600 dark:text-emerald-400 font-medium'
                  }
                >
                  {item.changePct > 0 ? `+${item.changePct}%` : `${item.changePct}%`}
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </TableCell>
            <TableCell className="font-numeric font-semibold text-right text-text-primary">
              {formatInr(item.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 5. BUDGETS TABLE VIEW
// Budget, limit, spent, remaining, status
// ============================================================

export function BudgetsTableView({
  records,
  searchQuery,
}: {
  records: BudgetStatusRecord[];
  searchQuery?: string;
}) {
  const router = useRouter();
  const filtered = records.filter(
    (r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Budget</TableHead>
          <TableHead className="text-right">Limit</TableHead>
          <TableHead className="text-right">Spent</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item) => {
          const isOver = item.status === 'over';
          const isWarning = item.status === 'warning';

          return (
            <TableRow
              key={item.id}
              onClick={() => router.push('/dashboard/budgets')}
              className="cursor-pointer hover:bg-surface-raised"
            >
              <TableCell className="font-semibold text-text-primary">{item.name}</TableCell>
              <TableCell className="font-numeric text-right text-text-secondary">
                {formatInr(item.limit)}
              </TableCell>
              <TableCell className="font-numeric font-semibold text-right text-text-primary">
                {formatInr(item.spent)}
              </TableCell>
              <TableCell
                className={`font-numeric font-semibold text-right ${
                  item.remaining >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatInr(item.remaining)}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={isOver ? 'danger' : isWarning ? 'warning' : 'success'} size="sm">
                  {isOver ? 'Over Limit' : isWarning ? 'Caution' : 'On Track'}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 6. GOALS TABLE VIEW
// Goal, target, saved, ETA
// ============================================================

export function GoalsTableView({
  records,
  searchQuery,
}: {
  records: GoalStatusRecord[];
  searchQuery?: string;
}) {
  const router = useRouter();
  const filtered = records.filter(
    (r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Goal</TableHead>
          <TableHead className="text-right">Target Amount</TableHead>
          <TableHead className="text-right">Saved</TableHead>
          <TableHead className="text-center">Progress</TableHead>
          <TableHead className="text-right">Target Date (ETA)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => router.push('/dashboard/goals')}
            className="cursor-pointer hover:bg-surface-raised"
          >
            <TableCell className="font-semibold text-text-primary">{item.name}</TableCell>
            <TableCell className="font-numeric text-right text-text-secondary">
              {formatInr(item.target)}
            </TableCell>
            <TableCell className="font-numeric font-semibold text-right text-emerald-600 dark:text-emerald-400">
              {formatInr(item.saved)}
            </TableCell>
            <TableCell className="font-numeric text-center">
              <Badge variant="subtle" size="sm">
                {Math.round(item.pct)}%
              </Badge>
            </TableCell>
            <TableCell className="text-right text-text-muted font-numeric">{item.eta}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============================================================
// 7. ASSETS TABLE VIEW
// Asset, value, change, allocation %
// ============================================================

export function AssetsTableView({
  records,
  searchQuery,
}: {
  records: AssetAllocationRecord[];
  searchQuery?: string;
}) {
  const router = useRouter();
  const filtered = records.filter(
    (r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset Class</TableHead>
          <TableHead className="text-right">Allocation %</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Holding Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => router.push('/dashboard/assets')}
            className="cursor-pointer hover:bg-surface-raised"
          >
            <TableCell className="font-semibold text-text-primary flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </TableCell>
            <TableCell className="font-numeric text-right text-text-secondary">
              {item.allocationPct.toFixed(1)}%
            </TableCell>
            <TableCell className="font-numeric text-right text-emerald-600 dark:text-emerald-400 font-medium">
              +{item.change}%
            </TableCell>
            <TableCell className="font-numeric font-semibold text-right text-text-primary">
              {formatInr(item.value)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
