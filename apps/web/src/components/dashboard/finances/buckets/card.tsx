'use client';

import React from 'react';
import { CreateEntityCard, EntityCard, FooterRow } from '@/components/shared';
import { cn } from '@/libs/utils';
import { formatCardDate } from '@kalya/utils';
import type { Bucket } from '@kalya/types';
import {
  Clock3,
  History,
  PiggyBank,
  Sparkles,
  Tag,
  Home,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type BuiltInBucketKey = 'needs' | 'wants' | 'savings';
export type BucketKey = BuiltInBucketKey | (string & {});

export type BucketVisual = {
  label: string;
  text: string;
  bg: string;
  dot: string;
};

export function bucketVisual(bucket: string): BucketVisual {
  switch (bucket) {
    case 'needs':
      return {
        label: 'Needs',
        text: 'text-info',
        bg: 'bg-info-subtle',
        dot: 'bg-info',
      };
    case 'wants':
      return {
        label: 'Wants',
        text: 'text-warning',
        bg: 'bg-warning-subtle',
        dot: 'bg-warning',
      };
    case 'savings':
      return {
        label: 'Savings',
        text: 'text-success',
        bg: 'bg-success-subtle',
        dot: 'bg-success',
      };
    default:
      return {
        label: bucket,
        text: 'text-accent',
        bg: 'bg-accent-subtle',
        dot: 'bg-accent',
      };
  }
}

export function bucketIcon(bucket: string): LucideIcon {
  switch (bucket) {
    case 'needs':
      return Home;
    case 'wants':
      return Sparkles;
    case 'savings':
      return PiggyBank;
    default:
      return Wallet;
  }
}

export const BUILT_IN_BUCKET_COLOR: Record<string, string> = {
  needs: 'var(--info)',
  wants: 'var(--warning)',
  savings: 'var(--success)',
};

export function resolveBucketColor(bucket: Pick<Bucket, 'key' | 'color'>): string {
  return bucket.color ?? BUILT_IN_BUCKET_COLOR[bucket.key] ?? 'var(--accent)';
}

function safeFormatDate(value?: string | null): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return formatCardDate(value);
  } catch {
    return formatCardDate(value);
  }
}

export interface BucketCardProps {
  bucket: Bucket & {
    categoryCount?: number;
    category_count?: number;
    targetPercent?: number;
  };
  onEdit?: (bucket: Bucket) => void;
  onDelete?: (bucket: Bucket) => void;
  onClick?: (bucket: Bucket) => void;
  className?: string;
}

export function BucketCard({ bucket, onEdit, onDelete, onClick, className }: BucketCardProps) {
  const isBuiltIn = bucket.origin === 'built-in';
  const visual = bucketVisual(bucket.key);
  const Icon = isBuiltIn ? bucketIcon(bucket.key) : Wallet;
  const color = resolveBucketColor(bucket);
  const hasCustomColor = !isBuiltIn && Boolean(bucket.color);

  // Normalize snake_case / camelCase support
  const targetPercent =
    bucket.target_percent !== undefined && bucket.target_percent !== null
      ? Number(bucket.target_percent)
      : bucket.targetPercent !== undefined && bucket.targetPercent !== null
        ? Number(bucket.targetPercent)
        : undefined;

  const categoryCount = bucket.categoryCount ?? bucket.category_count;
  const createdAt = bucket.created_at ?? (bucket as any).createdAt;
  const updatedAt = bucket.updated_at ?? (bucket as any).updatedAt;

  return (
    <EntityCard
      color={color}
      className={className}
      onClick={onClick ? () => onClick(bucket) : undefined}
      icon={<Icon size={20} strokeWidth={2} style={hasCustomColor ? { color } : undefined} />}
      title={bucket.label}
      subtitle={
        <code className="text-caption text-text-muted mt-0.5 block truncate font-mono">
          {bucket.key}
        </code>
      }
      badges={
        <>
          {isBuiltIn && (
            <span className="text-caption bg-surface-raised text-text-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium border border-border/50">
              Built-in
            </span>
          )}
          {targetPercent !== undefined ? (
            <span
              className={cn(
                'text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium',
                !hasCustomColor && visual.bg,
                !hasCustomColor && visual.text
              )}
              style={
                hasCustomColor
                  ? {
                      backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
                      color,
                    }
                  : undefined
              }
            >
              <span
                className={cn('h-1.5 w-1.5 rounded-full', !hasCustomColor && visual.dot)}
                style={hasCustomColor ? { backgroundColor: color } : undefined}
                aria-hidden
              />
              {targetPercent}% target
            </span>
          ) : (
            !isBuiltIn && (
              <span className="text-caption bg-surface-raised text-text-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium border border-border/50">
                No target set
              </span>
            )
          )}
          {categoryCount !== undefined && (
            <span className="text-caption bg-surface-raised text-text-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium border border-border/50">
              <Tag size={12} />
              {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
            </span>
          )}
        </>
      }
      progress={
        targetPercent !== undefined ? (
          <div className="bg-surface-raised h-1.5 w-full overflow-hidden rounded-full" aria-hidden>
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${Math.min(targetPercent, 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        ) : undefined
      }
      footer={
        createdAt || updatedAt ? (
          <>
            {createdAt && (
              <FooterRow
                icon={<Clock3 size={12} />}
                label="Added"
                value={safeFormatDate(createdAt)}
              />
            )}
            {updatedAt && (
              <FooterRow
                icon={<History size={12} />}
                label="Updated"
                value={safeFormatDate(updatedAt)}
              />
            )}
          </>
        ) : undefined
      }
      menuLabel={`Actions for ${bucket.label} bucket`}
      onEdit={onEdit ? () => onEdit(bucket) : undefined}
      // Built-ins never get a delete trigger, enforcing safety at the UI boundary
      onDelete={!isBuiltIn && onDelete ? () => onDelete(bucket) : undefined}
    />
  );
}

/** Backward-compatible typo alias */
export const BuckerCard = BucketCard;
export type BuckerCardProps = BucketCardProps;

export function CreateCustomBucketCard({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <CreateEntityCard
      icon={<Wallet size={22} strokeWidth={2.25} />}
      title="Create bucket"
      description="Add a spending bucket beyond needs/wants/savings"
      onClick={onClick}
      className={className}
    />
  );
}

export const CreateBucketCard = CreateCustomBucketCard;

export interface AllocationSegment {
  key: string;
  label: string;
  percent: number;
  color?: string;
  builtInKey?: BucketKey;
}

export function AllocationBar({
  segments,
  total,
  className,
}: {
  segments: AllocationSegment[];
  total: number;
  className?: string;
}) {
  const over = total > 100;
  const remainder = Math.max(0, 100 - total);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="border-border bg-surface-raised flex h-3 w-full overflow-hidden rounded-full border">
        {segments.map((s) => (
          <div
            key={s.key}
            className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
            style={{
              width: `${Math.min(Math.max(s.percent, 0), 100)}%`,
              backgroundColor:
                s.color ?? (s.builtInKey && BUILT_IN_BUCKET_COLOR[s.builtInKey]) ?? 'var(--accent)',
            }}
            title={`${s.label} · ${s.percent}%`}
          />
        ))}
        {!over && remainder > 0 && (
          <div
            className="h-full opacity-70"
            style={{
              width: `${remainder}%`,
              backgroundImage:
                'repeating-linear-gradient(135deg, var(--border) 0 4px, transparent 4px 8px)',
            }}
            title={`Unallocated · ${remainder}%`}
            aria-hidden
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {segments.map((s) => (
          <span key={s.key} className="text-caption text-text-secondary flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  s.color ??
                  (s.builtInKey && BUILT_IN_BUCKET_COLOR[s.builtInKey]) ??
                  'var(--accent)',
              }}
              aria-hidden
            />
            {s.label}
            <span className="font-numeric text-text-muted">{s.percent}%</span>
          </span>
        ))}
        <span className="text-caption font-numeric ml-auto">
          {over ? (
            <span className="text-danger font-medium">{total}% allocated — over 100%</span>
          ) : (
            <span className="text-text-muted">{total}% of 100% allocated</span>
          )}
        </span>
      </div>
    </div>
  );
}

export const BucketCardSkeleton = () => {
  return (
    <div
      className="border-border bg-surface flex max-w-90 flex-col overflow-hidden rounded-xl border"
      aria-hidden
    >
      <div className="bg-border/70 h-1 w-full" />
      <div className="flex items-center gap-3 p-5 pb-4">
        <div className="bg-surface-raised h-11 w-11 shrink-0 animate-pulse rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="bg-surface-raised h-4 w-2/3 animate-pulse rounded" />
          <div className="bg-surface-raised h-3 w-1/3 animate-pulse rounded" />
        </div>
      </div>
      <div className="flex gap-2 px-5 pb-4">
        <div className="bg-surface-raised h-6 w-20 animate-pulse rounded-full" />
        <div className="bg-surface-raised h-6 w-16 animate-pulse rounded-full" />
      </div>
      <div className="border-border mt-auto flex flex-col gap-1.5 border-t px-5 py-3">
        <div className="bg-surface-raised h-3 w-full animate-pulse rounded" />
        <div className="bg-surface-raised h-3 w-full animate-pulse rounded" />
      </div>
    </div>
  );
};
