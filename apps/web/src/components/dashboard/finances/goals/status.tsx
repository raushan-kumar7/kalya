'use client';

import React from 'react';
import type { GoalStatus } from '@kalya/types';
import { Badge } from '@/components/ui/data-display/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  PauseCircle,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { formatInr } from '@kalya/utils';
import { cn } from '@/libs/utils';
import type { GoalPaceExtended } from './types';

export const GOAL_STATUS_CONFIG: Record<
  GoalStatus,
  {
    label: string;
    variant:
      'default' | 'secondary' | 'accent' | 'subtle' | 'outline' | 'success' | 'warning' | 'danger';
    icon: React.ComponentType<{ className?: string }>;
    dotColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  }
> = {
  not_started: {
    label: 'Not Started',
    variant: 'secondary',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    variant: 'subtle',
    icon: PlayCircle,
    dotColor: 'primary',
  },
  on_track: {
    label: 'On Track',
    variant: 'success',
    icon: CheckCircle2,
    dotColor: 'success',
  },
  behind: {
    label: 'Behind',
    variant: 'warning',
    icon: AlertTriangle,
    dotColor: 'warning',
  },
  completed: {
    label: 'Completed',
    variant: 'success',
    icon: Sparkles,
  },
  paused: {
    label: 'Paused',
    variant: 'outline',
    icon: PauseCircle,
  },
};

export function GoalStatusBadge({
  status,
  size = 'sm',
  className,
}: {
  status: GoalStatus;
  size?: 'sm' | 'default' | 'md' | 'lg';
  className?: string;
}) {
  const config = GOAL_STATUS_CONFIG[status] || GOAL_STATUS_CONFIG.in_progress;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      size={size}
      leadingIcon={<Icon className="h-3 w-3 shrink-0" />}
      className={cn('capitalize font-medium shadow-2xs', className)}
    >
      {config.label}
    </Badge>
  );
}

export function OnTrackIndicator({
  pace,
  monthlyPlan,
  className,
}: {
  pace: GoalPaceExtended;
  monthlyPlan: number;
  className?: string;
}) {
  let tooltipText = '';
  let badgeLabel = 'On Track';
  let variant: 'success' | 'warning' | 'danger' | 'secondary' = 'success';
  let Icon = CheckCircle2;

  if (pace.progressPercentage >= 100) {
    badgeLabel = '100% Achieved';
    variant = 'success';
    Icon = Sparkles;
    tooltipText = 'Goal target amount has been fully reached!';
  } else if (pace.isOverdue) {
    badgeLabel = 'Overdue';
    variant = 'danger';
    Icon = AlertCircle;
    tooltipText = `Target date has passed. Remaining ${formatInr(pace.remainingAmount)} still needed.`;
  } else if (pace.isOnTrack) {
    badgeLabel = 'On Track';
    variant = 'success';
    Icon = CheckCircle2;
    if (monthlyPlan > 0) {
      tooltipText = `Planned saving of ${formatInr(monthlyPlan)}/mo meets or exceeds the required pace (${formatInr(pace.recommendedMonthly)}/mo).`;
    } else {
      tooltipText = `Savings balance is in good standing toward your target deadline.`;
    }
  } else {
    badgeLabel = 'Behind Pace';
    variant = 'warning';
    Icon = AlertTriangle;
    tooltipText = `Requires ${formatInr(pace.recommendedMonthly)}/mo. Planned saving is ${formatInr(monthlyPlan)}/mo (${formatInr(pace.monthlyShortfall ?? 0)} shortfall/mo).`;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={variant}
            size="sm"
            leadingIcon={<Icon className="h-3 w-3 shrink-0" />}
            trailingIcon={<HelpCircle className="h-2.5 w-2.5 opacity-60 ml-0.5" />}
            className={cn(
              'cursor-help shadow-2xs transition-transform hover:scale-[1.02]',
              className
            )}
          >
            {badgeLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-caption">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DeadlineCountdownBadge({
  targetDate,
  pace,
  className,
}: {
  targetDate: string;
  pace: GoalPaceExtended;
  className?: string;
}) {
  const isOverdue = pace.isOverdue;
  const days = pace.daysRemaining;
  const months = pace.monthsRemaining;

  let text = '';
  if (pace.progressPercentage >= 100) {
    text = 'Goal Completed';
  } else if (isOverdue) {
    text = `${Math.abs(days)}d Overdue`;
  } else if (days <= 30) {
    text = `${days} days left`;
  } else if (months <= 12) {
    text = `${months} ${months === 1 ? 'month' : 'months'} left`;
  } else {
    const years = (months / 12).toFixed(1);
    text = `${years} yrs left`;
  }

  return (
    <Badge
      variant={isOverdue ? 'danger' : 'outline'}
      size="sm"
      leadingIcon={
        <Clock className={cn('h-3 w-3 shrink-0', isOverdue && 'text-danger animate-pulse')} />
      }
      className={cn(
        'font-numeric tabular-nums text-[11px] font-medium border-border/70',
        isOverdue ? 'font-semibold' : 'text-text-muted',
        className
      )}
    >
      {text}
    </Badge>
  );
}
