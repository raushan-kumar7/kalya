'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Users2,
  Trophy,
  Sparkles,
  Check,
  CheckCheck,
  Clock,
  Trash2,
  ExternalLink,
  MoreVertical,
  BellOff,
  Flame,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Alert, AlertType } from '@kalya/types';
import { cn } from '@/libs/utils';

interface AlertItemProps {
  alert: Alert;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  onToggleReadStatus: (id: string, currentReadStatus: boolean) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string, hours: number) => void;
}

export function AlertTypeIcon({ type, severity }: { type: AlertType; severity?: string }) {
  switch (type) {
    case 'budget_alert':
      if (severity === 'critical') {
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/30">
            <Flame className="h-4.5 w-4.5" />
          </div>
        );
      }
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30">
          <AlertTriangle className="h-4.5 w-4.5" />
        </div>
      );
    case 'split_update':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 ring-1 ring-sky-500/30">
          <Users2 className="h-4.5 w-4.5" />
        </div>
      );
    case 'goal_milestone':
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30">
          <Trophy className="h-4.5 w-4.5" />
        </div>
      );
    case 'system':
    default:
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
      );
  }
}

function getRelativeTime(isoString?: string | null): string {
  if (!isoString) return 'Recently';
  try {
    const time = new Date(isoString).getTime();
    if (isNaN(time)) return 'Recently';
    const diffMs = Date.now() - time;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(time).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

function getDeepLink(alert: Alert): { href: string; label: string } | null {
  if (alert.reference_type === 'budget' || alert.type === 'budget_alert') {
    return { href: '/dashboard/budgets', label: 'View budget' };
  }
  if (alert.reference_type === 'split_expense' || alert.type === 'split_update') {
    return { href: '/dashboard/splits', label: 'View split' };
  }
  if (alert.reference_type === 'goal' || alert.type === 'goal_milestone') {
    return { href: '/dashboard/goals', label: 'View goal' };
  }
  if (alert.type === 'system') {
    return { href: '/dashboard/reports', label: 'View report' };
  }
  if (alert.reference_type === 'expense' || alert.reference_type === 'income') {
    return { href: '/dashboard/transactions', label: 'View transaction' };
  }
  return null;
}

export function AlertItem({
  alert,
  isSelected,
  onToggleSelect,
  onMarkRead,
  onToggleReadStatus,
  onDelete,
  onSnooze,
}: AlertItemProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const deepLink = getDeepLink(alert);
  const isUnread = !alert.is_read;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking interactive controls
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }

    if (isUnread) {
      onMarkRead(alert.id);
    }

    if (deepLink) {
      router.push(deepLink.href);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className={cn(
        'group relative flex items-start gap-3.5 rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 cursor-pointer select-none',
        isUnread
          ? 'bg-surface-raised/95 border-border shadow-xs hover:border-accent/40 hover:bg-surface-raised'
          : 'bg-surface/50 border-border/60 hover:bg-surface/80 hover:border-border',
        isSelected && 'ring-2 ring-accent border-accent bg-accent/5'
      )}
    >
      {/* 1. Multi-Select Checkbox */}
      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(alert.id)}
          aria-label={`Select alert ${alert.title}`}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40 cursor-pointer accent-accent"
        />
      </div>

      {/* 2. Type & Severity Icon */}
      <div className="shrink-0 pt-0.5">
        <AlertTypeIcon type={alert.type} severity={alert.severity} />
      </div>

      {/* 3. Text & Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={cn(
                'text-xs font-semibold sm:text-sm tracking-tight',
                isUnread ? 'text-text-primary' : 'text-text-secondary'
              )}
            >
              {alert.title}
            </h3>

            {/* Severity Pill if critical/warning */}
            {alert.severity === 'critical' && (
              <span className="inline-flex items-center rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500 ring-1 ring-rose-500/30">
                Critical
              </span>
            )}
            {alert.severity === 'warning' && (
              <span className="inline-flex items-center rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500 ring-1 ring-amber-500/30">
                Warning
              </span>
            )}
          </div>

          {/* Time & Unread Dot */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-text-tertiary">
              {getRelativeTime(alert.created_at)}
            </span>
            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-accent ring-2 ring-surface" title="Unread" />
            )}
          </div>
        </div>

        {/* Message body */}
        <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-xs">
          {alert.message}
        </p>

        {/* Action Link & Meta */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {deepLink && (
              <Link
                href={deepLink.href}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isUnread) onMarkRead(alert.id);
                }}
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold transition-colors',
                  alert.severity === 'critical'
                    ? 'text-rose-500 hover:text-rose-400'
                    : alert.type === 'budget_alert'
                      ? 'text-amber-500 hover:text-amber-400'
                      : alert.type === 'split_update'
                        ? 'text-sky-500 hover:text-sky-400'
                        : alert.type === 'goal_milestone'
                          ? 'text-purple-400 hover:text-purple-300'
                          : 'text-accent hover:text-accent-strong'
                )}
              >
                <span>{deepLink.label}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* Quick Actions Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition-all opacity-70 group-hover:opacity-100"
              title="More actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 bottom-full mb-1 z-50 w-44 rounded-xl border border-border bg-surface-raised p-1 shadow-lg backdrop-blur-md text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onToggleReadStatus(alert.id, alert.is_read);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      {alert.is_read ? (
                        <>
                          <Clock className="h-3.5 w-3.5 text-accent" />
                          Mark as unread
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          Mark as read
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSnooze(alert.id, 24);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      <BellOff className="h-3.5 w-3.5 text-amber-500" />
                      Snooze for 24h
                    </button>

                    <div className="my-1 border-t border-border/60" />

                    <button
                      type="button"
                      onClick={() => {
                        onDelete(alert.id);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Dismiss alert
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
