'use client';

import React from 'react';
import type { SplitContactMember, SplitContactSuggestion } from '@kalya/types';
import type { UpdateSplitContactMemberInput } from '@kalya/validations';
import { CreateEntityCard, EntityCard, FooterRow } from '@/components/shared';
import { formatCardDate } from '@kalya/utils';
import { cn } from '@/libs/utils';
import {
  Banknote,
  Clock3,
  History,
  Mail,
  Phone,
  Receipt,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react';

// Curated harmonious color palette for contact avatars and entity accent bars
const CONTACT_PALETTE = [
  '#10b981', // Emerald
  '#0ea5e9', // Sky
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#f97316', // Orange
] as const;

/**
 * Deterministically derives an accent color for a contact based on their unique identifier or name.
 */
export function resolveContactColor(seed?: string | null): string {
  if (!seed) return CONTACT_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CONTACT_PALETTE.length;
  return CONTACT_PALETTE[index];
}

/**
 * Extracts 1-2 uppercase initials from a contact's display name.
 */
export function getContactInitials(name?: string | null): string {
  if (!name || !name.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

export type SplitContactMemberWithMetadata = SplitContactMember & {
  pendingAmount?: number;
  pending_amount?: number;
  settledAmount?: number;
  settled_amount?: number;
  expenseCount?: number;
  expense_count?: number;
  createdAt?: string;
  updatedAt?: string;
  isLinked?: boolean;
};

export interface SplitContactCardProps {
  /** Peer contact participant in split expenses */
  member: SplitContactMemberWithMetadata;
  /** Callback fired when user clicks Edit in the action menu */
  onEdit?:
    | ((member: SplitContactMember) => void | Promise<void>)
    | ((payload: UpdateSplitContactMemberInput) => void | Promise<void>);
  /** Callback fired when user clicks Delete in the action menu */
  onDelete?: ((member: SplitContactMember) => void | Promise<void>) | (() => void | Promise<void>);
  /** Callback fired when user clicks Link to Kalya */
  onLink?: (member: SplitContactMember) => void | Promise<void>;
  /** Optional matched suggestion from Kalya user directory */
  suggestedMatch?: SplitContactSuggestion | null;
  /** Optional click callback for the whole card */
  onClick?: (member: SplitContactMember) => void;
  /** Custom wrapper CSS class */
  className?: string;
}

export function SplitContactCard({
  member,
  onEdit,
  onDelete,
  onLink,
  suggestedMatch,
  onClick,
  className,
}: SplitContactCardProps) {
  // Support both snake_case and camelCase normalized fields
  const isLinked = Boolean(member.is_linked ?? member.isLinked);
  const createdAt = member.created_at ?? member.createdAt;
  const updatedAt = member.updated_at ?? member.updatedAt;
  const pendingAmount = member.pendingAmount ?? member.pending_amount;
  const expenseCount = member.expenseCount ?? member.expense_count;

  const displayName = member.name?.trim() || 'Unnamed Contact';
  const initials = getContactInitials(member.name);
  const color = resolveContactColor(member.id || member.name || member.email);

  // Circular avatar inside EntityCard roundel
  const avatarVisual = member.image ? (
    <img
      src={member.image}
      alt={displayName}
      className="h-full w-full rounded-full object-cover"
      onError={(e) => {
        (e.target as HTMLElement).style.display = 'none';
      }}
    />
  ) : initials ? (
    <span className="font-display text-body-sm font-semibold tracking-wider select-none">
      {initials}
    </span>
  ) : (
    <User className="h-5 w-5" />
  );

  return (
    <EntityCard
      color={color}
      className={className}
      onClick={onClick ? () => onClick(member) : undefined}
      icon={avatarVisual}
      title={displayName}
      subtitle={
        member.email ? (
          <span className="text-caption text-text-muted mt-0.5 flex items-center gap-1.5 truncate">
            <Mail size={12} className="shrink-0 text-text-muted/70" />
            <span className="truncate">{member.email}</span>
          </span>
        ) : member.phone ? (
          <span className="text-caption text-text-muted mt-0.5 flex items-center gap-1.5 truncate">
            <Phone size={12} className="shrink-0 text-text-muted/70" />
            <span className="font-numeric truncate">{member.phone}</span>
          </span>
        ) : (
          <span className="text-caption text-text-muted mt-0.5 block truncate italic">
            No contact details
          </span>
        )
      }
      badges={
        <>
          {isLinked ? (
            <span className="text-caption bg-success-subtle text-success border border-success/30 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" aria-hidden />
              <UserCheck size={12} />
              Linked Account
            </span>
          ) : (
            <>
              <span className="text-caption bg-surface-raised text-text-muted border border-border/50 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium">
                <User size={12} />
                External
              </span>

              {onLink && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLink(member);
                  }}
                  className={cn(
                    'text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors cursor-pointer',
                    suggestedMatch
                      ? 'bg-accent-subtle/50 hover:bg-accent-subtle text-accent border border-accent/40 shadow-xs'
                      : 'bg-surface-raised hover:bg-primary-subtle hover:text-primary text-text-secondary border border-border/60'
                  )}
                >
                  <Sparkles
                    size={12}
                    className={suggestedMatch ? 'text-accent animate-pulse' : 'text-text-muted'}
                  />
                  <span>{suggestedMatch ? 'Account Found — Link' : 'Link to Kalya'}</span>
                </button>
              )}
            </>
          )}

          {member.phone && member.email && (
            <span className="text-caption bg-surface-raised text-text-secondary border border-border/50 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium">
              <Phone size={12} className="text-text-muted" />
              <span className="font-numeric">{member.phone}</span>
            </span>
          )}

          {expenseCount !== undefined && (
            <span className="text-caption bg-surface-raised text-text-muted border border-border/50 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium">
              <Receipt size={12} />
              {expenseCount} {expenseCount === 1 ? 'split' : 'splits'}
            </span>
          )}
        </>
      }
      footer={
        <>
          {pendingAmount !== undefined && pendingAmount > 0 && (
            <FooterRow
              icon={<Banknote size={12} />}
              label="Pending share"
              amount={pendingAmount}
              className="text-warning font-medium"
            />
          )}
          {member.phone && !member.email && (
            <FooterRow icon={<Phone size={12} />} label="Phone" value={member.phone} />
          )}
          {member.email && (
            <FooterRow icon={<Mail size={12} />} label="Email" value={member.email} />
          )}
          {createdAt && (
            <FooterRow
              icon={<Clock3 size={12} />}
              label="Added"
              value={safeFormatDate(createdAt)}
            />
          )}
          {updatedAt && updatedAt !== createdAt && (
            <FooterRow
              icon={<History size={12} />}
              label="Updated"
              value={safeFormatDate(updatedAt)}
            />
          )}
        </>
      }
      menuLabel={`Actions for ${displayName}`}
      onEdit={onEdit ? () => (onEdit as (m: SplitContactMember) => void)(member) : undefined}
      onDelete={onDelete ? () => (onDelete as (m: SplitContactMember) => void)(member) : undefined}
    />
  );
}

export interface CreateSplitContactCardProps {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function CreateSplitContactCard({
  onClick,
  className,
  disabled = false,
}: CreateSplitContactCardProps) {
  return (
    <CreateEntityCard
      icon={<UserPlus size={22} strokeWidth={2.25} />}
      title="Add contact"
      description="Add a friend or group member to split expenses"
      onClick={onClick}
      disabled={disabled}
      className={className}
    />
  );
}

/** Backward-compatible export alias */
export const CreateContactCard = CreateSplitContactCard;

export function SplitContactCardSkeleton() {
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
        <div className="bg-surface-raised h-6 w-24 animate-pulse rounded-full" />
        <div className="bg-surface-raised h-6 w-20 animate-pulse rounded-full" />
      </div>
      <div className="border-border mt-auto flex flex-col gap-1.5 border-t px-5 py-3">
        <div className="bg-surface-raised h-3 w-full animate-pulse rounded" />
        <div className="bg-surface-raised h-3 w-full animate-pulse rounded" />
      </div>
    </div>
  );
}
