'use client';

import React, { useState } from 'react';
import { Layers, PiggyBank, Receipt, Sparkles, TrendingUp } from 'lucide-react';
import { formatInr } from '@kalya/utils';
import type { CreateEquityAssetDto, UpdateEquityAssetDto } from '@kalya/types';
import { Button } from '@/components/ui/forms/button';
import { KpiCard, KpiGrid } from '@/components/shared';
import { EquityForm } from '@/components/forms/finances/equity';
import { EquityRow, useEquitiesData } from '@/hooks/finances/use-equities';
import { EquityCharts } from './charts';
import { EquityTable } from './equity-table';
import { DeleteConfirmDialog, WealthEmptyState } from '../shared';

export function Equities() {
  const { equities, totals, handleAddStock, handleEditStock, handleDeleteStockLot, isLoading } =
    useEquitiesData();

  // Modal & dialog state
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockToEdit, setStockToEdit] = useState<EquityRow | null>(null);
  const [defaultCompany, setDefaultCompany] = useState<string | undefined>();
  const [rowToDelete, setRowToDelete] = useState<EquityRow | null>(null);

  const handleOpenAddStock = (prefillCompany?: string) => {
    setStockToEdit(null);
    setDefaultCompany(prefillCompany);
    setIsStockModalOpen(true);
  };

  const handleOpenEditStock = (row: EquityRow) => {
    setStockToEdit(row);
    setDefaultCompany(row.company);
    setIsStockModalOpen(true);
  };

  const handleSaveStock = async (payload: CreateEquityAssetDto | UpdateEquityAssetDto) => {
    if (stockToEdit) {
      await handleEditStock(stockToEdit.id, payload as UpdateEquityAssetDto);
      setStockToEdit(null);
    } else {
      await handleAddStock(payload as CreateEquityAssetDto);
    }
  };

  const hasEquities = equities.length > 0;

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-12">
      {/* Page Header */}
      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </span>
            <h1 className="font-display text-heading-md font-bold text-text-primary">Equities</h1>
          </div>
          <p className="mt-1 text-body-sm text-text-secondary">
            Your NSE and BSE stock purchases and the capital invested in them.
          </p>
        </div>

        <Button size="sm" onClick={() => handleOpenAddStock()} className="gap-1.5">
          <Sparkles size={16} />
          Add Equity
        </Button>
      </header>

      {/* Summary */}
      <KpiGrid cols={3}>
        <KpiCard
          title="Total Invested"
          value={formatInr(totals.totalInvested)}
          hint={`${totals.totalShares.toLocaleString('en-IN')} shares in total`}
          icon={PiggyBank}
          tone="default"
          info="Capital deployed across all your stock purchases."
          size="sm"
          isLoading={isLoading}
        />
        <KpiCard
          title="Stocks"
          value={String(totals.stocksCount)}
          hint="Distinct companies held"
          icon={Layers}
          tone="default"
          info="Number of different companies in your equity portfolio."
          size="sm"
          isLoading={isLoading}
        />
        <KpiCard
          title="Purchases"
          value={String(totals.purchasesCount)}
          hint="Buy entries recorded"
          icon={Receipt}
          tone="default"
          info="Total number of individual stock purchases you have logged."
          size="sm"
          isLoading={isLoading}
        />
      </KpiGrid>

      {/* Analytics Charts */}
      {hasEquities && <EquityCharts rows={equities} isLoading={isLoading} />}

      {/* Equity Table */}
      {hasEquities || isLoading ? (
        <EquityTable
          rows={equities}
          isLoading={isLoading}
          onEdit={handleOpenEditStock}
          onDelete={setRowToDelete}
        />
      ) : (
        <WealthEmptyState
          type="equities"
          onAction={() => handleOpenAddStock()}
          onSelectTemplate={(tpl) => handleOpenAddStock(tpl.company)}
        />
      )}

      {/* Add / Edit Stock Modal */}
      <EquityForm
        open={isStockModalOpen}
        onOpenChange={(open) => {
          setIsStockModalOpen(open);
          if (!open) {
            setStockToEdit(null);
          }
        }}
        asset={stockToEdit as any}
        defaultCompany={defaultCompany}
        onSave={handleSaveStock}
      />

      {/* Delete Purchase Confirmation */}
      {rowToDelete && (
        <DeleteConfirmDialog
          open={Boolean(rowToDelete)}
          onOpenChange={(open) => !open && setRowToDelete(null)}
          title="Delete Stock Purchase"
          description={`Remove your ${rowToDelete.total_shared} share purchase of ${rowToDelete.company}?`}
          onConfirm={() => handleDeleteStockLot(rowToDelete.id)}
        />
      )}
    </section>
  );
}
