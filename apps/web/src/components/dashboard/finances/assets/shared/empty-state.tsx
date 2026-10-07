'use client';

import React from 'react';
import { Coins, Plus, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/libs/utils';

export interface WealthEmptyStateProps {
  type: 'gold-silver' | 'equities' | 'mutual_funds' | 'general';
  onAction: () => void;
  onSelectTemplate?: (template: any) => void;
  className?: string;
}

export function WealthEmptyState({
  type,
  onAction,
  onSelectTemplate,
  className,
}: WealthEmptyStateProps) {
  const config = {
    'gold-silver': {
      title: 'No precious metals in your portfolio',
      description:
        'Start tracking 24K digital gold and 999 fine silver from Jar, MMTC-PAMP, Tanishq, Safegold or local vaults with live valuation.',
      buttonLabel: 'Log First Bullion Purchase',
      icon: Coins,
      templates: [
        { label: '1g Digital Gold (24K)', type: 'gold', weight: 1, platform: 'Jar' },
        { label: '5g Gold Bar (MMTC-PAMP)', type: 'gold', weight: 5, platform: 'MMTC-PAMP' },
        { label: '100g Fine Silver (Augmont)', type: 'silver', weight: 100, platform: 'Augmont' },
      ],
    },
    equities: {
      title: 'No stock holdings logged yet',
      description:
        'Record public equities on NSE or BSE to monitor consolidated average buy prices, current valuations, and capital gains.',
      buttonLabel: 'Add First Stock',
      icon: TrendingUp,
      templates: [
        { label: 'Reliance Industries (NSE)', company: 'Reliance Industries', exchange: 'NSE' },
        {
          label: 'Tata Consultancy Services (BSE)',
          company: 'Tata Consultancy Services',
          exchange: 'BSE',
        },
        { label: 'HDFC Bank (NSE)', company: 'HDFC Bank', exchange: 'NSE' },
      ],
    },
    mutual_funds: {
      title: 'No mutual fund folios tracked',
      description:
        'Track direct plan mutual funds, monthly SIP mandates, unit allocations, and live NAV returns in one unified wealth dashboard.',
      buttonLabel: 'Add First Mutual Fund',
      icon: TrendingUp,
      templates: [
        { label: 'Parag Parikh Flexi Cap', scheme: 'Parag Parikh Flexi Cap Fund' },
        { label: 'UTI Nifty 50 Index Fund', scheme: 'UTI Nifty 50 Index Fund' },
        { label: 'Quant Small Cap Fund', scheme: 'Quant Small Cap Fund' },
      ],
    },
    general: {
      title: 'Build your wealth portfolio',
      description:
        'Consolidate commodities, listed stocks, and mutual funds into one accurate net worth dashboard with real-time analytics.',
      buttonLabel: 'Add Asset Holding',
      icon: Wallet,
      templates: [],
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center sm:p-12',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-inner">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-4 font-display text-body-lg font-bold text-text-primary">{config.title}</h3>

      <p className="mt-1.5 max-w-md text-body-sm text-text-secondary">{config.description}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {config.buttonLabel}
        </Button>
      </div>

      {config.templates.length > 0 && onSelectTemplate && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-caption font-medium uppercase tracking-wider text-text-muted">
            Or quick start with a template:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {config.templates.map((tpl: any) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => onSelectTemplate(tpl)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-caption font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                + {tpl.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
