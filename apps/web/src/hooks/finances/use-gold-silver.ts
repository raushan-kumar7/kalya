import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreateDigitalAssetDto, DigitalAsset, UpdateDigitalAssetDto } from '@kalya/types';
import { roundMoney } from '@kalya/utils';
import { useAssetActions, useDigitalAssetsQuery } from './use-assets';

export interface DigitalAssetItem extends DigitalAsset {
  current_rate_per_gram: number;
  current_value: number;
  gain_loss: number;
  gain_loss_pct: number;
  is_profit: boolean;
}

export interface GoldSilverTotals {
  goldWeight: number;
  silverWeight: number;
  totalWeight: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  goldInvested: number;
  silverInvested: number;
  goldCurrentValue: number;
  silverCurrentValue: number;
  goldGainLoss: number;
  goldGainLossPct: number;
  silverGainLoss: number;
  silverGainLossPct: number;
  goldAvgBuyRate: number;
  silverAvgBuyRate: number;
  goldMarketRate: number;
  silverMarketRate: number;
  purchaseCount: number;
}

export interface GoldSilverFilters {
  metal: 'all' | 'gold' | 'silver';
  platform: string;
  search: string;
  sortBy: 'date_desc' | 'date_asc' | 'value_desc' | 'gain_desc' | 'weight_desc';
  dateRange: 'all' | '30d' | '90d' | '1y' | 'ytd';
}

const GOLD_SILVER_STORAGE_KEY = 'kalya_digital_assets_cache_v1';

// Benchmark market rates per gram (INR) for 24K 99.9% Gold and 999 Fine Silver
export const DEFAULT_MARKET_RATES = {
  gold: 15306.59, // ₹7,650 per gram
  silver: 230.65, // ₹94.50 per gram
};

function getStoredLocalPurchases(): DigitalAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GOLD_SILVER_STORAGE_KEY);
    if (!raw) return [];
    const items: DigitalAsset[] = JSON.parse(raw);
    return Array.isArray(items) ? items.filter((p) => !String(p.id).startsWith('demo-')) : [];
  } catch {
    return [];
  }
}

function persistLocalPurchases(items: DigitalAsset[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GOLD_SILVER_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota or privacy restriction
  }
}

export function useGoldSilverData() {
  const {
    data: serverPurchases = [],
    isLoading: isServerLoading,
    refetch,
  } = useDigitalAssetsQuery();
  const { createDigitalAsset: createMutation, isCreatingDigital } = useAssetActions();

  // Local storage cache to support seamless client-side edits/deletions and offline reliability
  const [localPurchases, setLocalPurchases] = useState<DigitalAsset[]>([]);
  const [marketRates, setMarketRates] = useState(DEFAULT_MARKET_RATES);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);

  // Filters and sorting state
  const [filters, setFilters] = useState<GoldSilverFilters>({
    metal: 'all',
    platform: 'all',
    search: '',
    sortBy: 'date_desc',
    dateRange: 'all',
  });

  // Selected item for details sheet or dialogs
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  // Load local purchases on mount
  useEffect(() => {
    const stored = getStoredLocalPurchases();
    if (stored.length > 0) {
      setLocalPurchases(stored);
    }
  }, []);

  // Combine data sources: server purchases take priority, then local purchases
  const rawPurchases = useMemo(() => {
    const combined = [...serverPurchases];
    // Add local purchases that aren't on server yet
    for (const local of localPurchases) {
      if (!combined.some((p) => p.id === local.id)) {
        combined.push(local);
      }
    }
    return combined;
  }, [serverPurchases, localPurchases]);

  // Enrich purchases with real-time valuation, gain/loss, and rates
  const enrichedPurchases: DigitalAssetItem[] = useMemo(() => {
    return rawPurchases.map((item) => {
      const isGold = item.type === 'gold';
      const currentRate = isGold ? marketRates.gold : marketRates.silver;
      const weight = Number(item.weight_in_gram) || 0;
      const amountPaid = Number(item.amount_paid) || 0;
      const currentValue = roundMoney(weight * currentRate);
      const gainLoss = roundMoney(currentValue - amountPaid);
      const gainLossPct = amountPaid > 0 ? roundMoney((gainLoss / amountPaid) * 100) : 0;

      return {
        ...item,
        current_rate_per_gram: currentRate,
        current_value: currentValue,
        gain_loss: gainLoss,
        gain_loss_pct: gainLossPct,
        is_profit: gainLoss >= 0,
      };
    });
  }, [rawPurchases, marketRates]);

  // Filtered and sorted purchases
  const filteredPurchases = useMemo(() => {
    let result = [...enrichedPurchases];

    // Filter by metal
    if (filters.metal !== 'all') {
      result = result.filter((p) => p.type === filters.metal);
    }

    // Filter by platform
    if (filters.platform !== 'all') {
      result = result.filter((p) => p.platform.toLowerCase() === filters.platform.toLowerCase());
    }

    // Filter by search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.platform.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          String(p.date).includes(q)
      );
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (filters.dateRange === '30d') cutoff.setDate(now.getDate() - 30);
      else if (filters.dateRange === '90d') cutoff.setDate(now.getDate() - 90);
      else if (filters.dateRange === '1y') cutoff.setFullYear(now.getFullYear() - 1);
      else if (filters.dateRange === 'ytd') cutoff = new Date(now.getFullYear(), 0, 1);

      result = result.filter((p) => new Date(p.date) >= cutoff);
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'value_desc':
          return b.current_value - a.current_value;
        case 'gain_desc':
          return b.gain_loss - a.gain_loss;
        case 'weight_desc':
          return Number(b.weight_in_gram) - Number(a.weight_in_gram);
        case 'date_desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [enrichedPurchases, filters]);

  // Compute portfolio totals
  const totals: GoldSilverTotals = useMemo(() => {
    let goldWeight = 0;
    let silverWeight = 0;
    let goldInvested = 0;
    let silverInvested = 0;
    let goldCurrentValue = 0;
    let silverCurrentValue = 0;
    let goldBasePaid = 0;
    let silverBasePaid = 0;

    for (const item of enrichedPurchases) {
      const weight = Number(item.weight_in_gram) || 0;
      const invested = Number(item.amount_paid) || 0;
      const basePaid = (Number(item.rate_per_gram) || 0) * weight;
      const currentVal = item.current_value;

      if (item.type === 'gold') {
        goldWeight += weight;
        goldInvested += invested;
        goldCurrentValue += currentVal;
        goldBasePaid += basePaid;
      } else {
        silverWeight += weight;
        silverInvested += invested;
        silverCurrentValue += currentVal;
        silverBasePaid += basePaid;
      }
    }

    const totalWeight = roundMoney(goldWeight + silverWeight);
    const totalInvested = roundMoney(goldInvested + silverInvested);
    const totalCurrentValue = roundMoney(goldCurrentValue + silverCurrentValue);
    const totalGainLoss = roundMoney(totalCurrentValue - totalInvested);
    const totalGainLossPct =
      totalInvested > 0 ? roundMoney((totalGainLoss / totalInvested) * 100) : 0;

    const goldGainLoss = roundMoney(goldCurrentValue - goldInvested);
    const goldGainLossPct = goldInvested > 0 ? roundMoney((goldGainLoss / goldInvested) * 100) : 0;

    const silverGainLoss = roundMoney(silverCurrentValue - silverInvested);
    const silverGainLossPct =
      silverInvested > 0 ? roundMoney((silverGainLoss / silverInvested) * 100) : 0;

    const goldAvgBuyRate = goldWeight > 0 ? roundMoney(goldInvested / goldWeight) : 0;
    const silverAvgBuyRate = silverWeight > 0 ? roundMoney(silverInvested / silverWeight) : 0;

    return {
      goldWeight: roundMoney(goldWeight),
      silverWeight: roundMoney(silverWeight),
      totalWeight,
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPct,
      goldInvested: roundMoney(goldInvested),
      silverInvested: roundMoney(silverInvested),
      goldCurrentValue: roundMoney(goldCurrentValue),
      silverCurrentValue: roundMoney(silverCurrentValue),
      goldGainLoss,
      goldGainLossPct,
      silverGainLoss,
      silverGainLossPct,
      goldAvgBuyRate,
      silverAvgBuyRate,
      goldMarketRate: marketRates.gold,
      silverMarketRate: marketRates.silver,
      purchaseCount: enrichedPurchases.length,
    };
  }, [enrichedPurchases, marketRates]);

  // Unique platform list for filter dropdown
  const platforms = useMemo(() => {
    const set = new Set<string>();
    for (const p of enrichedPurchases) {
      if (p.platform) set.add(p.platform);
    }
    return Array.from(set).sort();
  }, [enrichedPurchases]);

  // Analytics for Charts
  const chartData = useMemo(() => {
    // 1. Chronological Invested vs Market Value
    const sortedChronological = [...enrichedPurchases].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cumInvested = 0;
    let cumGoldGrams = 0;
    let cumSilverGrams = 0;

    const timeline = sortedChronological.map((item) => {
      cumInvested += Number(item.amount_paid) || 0;
      if (item.type === 'gold') {
        cumGoldGrams += Number(item.weight_in_gram) || 0;
      } else {
        cumSilverGrams += Number(item.weight_in_gram) || 0;
      }
      const valAtPoint = roundMoney(
        cumGoldGrams * marketRates.gold + cumSilverGrams * marketRates.silver
      );

      const d = new Date(item.date);
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

      return {
        date: item.date,
        label,
        invested: roundMoney(cumInvested),
        currentValue: valAtPoint,
        gainLoss: roundMoney(valAtPoint - cumInvested),
      };
    });

    // 2. Gold vs Silver Allocation
    const allocation = [
      {
        name: 'Gold (24K)',
        value: totals.goldCurrentValue,
        weight: totals.goldWeight,
        unit: 'g',
        color: '#f59e0b', // Amber / Gold tone
      },
      {
        name: 'Silver (999)',
        value: totals.silverCurrentValue,
        weight: totals.silverWeight,
        unit: 'g',
        color: '#94a3b8', // Slate / Silver tone
      },
    ].filter((item) => item.value > 0);

    // 3. Purchases by Month (Consistency Bar)
    const monthlyMap = new Map<
      string,
      { month: string; goldAmount: number; silverAmount: number; total: number }
    >();
    for (const item of sortedChronological) {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const current = monthlyMap.get(key) || {
        month: monthLabel,
        goldAmount: 0,
        silverAmount: 0,
        total: 0,
      };

      const amt = Number(item.amount_paid) || 0;
      if (item.type === 'gold') {
        current.goldAmount = roundMoney(current.goldAmount + amt);
      } else {
        current.silverAmount = roundMoney(current.silverAmount + amt);
      }
      current.total = roundMoney(current.total + amt);
      monthlyMap.set(key, current);
    }
    const purchasesByMonth = Array.from(monthlyMap.values());

    // 4. Rate Comparison: Buy Rate vs Today's Rate
    const rateComparison = sortedChronological.map((item) => {
      const isGold = item.type === 'gold';
      const market = isGold ? marketRates.gold : marketRates.silver;
      const buyRate = Number(item.rate_per_gram) || 0;
      const d = new Date(item.date);
      return {
        name: `${item.type === 'gold' ? 'Gold' : 'Silver'} (${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`,
        buyRate,
        marketRate: market,
        platform: item.platform,
        diffPct: roundMoney(((market - buyRate) / buyRate) * 100),
      };
    });

    // 5. By Platform Distribution
    const platformMap = new Map<string, number>();
    for (const item of enrichedPurchases) {
      const p = item.platform || 'Other';
      platformMap.set(p, roundMoney((platformMap.get(p) || 0) + Number(item.amount_paid) || 0));
    }
    const byPlatform = Array.from(platformMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      timeline,
      allocation,
      purchasesByMonth,
      rateComparison,
      byPlatform,
    };
  }, [enrichedPurchases, marketRates, totals]);

  // Selected purchase row
  const selectedPurchase = useMemo(() => {
    return enrichedPurchases.find((p) => p.id === selectedPurchaseId) || null;
  }, [enrichedPurchases, selectedPurchaseId]);

  // Action: Refresh live rates simulation
  const refreshMarketRates = useCallback(() => {
    setIsRefreshingRates(true);
    setTimeout(() => {
      // Simulate micro market fluctuation within +/- 0.4%
      const goldDelta = Math.round((Math.random() - 0.5) * 40);
      const silverDelta = roundMoney((Math.random() - 0.5) * 1.2);
      setMarketRates({
        gold: Math.max(7000, DEFAULT_MARKET_RATES.gold + goldDelta),
        silver: Math.max(80, roundMoney(DEFAULT_MARKET_RATES.silver + silverDelta)),
      });
      setLastRefreshedAt(new Date());
      setIsRefreshingRates(false);
    }, 600);
  }, []);

  // Action: Add purchase
  const handleAddPurchase = useCallback(
    async (dto: CreateDigitalAssetDto) => {
      try {
        // Attempt server call
        const result = await createMutation(dto);
        if (result?.success && result?.data) {
          const next = [result.data, ...localPurchases];
          setLocalPurchases(next);
          persistLocalPurchases(next);
          refetch();
          return result.data;
        }
      } catch {
        // Fallback to local storage if offline or server error
        const localItem: DigitalAsset = {
          id: `local-gold-${Date.now()}`,
          user_id: 'user-current',
          type: dto.type,
          date: dto.date,
          platform: dto.platform,
          rate_per_gram: dto.rate_per_gram,
          amount_paid: dto.amount_paid,
          gst_3_percent: dto.gst_3_percent ?? roundMoney(dto.amount_paid * 0.03),
          weight_in_gram: dto.weight_in_gram,
          asset_value: dto.asset_value ?? roundMoney(dto.weight_in_gram * dto.rate_per_gram),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const next = [localItem, ...localPurchases];
        setLocalPurchases(next);
        persistLocalPurchases(next);
        return localItem;
      }
    },
    [createMutation, localPurchases, refetch]
  );

  // Action: Edit purchase
  const handleEditPurchase = useCallback((id: string, updates: Partial<UpdateDigitalAssetDto>) => {
    setLocalPurchases((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          const nextType = updates.type ?? item.type;
          const nextDate = updates.date ?? item.date;
          const nextPlatform = updates.platform ?? item.platform;
          const nextRate = updates.rate_per_gram ?? item.rate_per_gram;
          const nextWeight = updates.weight_in_gram ?? item.weight_in_gram;
          const nextAmount = updates.amount_paid ?? item.amount_paid;
          const nextGst = updates.gst_3_percent ?? item.gst_3_percent;
          const nextValue = updates.asset_value ?? roundMoney(nextWeight * nextRate);
          return {
            ...item,
            type: nextType,
            date: nextDate,
            platform: nextPlatform,
            rate_per_gram: nextRate,
            weight_in_gram: nextWeight,
            amount_paid: nextAmount,
            gst_3_percent: nextGst,
            asset_value: nextValue,
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      });
      persistLocalPurchases(next);
      return next;
    });
  }, []);

  // Action: Delete purchase
  const handleDeletePurchase = useCallback(
    (id: string) => {
      setLocalPurchases((prev) => {
        const next = prev.filter((item) => item.id !== id);
        persistLocalPurchases(next);
        return next;
      });
      if (selectedPurchaseId === id) {
        setSelectedPurchaseId(null);
      }
    },
    [selectedPurchaseId]
  );

  // Action: Update filters
  const updateFilters = useCallback((updates: Partial<GoldSilverFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    purchases: enrichedPurchases,
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
    isLoading: isServerLoading || isCreatingDigital,
    refetch,
  };
}
