'use client';

import React, { useState } from 'react';
import { Coins, PiggyBank, Plus, Receipt, Sparkles } from 'lucide-react';
import { formatInr } from '@kalya/utils';
import type { CreateDigitalAssetDto, UpdateDigitalAssetDto } from '@kalya/types';
import { Button } from '@/components/ui/forms/button';
import { KpiCard, KpiGrid } from '@/components/shared';
import { GoldSilverForm } from '@/components/forms/finances/gold-silver';
import { DigitalAssetItem, useGoldSilverData } from '@/hooks/finances/use-gold-silver';
import { GoldSilverCharts } from './charts';
import { GoldSilverTable } from './gold-silver-table';
import { DeleteConfirmDialog, WealthEmptyState } from '../shared';

export function GoldSilver() {
  const {
    purchases,
    totals,
    handleAddPurchase,
    handleEditPurchase,
    handleDeletePurchase,
    isLoading,
  } = useGoldSilverData();

  // Dialog & selection states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [purchaseToEdit, setPurchaseToEdit] = useState<DigitalAssetItem | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<DigitalAssetItem | null>(null);

  const handleOpenAddModal = () => {
    setPurchaseToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: DigitalAssetItem) => {
    setPurchaseToEdit(item);
    setIsAddModalOpen(true);
  };

  const handleSavePurchase = async (payload: CreateDigitalAssetDto | UpdateDigitalAssetDto) => {
    if (purchaseToEdit) {
      await handleEditPurchase(purchaseToEdit.id, payload as UpdateDigitalAssetDto);
      setPurchaseToEdit(null);
    } else {
      await handleAddPurchase(payload as CreateDigitalAssetDto);
    }
  };

  const hasPurchases = purchases.length > 0;

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-12">
      {/* Page Header */}
      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 shadow-inner">
              <Coins className="h-5 w-5" />
            </span>
            <h1 className="font-display text-heading-md font-bold text-text-primary">
              Gold & Silver Bullion
            </h1>
          </div>
          <p className="mt-1 text-body-sm text-text-secondary">
            Your 24K gold and 999 fine silver vaulted assets and capital deployed in them.
          </p>
        </div>

        <Button size="sm" onClick={() => handleOpenAddModal()} className="gap-1.5">
          <Sparkles size={16} />
          Add Purchase
        </Button>
      </header>

      {/* Reduced KPI Grid */}
      <KpiGrid cols={4}>
        <KpiCard
          title="Total Invested"
          value={formatInr(totals.totalInvested)}
          hint={`${totals.totalWeight.toFixed(2)}g total weight`}
          icon={PiggyBank}
          tone="default"
          info="Total capital deployed across all bullion purchases including 3% GST."
          size="sm"
          isLoading={isLoading}
        />
        <KpiCard
          title="Gold Holdings"
          value={`${totals.goldWeight.toFixed(2)} g`}
          hint={formatInr(totals.goldInvested)}
          icon={Coins}
          tone="default"
          info="Total weight of 24K 99.9% pure gold bullion held."
          size="sm"
          isLoading={isLoading}
        />
        <KpiCard
          title="Silver Holdings"
          value={`${totals.silverWeight.toFixed(2)} g`}
          hint={formatInr(totals.silverInvested)}
          icon={Sparkles}
          tone="default"
          info="Total weight of 999 fine silver bullion held."
          size="sm"
          isLoading={isLoading}
        />
        <KpiCard
          title="Purchases"
          value={String(totals.purchaseCount)}
          hint="Buy invoices logged"
          icon={Receipt}
          tone="default"
          info="Total number of individual bullion transactions recorded."
          size="sm"
          isLoading={isLoading}
        />
      </KpiGrid>

      {/* Analytics Charts */}
      {hasPurchases && <GoldSilverCharts purchases={purchases} isLoading={isLoading} />}

      {/* Bullion Purchase Table */}
      {hasPurchases || isLoading ? (
        <GoldSilverTable
          purchases={purchases}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={setPurchaseToDelete}
        />
      ) : (
        <WealthEmptyState
          type="gold-silver"
          onAction={() => handleOpenAddModal()}
          onSelectTemplate={() => handleOpenAddModal()}
        />
      )}

      {/* Purchase Modal Form */}
      <GoldSilverForm
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            setPurchaseToEdit(null);
          }
        }}
        asset={purchaseToEdit}
        onSave={handleSavePurchase}
      />

      {/* Delete Purchase Confirmation Modal */}
      {purchaseToDelete && (
        <DeleteConfirmDialog
          open={Boolean(purchaseToDelete)}
          onOpenChange={(open) => !open && setPurchaseToDelete(null)}
          title="Delete Bullion Purchase"
          description={`Are you sure you want to remove this ${purchaseToDelete.weight_in_gram}g ${purchaseToDelete.type} purchase from ${purchaseToDelete.platform}?`}
          onConfirm={() => handleDeletePurchase(purchaseToDelete.id)}
        />
      )}
    </section>
  );
}
