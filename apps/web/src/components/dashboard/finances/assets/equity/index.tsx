'use client';

import React, { useState } from 'react';
import { Building2, PieChart, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { EquityForm } from '@/components/forms/finances/equity';
import { MutualFundForm } from '@/components/forms/finances/mutual-fund';
import {
  EquityHoldingGroup,
  MutualFundHolding,
  useEquitiesData,
} from '@/hooks/finances/use-equities';
import { EquitiesSummary } from './summary';
import { StocksHoldingsTable } from './stocks-table';
import { MutualFundsTable } from './mf-table';
import { EquitiesCharts } from './charts';
import { EquityDetailsSheet } from './details-sheet';
import { DeleteConfirmDialog, MarketPriceBadge, SellDialog, WealthEmptyState } from '../shared';
import type { CreateEquityAssetDto, UpdateEquityAssetDto } from '@kalya/types';

export function Equities() {
  const {
    holdings,
    filteredStockHoldings,
    mutualFunds,
    filteredMutualFunds,
    totals,
    filters,
    setFilters,
    updateFilters,
    chartData,
    selectedHolding,
    selectedHoldingId,
    setSelectedHoldingId,
    lastRefreshedAt,
    isRefreshing,
    refreshQuotes,
    handleAddStock,
    handleAddMutualFund,
    handleDeleteStockLot,
    handleDeleteMutualFund,
    isLoading,
  } = useEquitiesData();

  // Active view tab: stocks | mutual_funds | all
  const [activeTab, setActiveTab] = useState<'stocks' | 'mutual_funds' | 'all'>('stocks');

  // Modals & Dialog states
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isMfModalOpen, setIsMfModalOpen] = useState(false);
  const [holdingToEdit, setHoldingToEdit] = useState<any | null>(null);
  const [holdingToSell, setHoldingToSell] = useState<EquityHoldingGroup | null>(null);
  const [lotToDelete, setLotToDelete] = useState<string | null>(null);
  const [mfToDelete, setMfToDelete] = useState<MutualFundHolding | null>(null);
  const [detailsHolding, setDetailsHolding] = useState<EquityHoldingGroup | null>(null);
  const [defaultCompanyForNewLot, setDefaultCompanyForNewLot] = useState<string | undefined>();

  // Handlers
  const handleOpenAddStock = (prefillCompany?: string) => {
    setDefaultCompanyForNewLot(prefillCompany);
    setHoldingToEdit(null);
    setIsStockModalOpen(true);
  };

  const handleOpenAddMf = () => {
    setHoldingToEdit(null);
    setIsMfModalOpen(true);
  };

  const handleOpenSellStock = (holding: EquityHoldingGroup) => {
    setHoldingToSell(holding);
  };

  const handleSaveStock = async (payload: CreateEquityAssetDto | UpdateEquityAssetDto) => {
    await handleAddStock(payload as CreateEquityAssetDto);
  };

  const handleSaveMutualFund = (data: any) => {
    handleAddMutualFund(data);
  };

  const handleConfirmSellStock = (soldShares: number, exitPrice: number) => {
    if (!holdingToSell) return;
    // Remove lot or adjust shares
    if (holdingToSell.lots.length > 0) {
      handleDeleteStockLot(holdingToSell.lots[0].id);
    }
    setHoldingToSell(null);
  };

  const hasHoldings = holdings.length > 0 || mutualFunds.length > 0;

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-12">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </span>
            <h1 className="font-display text-heading-md font-bold text-text-primary">
              Equities & Mutual Funds
            </h1>
          </div>
          <p className="mt-1 text-body-sm text-text-secondary">
            Consolidated stock portfolio, purchase lots, SIP folios, and capital gains tracking.
          </p>
        </div>

        {/* Action Controls & Market Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <MarketPriceBadge
            showMetals={false}
            lastRefreshedAt={lastRefreshedAt}
            isRefreshing={isRefreshing}
            onRefresh={refreshQuotes}
          />

          <Button variant="outline" onClick={() => handleOpenAddMf()} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Mutual Fund
          </Button>

          <Button onClick={() => handleOpenAddStock()} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </header>

      {/* Summary Strip */}
      <EquitiesSummary totals={totals} isLoading={isLoading} />

      {/* Analytics Charts */}
      {hasHoldings && (
        <EquitiesCharts
          allocation={chartData.allocation}
          exchangeSplit={chartData.exchangeSplit}
          gainLossHoldings={chartData.gainLossHoldings}
          growthTrend={chartData.growthTrend}
          monthlySip={chartData.monthlySip}
          isLoading={isLoading}
        />
      )}

      {/* View Tabs & Tables */}
      {hasHoldings ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
              <TabsList variant="pill">
                <TabsTrigger
                  value="stocks"
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  badge={
                    <span className="ml-1 rounded-full bg-surface-raised px-1.5 py-0.2 text-[10px] font-bold text-text-primary">
                      {holdings.length}
                    </span>
                  }
                >
                  Direct Stocks
                </TabsTrigger>
                <TabsTrigger
                  value="mutual_funds"
                  icon={<PieChart className="h-3.5 w-3.5" />}
                  badge={
                    <span className="ml-1 rounded-full bg-surface-raised px-1.5 py-0.2 text-[10px] font-bold text-text-primary">
                      {mutualFunds.length}
                    </span>
                  }
                >
                  Mutual Funds
                </TabsTrigger>
                <TabsTrigger value="all">All Holdings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Stocks Holdings Table */}
          {(activeTab === 'stocks' || activeTab === 'all') && (
            <section className="space-y-2">
              {activeTab === 'all' && (
                <h4 className="font-display text-body-sm font-semibold text-text-secondary flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" /> Direct Public Equities
                </h4>
              )}
              <StocksHoldingsTable
                holdings={filteredStockHoldings}
                filters={filters}
                onFilterChange={updateFilters}
                onSelectHolding={(h) => setDetailsHolding(h)}
                onAddLot={(h) => handleOpenAddStock(h.company)}
                onSellHolding={handleOpenSellStock}
                onDeleteLot={(lotId) => setLotToDelete(lotId)}
              />
            </section>
          )}

          {/* Mutual Funds Table */}
          {(activeTab === 'mutual_funds' || activeTab === 'all') && (
            <section className="space-y-2">
              {activeTab === 'all' && (
                <h4 className="mt-4 font-display text-body-sm font-semibold text-text-secondary flex items-center gap-1.5">
                  <PieChart className="h-4 w-4 text-primary" /> Mutual Fund Schemes & SIPs
                </h4>
              )}
              <MutualFundsTable
                mutualFunds={filteredMutualFunds}
                onSelectFund={(mf) => {}}
                onEditFund={(mf) => {
                  setHoldingToEdit(mf);
                  setIsMfModalOpen(true);
                }}
                onDeleteFund={(mf) => setMfToDelete(mf)}
              />
            </section>
          )}
        </div>
      ) : (
        <WealthEmptyState
          type="equities"
          onAction={() => handleOpenAddStock()}
          onSelectTemplate={(tpl) => handleOpenAddStock(tpl.company)}
        />
      )}

      {/* Stock Lot Form Modal */}
      <EquityForm
        open={isStockModalOpen}
        onOpenChange={setIsStockModalOpen}
        asset={holdingToEdit}
        defaultCompany={defaultCompanyForNewLot}
        onSave={handleSaveStock}
      />

      {/* Mutual Fund Form Modal */}
      <MutualFundForm
        open={isMfModalOpen}
        onOpenChange={setIsMfModalOpen}
        holding={holdingToEdit}
        onSave={handleSaveMutualFund}
      />

      {/* Stock Details Sheet */}
      <EquityDetailsSheet
        holding={detailsHolding}
        open={Boolean(detailsHolding)}
        onOpenChange={(open) => !open && setDetailsHolding(null)}
        onAddLot={(h) => handleOpenAddStock(h.company)}
        onSell={handleOpenSellStock}
        onDeleteLot={(lotId) => handleDeleteStockLot(lotId)}
      />

      {/* Sell Stock Dialog */}
      {holdingToSell && (
        <SellDialog
          open={Boolean(holdingToSell)}
          onOpenChange={(open) => !open && setHoldingToSell(null)}
          title={`Sell ${holdingToSell.company} (${holdingToSell.symbol})`}
          itemDescription={`Total holding: ${holdingToSell.total_shares} shares @ avg buy ₹${holdingToSell.avg_buy_price}.`}
          maxUnits={holdingToSell.total_shares}
          unitLabel="shares"
          buyRate={holdingToSell.avg_buy_price}
          defaultMarketRate={holdingToSell.current_price}
          onConfirmSell={handleConfirmSellStock}
        />
      )}

      {/* Delete Lot Confirmation */}
      {lotToDelete && (
        <DeleteConfirmDialog
          open={Boolean(lotToDelete)}
          onOpenChange={(open) => !open && setLotToDelete(null)}
          title="Delete Stock Purchase Lot"
          description="Are you sure you want to remove this stock purchase lot from your holding?"
          onConfirm={() => {
            handleDeleteStockLot(lotToDelete);
            setLotToDelete(null);
          }}
        />
      )}

      {/* Delete Mutual Fund Confirmation */}
      {mfToDelete && (
        <DeleteConfirmDialog
          open={Boolean(mfToDelete)}
          onOpenChange={(open) => !open && setMfToDelete(null)}
          title="Delete Mutual Fund Folio"
          description={`Are you sure you want to delete ${mfToDelete.scheme_name}?`}
          onConfirm={() => {
            handleDeleteMutualFund(mfToDelete.id);
            setMfToDelete(null);
          }}
        />
      )}
    </section>
  );
}
