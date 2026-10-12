'use client';

import React from 'react';
import { ArrowRight, Calendar, ExternalLink, Layers, Receipt, Tag, Wallet, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatInr } from '@kalya/utils';
import { Button } from '@/components/ui/forms/button';
import { Badge } from '@/components/ui/data-display/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/overlays/drawer';
import type { DrilldownTarget } from './types';
import type { UnifiedTransactionItem } from '@/hooks/finances/transactions/types';

interface DrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: DrilldownTarget | null;
  items: UnifiedTransactionItem[];
}

export function DrilldownDrawer({ open, onOpenChange, target, items }: DrilldownDrawerProps) {
  const router = useRouter();

  if (!target) return null;

  // Filter items matching target
  const filtered = items.filter((item) => {
    if (item.kind === 'income') return false;

    if (target.type === 'category') {
      return item.category?.label === target.title || item.category?.id === target.id;
    }
    if (target.type === 'bucket') {
      return item.bucket?.label === target.title || item.bucket?.id === target.id;
    }
    if (target.type === 'month') {
      return item.date.startsWith(target.title);
    }
    return true;
  });

  const totalSum = filtered.reduce((acc, item) => {
    if (item.kind === 'personal_expense') return acc + item.amount;
    if (item.kind === 'split_bill') return acc + item.yourShare;
    return acc;
  }, 0);

  const handleOpenTransactions = () => {
    onOpenChange(false);
    router.push('/dashboard/transactions');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="md">
        <DrawerHeader>
          <div className="flex items-center justify-between pr-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                {target.type === 'category' ? (
                  <Tag className="h-4 w-4" />
                ) : target.type === 'bucket' ? (
                  <Layers className="h-4 w-4" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
              </span>
              <div>
                <DrawerTitle className="text-body-md font-bold text-text-primary">
                  {target.title}
                </DrawerTitle>
                <DrawerDescription className="text-caption text-text-muted">
                  {target.subtitle || `${filtered.length} associated transactions`}
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Total Metric Card */}
        <div className="px-5 py-3 bg-surface-raised border-y border-border/70 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Segment Total
            </span>
            <div className="font-numeric text-title-sm font-bold text-text-primary mt-0.5">
              {formatInr(totalSum)}
            </div>
          </div>
          <Badge variant="subtle" size="sm">
            {filtered.length} outlays
          </Badge>
        </div>

        {/* Transactions list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0 divide-y divide-border/60">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-text-muted">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-body-sm">No transaction details available for this filter.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const amount = item.kind === 'split_bill' ? item.yourShare : item.amount;

              return (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-body-sm text-text-primary truncate">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-caption text-text-muted mt-0.5">
                      <span>{item.date}</span>
                      {item.kind === 'split_bill' && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">Split Bill</span>
                        </>
                      )}
                      {item.kind !== 'income' && item.category?.label && (
                        <>
                          <span>•</span>
                          <span>{item.category.label}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="font-numeric font-bold text-body-sm text-text-primary shrink-0">
                    {formatInr(amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DrawerFooter className="border-t border-border/70 p-4 bg-surface">
          <Button onClick={handleOpenTransactions} className="w-full gap-2">
            <span>Open in Transactions Page</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
