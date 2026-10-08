'use client';

import * as React from 'react';
import { Bell, AlertTriangle, Users2, Trophy } from 'lucide-react';
import { KpiCard, KpiGrid } from '@/components/shared';

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
  return (
    <KpiGrid cols={4}>
      <KpiCard
        title="Unread Alerts"
        value={metrics.unread}
        hint={metrics.unread === 0 ? 'All caught up' : 'Needs attention'}
        icon={Bell}
        tone={metrics.unread > 0 ? 'accent' : 'default'}
        highlight={metrics.unread > 0}
        onClick={() => onFilterChange('unread')}
        action={
          metrics.unread > 0
            ? {
                label: 'Mark all read',
                onClick: onMarkAllAsRead,
              }
            : undefined
        }
      />

      <KpiCard
        title="Budgets at Risk"
        value={metrics.budgetsAtRisk}
        hint={
          metrics.budgetsAtRisk > 0
            ? `${metrics.budgetsAtRisk} exceeded or in warning`
            : 'All budgets healthy'
        }
        icon={AlertTriangle}
        tone={metrics.budgetsAtRisk > 0 ? 'warning' : 'positive'}
        highlight={metrics.budgetsAtRisk > 0}
        onClick={() => onFilterChange('budget_alert')}
        action={{
          label: 'Budgets',
          href: '/dashboard/budgets',
        }}
      />

      <KpiCard
        title="Pending Splits"
        value={metrics.pendingSplits}
        hint={metrics.pendingSplits > 0 ? 'Unsettled friend balances' : 'No pending balances'}
        icon={Users2}
        tone={metrics.pendingSplits > 0 ? 'info' : 'default'}
        highlight={metrics.pendingSplits > 0}
        onClick={() => onFilterChange('split_update')}
        action={{
          label: 'Split Bills',
          href: '/dashboard/splits',
        }}
      />

      <KpiCard
        title="Goal Milestones"
        value={metrics.goalMilestones}
        hint={metrics.goalMilestones > 0 ? 'Target milestones unlocked' : 'Track savings progress'}
        icon={Trophy}
        tone="accent"
        highlight={metrics.goalMilestones > 0}
        onClick={() => onFilterChange('goal_milestone')}
        action={{
          label: 'Goals',
          href: '/dashboard/goals',
        }}
      />
    </KpiGrid>
  );
}
