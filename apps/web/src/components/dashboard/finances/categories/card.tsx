'use client';

import React from 'react';
import type { Bucket, Category } from '@kalya/types';
import {
  Banknote,
  Car,
  Clapperboard,
  Clock3,
  Coffee,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  History,
  Home,
  PiggyBank,
  Plane,
  Receipt,
  Repeat2,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Tag,
  UtensilsCrossed,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { bucketVisual, BUILT_IN_BUCKET_COLOR } from '../buckets/card';
import { CreateEntityCard, EntityCard, FooterRow } from '@/components/shared';
import { cn } from '@/libs/utils';
import { formatCardDate } from '@kalya/utils';

// Curated icon dictionary matching CategoryForm selection
const ICON_NAME_MAP: Record<string, LucideIcon> = {
  tag: Tag,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  utensils: UtensilsCrossed,
  coffee: Coffee,
  car: Car,
  home: Home,
  zap: Zap,
  film: Clapperboard,
  dumbbell: Dumbbell,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  plane: Plane,
  gift: Gift,
  briefcase: Banknote,
  sparkles: Sparkles,
  wrench: Wrench,
  smartphone: Smartphone,
  'book-open': GraduationCap,
  wifi: Wifi,
  repeat: Repeat2,
};

// Heuristic keyword matching for smart icon assignment
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/grocer|food|market/, ShoppingCart],
  [/rent|home|housing|mortgage/, Home],
  [/dining|restaurant|cafe|coffee/, UtensilsCrossed],
  [/transport|fuel|cab|uber|car/, Car],
  [/subscript|stream|membership/, Repeat2],
  [/health|medical|doctor|pharma/, HeartPulse],
  [/movie|entertain|game/, Clapperboard],
  [/shop|apparel|clothes/, ShoppingBag],
  [/electric|utilit|bill|power|water|wifi/, Zap],
  [/invest|mutual|stock|sip/, PiggyBank],
  [/salary|income|bonus/, Banknote],
  [/gift|donat/, Gift],
  [/school|course|tuition|book/, GraduationCap],
  [/gym|fit|workout/, Dumbbell],
  [/flight|travel|hotel|vacation/, Plane],
];

/**
 * Intelligent icon resolver: checks explicit icon name first, then keyword regex, and falls back to Tag.
 */
export function iconForCategory(category: Pick<Category, 'key' | 'icon' | 'label'>): LucideIcon {
  if (category.icon && ICON_NAME_MAP[category.icon]) {
    return ICON_NAME_MAP[category.icon];
  }
  const key = (category.key || '').toLowerCase();
  const label = (category.label || '').toLowerCase();
  const match = ICON_RULES.find(([pattern]) => pattern.test(key) || pattern.test(label));
  return match ? match[1] : Tag;
}

/**
 * Legacy & helper export: Also used by BudgetCard for a category-scoped budget's icon.
 */
export function iconForKey(key: string): LucideIcon {
  const match = ICON_RULES.find(([pattern]) => pattern.test(key.toLowerCase()));
  return match ? match[1] : Tag;
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

export type CategoryWithMetadata = Category & {
  bucket?: Bucket | { id?: string; key?: string; label?: string; color?: string | null } | string;
  bucket_key?: string;
  bucketKey?: string;
  bucket_label?: string;
  bucketLabel?: string;
  transactionCount?: number;
  transaction_count?: number;
  monthlySpend?: number;
  monthly_spend?: number;
  createdAt?: string;
  updatedAt?: string;
};

export interface CategoryCardProps {
  category: CategoryWithMetadata;
  bucket?: Bucket;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onClick?: (category: Category) => void;
  className?: string;
}

export function CategoryCard({
  category,
  bucket: bucketProp,
  onEdit,
  onDelete,
  onClick,
  className,
}: CategoryCardProps) {
  const isBuiltIn = category.origin === 'built-in';
  const Icon = iconForCategory(category);

  // Normalize bucket resolution
  const resolvedBucket =
    bucketProp || (typeof category.bucket === 'object' ? category.bucket : undefined);
  const bucketKey =
    (typeof category.bucket === 'string' ? category.bucket : undefined) ||
    category.bucket_key ||
    category.bucketKey ||
    resolvedBucket?.key ||
    '';
  const bucketLabel =
    category.bucket_label || category.bucketLabel || resolvedBucket?.label || bucketKey;
  const bucketColor =
    resolvedBucket?.color ?? (bucketKey ? BUILT_IN_BUCKET_COLOR[bucketKey] : undefined);

  const visual = bucketKey ? bucketVisual(bucketKey) : null;
  const color = category.color ?? bucketColor ?? 'var(--accent)';
  const hasCustomColor = Boolean(category.color);

  // Date and metric normalizations
  const createdAt = category.created_at ?? category.createdAt;
  const updatedAt = category.updated_at ?? category.updatedAt;
  const txCount = category.transactionCount ?? category.transaction_count;
  const monthlySpend = category.monthlySpend ?? category.monthly_spend;

  return (
    <EntityCard
      color={color}
      className={className}
      onClick={onClick ? () => onClick(category) : undefined}
      icon={<Icon size={20} strokeWidth={2} style={hasCustomColor ? { color } : undefined} />}
      title={category.label}
      subtitle={
        <code className="text-caption text-text-muted mt-0.5 block truncate font-mono">
          #{category.key}
        </code>
      }
      badges={
        <>
          {isBuiltIn && (
            <span className="text-caption bg-surface-raised text-text-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium border border-border/50">
              Built-in
            </span>
          )}

          {visual && (
            <span
              className={cn(
                'text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium',
                !bucketColor && visual.bg,
                !bucketColor && visual.text
              )}
              style={
                bucketColor
                  ? {
                      backgroundColor: `color-mix(in srgb, ${bucketColor} 16%, transparent)`,
                      color: bucketColor,
                    }
                  : undefined
              }
            >
              <span
                className={cn('h-1.5 w-1.5 rounded-full', !bucketColor && visual.dot)}
                style={bucketColor ? { backgroundColor: bucketColor } : undefined}
                aria-hidden
              />
              {bucketLabel || visual.label}
            </span>
          )}

          {txCount !== undefined && (
            <span className="text-caption bg-surface-raised text-text-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium border border-border/50">
              <Receipt size={12} />
              {txCount} {txCount === 1 ? 'transaction' : 'transactions'}
            </span>
          )}
        </>
      }
      footer={
        <>
          {monthlySpend !== undefined && (
            <FooterRow icon={<Banknote size={12} />} label="Monthly spend" amount={monthlySpend} />
          )}
          <FooterRow icon={<Clock3 size={12} />} label="Added" value={safeFormatDate(createdAt)} />
          {updatedAt && updatedAt !== createdAt && (
            <FooterRow
              icon={<History size={12} />}
              label="Updated"
              value={safeFormatDate(updatedAt)}
            />
          )}
        </>
      }
      menuLabel={`Actions for ${category.label}`}
      onEdit={onEdit ? () => onEdit(category) : undefined}
      onDelete={isBuiltIn ? undefined : onDelete ? () => onDelete(category) : undefined}
    />
  );
}

export interface CreateCategoryCardProps {
  onClick?: () => void;
  className?: string;
}

export function CreateCategoryCard({ onClick, className }: CreateCategoryCardProps) {
  return (
    <CreateEntityCard
      icon={<Sparkles size={22} strokeWidth={2.25} />}
      title="Create new"
      description="Define a custom transaction tag"
      onClick={onClick}
      className={className}
    />
  );
}

export function CategoryCardSkeleton() {
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
}
