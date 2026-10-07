'use client';

import React from 'react';
import {
  Compass,
  Laptop,
  Palmtree,
  PiggyBank,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { Card } from '@/components/ui/data-display/card';
import { formatInr } from '@kalya/utils';

export interface GoalTemplate {
  name: string;
  target_amount: number;
  monthsAhead: number;
  monthly_contribution_plan: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    name: 'Emergency Fund (6 Months)',
    target_amount: 300000,
    monthsAhead: 12,
    monthly_contribution_plan: 25000,
    icon: ShieldCheck,
    description: 'Build peace of mind with 6 months of living expenses safely stashed.',
  },
  {
    name: 'Dream Vacation / Trip',
    target_amount: 150000,
    monthsAhead: 8,
    monthly_contribution_plan: 18750,
    icon: Palmtree,
    description: 'Save guilt-free for flights, stays, and memorable adventures.',
  },
  {
    name: 'Tech & Gadget Upgrade',
    target_amount: 180000,
    monthsAhead: 6,
    monthly_contribution_plan: 30000,
    icon: Laptop,
    description: 'Upgrade your workstation, phone, or laptop with cash on hand.',
  },
  {
    name: 'Long-term Wealth / Down Payment',
    target_amount: 500000,
    monthsAhead: 24,
    monthly_contribution_plan: 20800,
    icon: PiggyBank,
    description: 'Accumulate capital for a property down payment or index fund launch.',
  },
];

export interface GoalsEmptyStateProps {
  onCreateGoal: () => void;
  onSelectTemplate?: (template: GoalTemplate) => void;
}

export function GoalsEmptyState({ onCreateGoal, onSelectTemplate }: GoalsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/50 p-8 sm:p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-xs">
        <Target className="h-8 w-8" />
      </div>

      <h3 className="mt-4 font-display text-text-display-md font-bold text-text-primary">
        Start Your Financial Goals
      </h3>
      <p className="mt-2 max-w-md text-body-sm text-text-muted">
        Define target dates, configure planned contributions, and watch your savings accumulate on
        autopilot.
      </p>

      <div className="mt-6">
        <Button variant="primary" size="md" onClick={onCreateGoal} className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Create Your First Goal</span>
        </Button>
      </div>

      {/* Suggested Goal Starters */}
      <div className="mt-10 w-full max-w-3xl">
        <div className="flex items-center justify-center gap-2 text-caption font-semibold uppercase tracking-wider text-text-muted mb-4">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Quick Starter Inspiration</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-left">
          {GOAL_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <Card
                key={tmpl.name}
                onClick={() => onSelectTemplate?.(tmpl)}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xs cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h4 className="font-display text-body-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {tmpl.name}
                      </h4>
                    </div>
                  </div>
                  <p className="mt-2 text-caption text-text-muted line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-caption">
                  <span className="font-numeric font-medium text-text-secondary">
                    Target: {formatInr(tmpl.target_amount)}
                  </span>
                  <span className="text-primary font-medium flex items-center gap-1 group-hover:underline">
                    Use this <Plus className="h-3 w-3" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
