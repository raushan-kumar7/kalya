'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Users2, Trophy, ArrowRight, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/forms/button';

interface AlertCardsProps {
  metrics: {
    unread: number;
    budgetsAtRisk: number;
    pendingSplits: number;
    goalMilestones: number;
    totalCount: number;
  };
  onMarkAllAsRead: () => void;
  onFilterChange: (tab: any) => void;
}

export function AlertCards({ metrics, onMarkAllAsRead, onFilterChange }: AlertCardsProps) {
  const cards = [
    {
      id: 'unread',
      title: 'Unread Alerts',
      count: metrics.unread,
      subtitle: metrics.unread === 0 ? 'All caught up' : 'Needs attention',
      icon: Bell,
      color: metrics.unread > 0 ? 'text-accent' : 'text-text-muted',
      bgGradient:
        metrics.unread > 0
          ? 'from-accent/15 via-accent/5 to-transparent border-accent/25'
          : 'from-surface via-surface to-surface-subtle border-border/80',
      action:
        metrics.unread > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllAsRead();
            }}
            className="h-7 px-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1 text-accent" />
            Mark all read
          </Button>
        ) : null,
      onClick: () => onFilterChange('unread'),
    },
    {
      id: 'budgets',
      title: 'Budgets at Risk',
      count: metrics.budgetsAtRisk,
      subtitle:
        metrics.budgetsAtRisk > 0
          ? `${metrics.budgetsAtRisk} exceeded or in warning`
          : 'All budgets healthy',
      icon: AlertTriangle,
      color: metrics.budgetsAtRisk > 0 ? 'text-amber-500' : 'text-emerald-500',
      bgGradient:
        metrics.budgetsAtRisk > 0
          ? 'from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/25'
          : 'from-surface via-surface to-surface-subtle border-border/80',
      action: (
        <Link
          href="/dashboard/budgets"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center text-xs font-medium text-amber-500 hover:text-amber-400"
        >
          Budgets <ArrowRight className="h-3 w-3 ml-0.5" />
        </Link>
      ),
      onClick: () => onFilterChange('budget_alert'),
    },
    {
      id: 'splits',
      title: 'Pending Splits',
      count: metrics.pendingSplits,
      subtitle: metrics.pendingSplits > 0 ? 'Unsettled friend balances' : 'No pending balances',
      icon: Users2,
      color: metrics.pendingSplits > 0 ? 'text-sky-500' : 'text-text-muted',
      bgGradient:
        metrics.pendingSplits > 0
          ? 'from-sky-500/15 via-sky-500/5 to-transparent border-sky-500/25'
          : 'from-surface via-surface to-surface-subtle border-border/80',
      action: (
        <Link
          href="/dashboard/splits"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center text-xs font-medium text-sky-500 hover:text-sky-400"
        >
          Split Bills <ArrowRight className="h-3 w-3 ml-0.5" />
        </Link>
      ),
      onClick: () => onFilterChange('split_update'),
    },
    {
      id: 'goals',
      title: 'Goal Milestones',
      count: metrics.goalMilestones,
      subtitle:
        metrics.goalMilestones > 0 ? 'Target milestones unlocked' : 'Track savings progress',
      icon: Trophy,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/15 via-purple-500/5 to-transparent border-purple-500/25',
      action: (
        <Link
          href="/dashboard/goals"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center text-xs font-medium text-purple-400 hover:text-purple-300"
        >
          Goals <ArrowRight className="h-3 w-3 ml-0.5" />
        </Link>
      ),
      onClick: () => onFilterChange('goal_milestone'),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            onClick={card.onClick}
            className={cn(
              'group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-linear-to-br p-4 sm:p-5 shadow-xs transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01]',
              card.bgGradient
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wide uppercase text-text-tertiary">
                  {card.title}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-numeric text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                    {card.count}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised/80 shadow-xs ring-1 ring-border/50 group-hover:scale-110 transition-transform duration-200',
                  card.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-xs text-text-secondary truncate max-w-35">{card.subtitle}</span>
              <div>{card.action}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
