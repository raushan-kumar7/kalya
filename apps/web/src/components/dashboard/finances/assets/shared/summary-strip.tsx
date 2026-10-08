'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import { LucideIcon, Wallet } from 'lucide-react';
import { KpiCard, KpiGrid, type KpiTone } from '@/components/shared';

export interface WealthKpiItem {
  id: string;
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: KpiTone;
  tooltip?: string;
  footer?: ReactNode;
}

export interface AssetsSummaryStripProps {
  items: WealthKpiItem[];
  isLoading?: boolean;
  className?: string;
}

export function AssetsSummaryStrip({
  items,
  isLoading = false,
  className,
}: AssetsSummaryStripProps) {
  return (
    <KpiGrid cols={6} className={className}>
      {items.map((kpi) => (
        <KpiCard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          hint={kpi.hint}
          icon={kpi.icon || Wallet}
          tone={kpi.tone || 'default'}
          info={kpi.tooltip}
          footer={kpi.footer}
          size="sm"
          isLoading={isLoading}
        />
      ))}
    </KpiGrid>
  );
}
