'use client';

import React, { useState } from 'react';
import { Coins, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { GoldSilverForm } from '@/components/forms/finances/gold-silver';
import { DigitalAssetItem, useGoldSilverData } from '@/hooks/finances/use-gold-silver';
import { GoldSilverSummary } from './summary';
import { GoldSilverCharts } from './charts';
import { GoldSilverTable } from './table';
import { GoldSilverDetailsSheet } from './details-sheet';
import { DeleteConfirmDialog, MarketPriceBadge, SellDialog, WealthEmptyState } from '../shared';
import type { CreateDigitalAssetDto, UpdateDigitalAssetDto } from '@kalya/types';

export function GoldSilver() {
  const {
    purchases,
    filteredPurchases,
    totals,
    filters,
    setFilters,
    updateFilters,
    platforms,
    chartData,
    selectedPurchase,
    selectedPurchaseId,
    setSelectedPurchaseId,
    marketRates,
    lastRefreshedAt,
    isRefreshingRates,
    refreshMarketRates,
    handleAddPurchase,
    handleEditPurchase,
    handleDeletePurchase,
    isLoading,
  } = useGoldSilverData();

  // Dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [purchaseToEdit, setPurchaseToEdit] = useState<DigitalAssetItem | null>(null);
  const [purchaseToSell, setPurchaseToSell] = useState<DigitalAssetItem | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<DigitalAssetItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeDetailsPurchase, setActiveDetailsPurchase] = useState<DigitalAssetItem | null>(null);

  // Handlers
  const handleOpenAddModal = (template?: any) => {
    setPurchaseToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: DigitalAssetItem) => {
    setPurchaseToEdit(item);
    setIsAddModalOpen(true);
  };

  const handleOpenSellModal = (item: DigitalAssetItem) => {
    setPurchaseToSell(item);
  };

  const handleOpenDeleteModal = (item: DigitalAssetItem) => {
    setPurchaseToDelete(item);
  };

  const handleOpenDetails = (item: DigitalAssetItem) => {
    setActiveDetailsPurchase(item);
    setIsDetailsOpen(true);
  };

  const handleSavePurchase = async (payload: CreateDigitalAssetDto | UpdateDigitalAssetDto) => {
    if (purchaseToEdit) {
      handleEditPurchase(purchaseToEdit.id, payload as UpdateDigitalAssetDto);
      setPurchaseToEdit(null);
    } else {
      await handleAddPurchase(payload as CreateDigitalAssetDto);
    }
  };

  const handleConfirmSell = (soldUnits: number, exitPrice: number) => {
    if (!purchaseToSell) return;
    const remainingWeight = Math.max(0, Number(purchaseToSell.weight_in_gram) - soldUnits);
    if (remainingWeight === 0) {
      handleDeletePurchase(purchaseToSell.id);
    } else {
      const remainingAmount =
        Number(purchaseToSell.amount_paid) *
        (remainingWeight / Number(purchaseToSell.weight_in_gram));
      handleEditPurchase(purchaseToSell.id, {
        weight_in_gram: remainingWeight,
        amount_paid: remainingAmount,
      });
    }
    setPurchaseToSell(null);
  };

  const hasPurchases = purchases.length > 0;

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-12">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-5">
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
            Manage physical and digital precious metal holdings with real-time valuation, tax
            invoices, and returns.
          </p>
        </div>

        {/* Action Controls & Market Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <MarketPriceBadge
            goldRate={marketRates.gold}
            silverRate={marketRates.silver}
            lastRefreshedAt={lastRefreshedAt}
            isRefreshing={isRefreshingRates}
            onRefresh={refreshMarketRates}
          />

          <Button onClick={() => handleOpenAddModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Purchase
          </Button>
        </div>
      </header>

      {/* Summary KPI Strip */}
      <GoldSilverSummary totals={totals} isLoading={isLoading} />

      {/* Analytics Charts */}
      {hasPurchases && (
        <GoldSilverCharts
          timeline={chartData.timeline}
          allocation={chartData.allocation}
          purchasesByMonth={chartData.purchasesByMonth}
          rateComparison={chartData.rateComparison}
          byPlatform={chartData.byPlatform}
          isLoading={isLoading}
        />
      )}

      {/* Main Holdings Table or Empty State */}
      {hasPurchases ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-body-md font-semibold text-text-primary">
              Precious Metals Purchase Ledger
            </h3>
            <span className="text-caption text-text-muted">
              {filteredPurchases.length} transaction{filteredPurchases.length === 1 ? '' : 's'}
            </span>
          </div>

          <GoldSilverTable
            purchases={filteredPurchases}
            filters={filters}
            onFilterChange={updateFilters}
            platforms={platforms}
            onSelectPurchase={handleOpenDetails}
            onEditPurchase={handleOpenEditModal}
            onSellPurchase={handleOpenSellModal}
            onDeletePurchase={handleOpenDeleteModal}
            onAddNew={() => handleOpenAddModal()}
          />
        </section>
      ) : (
        <WealthEmptyState
          type="gold-silver"
          onAction={() => handleOpenAddModal()}
          onSelectTemplate={(tpl) => handleOpenAddModal(tpl)}
        />
      )}

      {/* Purchase Modal Form */}
      <GoldSilverForm
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        asset={purchaseToEdit}
        onSave={handleSavePurchase}
      />

      {/* Slide-over Details Sheet */}
      <GoldSilverDetailsSheet
        purchase={activeDetailsPurchase}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={handleOpenEditModal}
        onSell={handleOpenSellModal}
        onDelete={handleOpenDeleteModal}
      />

      {/* Simulated Sell Modal */}
      {purchaseToSell && (
        <SellDialog
          open={Boolean(purchaseToSell)}
          onOpenChange={(open) => !open && setPurchaseToSell(null)}
          title={`Sell ${purchaseToSell.type === 'gold' ? 'Gold 24K' : 'Silver 999'}`}
          itemDescription={`Purchased on ${purchaseToSell.date} via ${purchaseToSell.platform} at ₹${purchaseToSell.rate_per_gram}/g.`}
          maxUnits={Number(purchaseToSell.weight_in_gram)}
          unitLabel="grams"
          buyRate={Number(purchaseToSell.rate_per_gram)}
          defaultMarketRate={purchaseToSell.current_rate_per_gram}
          onConfirmSell={handleConfirmSell}
        />
      )}

      {/* Delete Confirmation Modal */}
      {purchaseToDelete && (
        <DeleteConfirmDialog
          open={Boolean(purchaseToDelete)}
          onOpenChange={(open) => !open && setPurchaseToDelete(null)}
          title="Delete Bullion Purchase"
          description={`Are you sure you want to delete ${purchaseToDelete.weight_in_gram}g of ${purchaseToDelete.type} purchased via ${purchaseToDelete.platform}?`}
          onConfirm={() => handleDeletePurchase(purchaseToDelete.id)}
        />
      )}
    </section>
  );
}
