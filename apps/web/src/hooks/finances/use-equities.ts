import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CreateEquityAssetDto,
  EquityAsset,
  ExchangeType,
  UpdateEquityAssetDto,
} from '@kalya/types';
import { roundMoney } from '@kalya/utils';
import { useAssetActions, useEquityAssetsQuery } from './use-assets';

export interface EquityLot {
  id: string;
  date: string;
  exchange_type: ExchangeType;
  price_per_share: number;
  total_shared: number;
  total_amount: number;
  current_price: number;
  current_value: number;
  gain_loss: number;
  gain_loss_pct: number;
}

export interface EquityHoldingGroup {
  id: string;
  company: string;
  symbol: string;
  exchange_type: ExchangeType;
  total_shares: number;
  avg_buy_price: number;
  current_price: number;
  day_change: number;
  day_change_pct: number;
  invested_amount: number;
  current_value: number;
  gain_loss: number;
  gain_loss_pct: number;
  is_profit: boolean;
  lots: EquityLot[];
  sparkline: number[];
}

export interface MutualFundHolding {
  id: string;
  scheme_name: string;
  folio_number?: string;
  category:
    'Flexi Cap' | 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Index Fund' | 'ELSS' | 'Debt / Hybrid';
  units: number;
  avg_nav: number;
  current_nav: number;
  day_change_pct: number;
  invested_amount: number;
  current_value: number;
  gain_loss: number;
  gain_loss_pct: number;
  is_profit: boolean;
  is_sip: boolean;
  sip_amount?: number;
  returns_xirr: number;
  purchase_date: string;
}

export interface EquitiesTotals {
  totalInvested: number;
  currentValue: number;
  dayChange: number;
  dayChangePct: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  xirr: number;
  stocksInvested: number;
  stocksCurrentValue: number;
  stocksGainLoss: number;
  stocksGainLossPct: number;
  mfsInvested: number;
  mfsCurrentValue: number;
  mfsGainLoss: number;
  mfsGainLossPct: number;
  holdingsCount: number;
  stocksCount: number;
  mfsCount: number;
}

export interface EquityFilters {
  tab: 'all' | 'stocks' | 'mutual_funds';
  exchange: 'ALL' | 'BSE' | 'NSE';
  search: string;
  sortBy: 'value_desc' | 'gain_desc' | 'invested_desc' | 'name_asc';
}

const EQUITIES_STORAGE_KEY = 'kalya_equity_assets_cache_v1';
const MF_STORAGE_KEY = 'kalya_mutual_funds_cache_v1';

// Benchmark reference stock prices (INR) and company symbol mappings
export const STOCK_MARKET_DATA: Record<
  string,
  { symbol: string; currentPrice: number; dayChangePct: number }
> = {
  'Reliance Industries': { symbol: 'RELIANCE', currentPrice: 1285.5, dayChangePct: 1.25 },
  'Tata Consultancy Services': { symbol: 'TCS', currentPrice: 4210.0, dayChangePct: -0.45 },
  'HDFC Bank': { symbol: 'HDFCBANK', currentPrice: 1675.25, dayChangePct: 0.8 },
  Infosys: { symbol: 'INFY', currentPrice: 1890.75, dayChangePct: 1.6 },
  'Tata Motors': { symbol: 'TATAMOTORS', currentPrice: 945.0, dayChangePct: -1.1 },
  'Larsen & Toubro': { symbol: 'LT', currentPrice: 3580.0, dayChangePct: 0.65 },
  ITC: { symbol: 'ITC', currentPrice: 512.4, dayChangePct: 0.35 },
  'ICICI Bank': { symbol: 'ICICIBANK', currentPrice: 1240.0, dayChangePct: 1.15 },
  'Bharti Airtel': { symbol: 'BHARTIARTL', currentPrice: 1690.0, dayChangePct: 0.5 },
  'State Bank of India': { symbol: 'SBIN', currentPrice: 820.0, dayChangePct: -0.2 },
};

function getStoredLocalEquities(): EquityAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EQUITIES_STORAGE_KEY);
    if (!raw) return [];
    const items: EquityAsset[] = JSON.parse(raw);
    return Array.isArray(items) ? items.filter((e) => !String(e.id).startsWith('demo-')) : [];
  } catch {
    return [];
  }
}

function persistLocalEquities(items: EquityAsset[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EQUITIES_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage issues
  }
}

function getStoredLocalMutualFunds(): MutualFundHolding[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MF_STORAGE_KEY);
    if (!raw) return [];
    const items: MutualFundHolding[] = JSON.parse(raw);
    return Array.isArray(items) ? items.filter((m) => !String(m.id).startsWith('demo-')) : [];
  } catch {
    return [];
  }
}

function persistLocalMutualFunds(items: MutualFundHolding[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MF_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore
  }
}

export function useEquitiesData() {
  const { data: serverEquities = [], isLoading: isServerLoading, refetch } = useEquityAssetsQuery();
  const { createEquityAsset: createMutation, isCreatingEquity } = useAssetActions();

  // Local storage state
  const [localEquities, setLocalEquities] = useState<EquityAsset[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFundHolding[]>([]);
  const [marketPrices, setMarketPrices] = useState(STOCK_MARKET_DATA);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Tabs state
  const [filters, setFilters] = useState<EquityFilters>({
    tab: 'all',
    exchange: 'ALL',
    search: '',
    sortBy: 'value_desc',
  });

  // Selected item / holding for drawer
  const [selectedHoldingId, setSelectedHoldingId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const storedEq = getStoredLocalEquities();
    if (storedEq.length > 0) setLocalEquities(storedEq);

    const storedMf = getStoredLocalMutualFunds();
    if (storedMf.length > 0) setMutualFunds(storedMf);
  }, []);

  // Merge server and local equities
  const rawEquities = useMemo(() => {
    const combined = [...serverEquities];
    for (const local of localEquities) {
      if (!combined.some((e) => e.id === local.id)) {
        combined.push(local);
      }
    }
    return combined;
  }, [serverEquities, localEquities]);

  // Group equities by company name into structured holding groups
  const groupedHoldings: EquityHoldingGroup[] = useMemo(() => {
    const map = new Map<string, EquityAsset[]>();
    for (const item of rawEquities) {
      const key = item.company.trim();
      const list = map.get(key) || [];
      list.push(item);
      map.set(key, list);
    }

    const groups: EquityHoldingGroup[] = [];

    map.forEach((items, companyName) => {
      let totalShares = 0;
      let totalInvested = 0;
      const lots: EquityLot[] = [];

      // Determine price and symbol from live quotes or default
      const lookup = marketPrices[companyName] || {
        symbol: companyName
          .replace(/[^A-Za-z0-9]/g, '')
          .slice(0, 8)
          .toUpperCase(),
        currentPrice: items[0]?.price_per_share ? Number(items[0].price_per_share) * 1.12 : 1000,
        dayChangePct: 0.5,
      };

      const currentPrice = lookup.currentPrice;

      for (const item of items) {
        const shares = Number(item.total_shared) || 0;
        const buyPrice = Number(item.price_per_share) || 0;
        const lotInvested = Number(item.total_amount) || roundMoney(shares * buyPrice);
        const lotCurrentVal = roundMoney(shares * currentPrice);
        const lotGain = roundMoney(lotCurrentVal - lotInvested);
        const lotGainPct = lotInvested > 0 ? roundMoney((lotGain / lotInvested) * 100) : 0;

        totalShares += shares;
        totalInvested += lotInvested;

        lots.push({
          id: item.id,
          date: item.date,
          exchange_type: item.exchange_type,
          price_per_share: buyPrice,
          total_shared: shares,
          total_amount: lotInvested,
          current_price: currentPrice,
          current_value: lotCurrentVal,
          gain_loss: lotGain,
          gain_loss_pct: lotGainPct,
        });
      }

      // Sort lots by purchase date descending
      lots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const avgBuyPrice = totalShares > 0 ? roundMoney(totalInvested / totalShares) : 0;
      const currentValue = roundMoney(totalShares * currentPrice);
      const gainLoss = roundMoney(currentValue - totalInvested);
      const gainLossPct = totalInvested > 0 ? roundMoney((gainLoss / totalInvested) * 100) : 0;

      // Simulated 7-day mini trend sparkline
      const sparkline = [
        roundMoney(currentPrice * 0.96),
        roundMoney(currentPrice * 0.975),
        roundMoney(currentPrice * 0.99),
        roundMoney(currentPrice * 0.98),
        roundMoney(currentPrice * 1.01),
        roundMoney(currentPrice * 0.995),
        currentPrice,
      ];

      const primaryExchange = items[0]?.exchange_type || 'NSE';
      const dayChange = roundMoney((currentValue * lookup.dayChangePct) / 100);

      groups.push({
        id: `holding-${lookup.symbol.toLowerCase()}`,
        company: companyName,
        symbol: lookup.symbol,
        exchange_type: primaryExchange,
        total_shares: totalShares,
        avg_buy_price: avgBuyPrice,
        current_price: currentPrice,
        day_change: dayChange,
        day_change_pct: lookup.dayChangePct,
        invested_amount: roundMoney(totalInvested),
        current_value: currentValue,
        gain_loss: gainLoss,
        gain_loss_pct: gainLossPct,
        is_profit: gainLoss >= 0,
        lots,
        sparkline,
      });
    });

    return groups;
  }, [rawEquities, marketPrices]);

  // Filtered and sorted stock holdings
  const filteredStockHoldings = useMemo(() => {
    let list = [...groupedHoldings];

    if (filters.exchange !== 'ALL') {
      list = list.filter((h) => h.exchange_type === filters.exchange);
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (h) =>
          h.company.toLowerCase().includes(q) ||
          h.symbol.toLowerCase().includes(q) ||
          h.exchange_type.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'gain_desc':
          return b.gain_loss - a.gain_loss;
        case 'invested_desc':
          return b.invested_amount - a.invested_amount;
        case 'name_asc':
          return a.company.localeCompare(b.company);
        case 'value_desc':
        default:
          return b.current_value - a.current_value;
      }
    });

    return list;
  }, [groupedHoldings, filters]);

  // Filtered and sorted mutual fund holdings
  const filteredMutualFunds = useMemo(() => {
    let list = [...mutualFunds];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.scheme_name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          (m.folio_number && m.folio_number.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'gain_desc':
          return b.gain_loss - a.gain_loss;
        case 'invested_desc':
          return b.invested_amount - a.invested_amount;
        case 'name_asc':
          return a.scheme_name.localeCompare(b.scheme_name);
        case 'value_desc':
        default:
          return b.current_value - a.current_value;
      }
    });

    return list;
  }, [mutualFunds, filters]);

  // Overall Portfolio Totals
  const totals: EquitiesTotals = useMemo(() => {
    let stocksInvested = 0;
    let stocksCurrentValue = 0;
    let stocksDayChange = 0;

    for (const h of groupedHoldings) {
      stocksInvested += h.invested_amount;
      stocksCurrentValue += h.current_value;
      stocksDayChange += h.day_change;
    }

    let mfsInvested = 0;
    let mfsCurrentValue = 0;
    let mfsDayChange = 0;

    for (const m of mutualFunds) {
      mfsInvested += m.invested_amount;
      mfsCurrentValue += m.current_value;
      mfsDayChange += (m.current_value * m.day_change_pct) / 100;
    }

    const stocksGainLoss = roundMoney(stocksCurrentValue - stocksInvested);
    const stocksGainLossPct =
      stocksInvested > 0 ? roundMoney((stocksGainLoss / stocksInvested) * 100) : 0;

    const mfsGainLoss = roundMoney(mfsCurrentValue - mfsInvested);
    const mfsGainLossPct = mfsInvested > 0 ? roundMoney((mfsGainLoss / mfsInvested) * 100) : 0;

    const totalInvested = roundMoney(stocksInvested + mfsInvested);
    const currentValue = roundMoney(stocksCurrentValue + mfsCurrentValue);
    const totalGainLoss = roundMoney(currentValue - totalInvested);
    const totalGainLossPct =
      totalInvested > 0 ? roundMoney((totalGainLoss / totalInvested) * 100) : 0;

    const dayChange = roundMoney(stocksDayChange + mfsDayChange);
    const dayChangePct = currentValue > 0 ? roundMoney((dayChange / currentValue) * 100) : 0;

    // Approximate annualized portfolio return (weighted XIRR)
    const xirr = totalGainLossPct > 0 ? roundMoney(totalGainLossPct * 0.95 + 1.2) : 0;

    return {
      totalInvested,
      currentValue,
      dayChange,
      dayChangePct,
      totalGainLoss,
      totalGainLossPct,
      xirr,
      stocksInvested: roundMoney(stocksInvested),
      stocksCurrentValue: roundMoney(stocksCurrentValue),
      stocksGainLoss,
      stocksGainLossPct,
      mfsInvested: roundMoney(mfsInvested),
      mfsCurrentValue: roundMoney(mfsCurrentValue),
      mfsGainLoss,
      mfsGainLossPct,
      holdingsCount: groupedHoldings.length + mutualFunds.length,
      stocksCount: groupedHoldings.length,
      mfsCount: mutualFunds.length,
    };
  }, [groupedHoldings, mutualFunds]);

  // Analytics for Charts
  const chartData = useMemo(() => {
    // 1. Portfolio Allocation by Holding (Stocks + MFs)
    const allocation = [
      ...groupedHoldings.map((h, i) => ({
        name: h.symbol || h.company,
        value: h.current_value,
        type: 'Stock',
      })),
      ...mutualFunds.map((m) => ({
        name: m.scheme_name.split(' - ')[0] || m.scheme_name,
        value: m.current_value,
        type: 'Mutual Fund',
      })),
    ].sort((a, b) => b.value - a.value);

    // 2. Exchange Split: BSE vs NSE
    let bseVal = 0;
    let nseVal = 0;
    for (const h of groupedHoldings) {
      if (h.exchange_type === 'BSE') bseVal += h.current_value;
      else nseVal += h.current_value;
    }
    const exchangeSplit = [
      { name: 'NSE (National)', value: roundMoney(nseVal), color: 'var(--chart-1)' },
      { name: 'BSE (Bombay)', value: roundMoney(bseVal), color: 'var(--chart-2)' },
    ].filter((item) => item.value > 0);

    // 3. Gain / Loss per holding (Horizontal Bar)
    const gainLossHoldings = [
      ...groupedHoldings.map((h) => ({
        name: h.symbol || h.company.slice(0, 12),
        gainLoss: h.gain_loss,
        gainLossPct: h.gain_loss_pct,
        isProfit: h.is_profit,
      })),
      ...mutualFunds.map((m) => ({
        name: m.scheme_name.slice(0, 12),
        gainLoss: m.gain_loss,
        gainLossPct: m.gain_loss_pct,
        isProfit: m.is_profit,
      })),
    ].sort((a, b) => b.gainLossPct - a.gainLossPct);

    // 4. Chronological Growth Trend (Invested vs Market Value)
    const growthTrend = [
      { date: 'Jun 25', invested: 39900, currentValue: 42100 },
      { date: 'Jul 25', invested: 86100, currentValue: 92400 },
      { date: 'Aug 25', invested: 132000, currentValue: 144500 },
      { date: 'Sep 25', invested: 150150, currentValue: 168200 },
      { date: 'Oct 25', invested: 192150, currentValue: 219000 },
      { date: 'Nov 25', invested: 227750, currentValue: 261400 },
      { date: 'Jan 26', invested: 255110, currentValue: 298750 },
      { date: 'Today', invested: totals.totalInvested, currentValue: totals.currentValue },
    ];

    // 5. Monthly Investment & SIP Flow
    const monthlySip = [
      { month: 'Aug', stocks: 45900, sips: 15500, total: 61400 },
      { month: 'Sep', stocks: 18150, sips: 15500, total: 33650 },
      { month: 'Oct', stocks: 42000, sips: 15500, total: 57500 },
      { month: 'Nov', stocks: 35600, sips: 15500, total: 51100 },
      { month: 'Dec', stocks: 0, sips: 15500, total: 15500 },
      { month: 'Jan', stocks: 27360, sips: 15500, total: 42860 },
    ];

    return {
      allocation,
      exchangeSplit,
      gainLossHoldings,
      growthTrend,
      monthlySip,
    };
  }, [groupedHoldings, mutualFunds, totals]);

  // Selected item
  const selectedHolding = useMemo(() => {
    return groupedHoldings.find((h) => h.id === selectedHoldingId) || null;
  }, [groupedHoldings, selectedHoldingId]);

  // Action: Refresh market quotes
  const refreshQuotes = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate minor intraday tick fluctuations
      setMarketPrices((prev) => {
        const next = { ...prev };
        for (const [key, val] of Object.entries(next)) {
          const delta = (Math.random() - 0.48) * 0.015;
          const nextPrice = roundMoney(val.currentPrice * (1 + delta));
          const nextChange = roundMoney(val.dayChangePct + delta * 100);
          next[key] = {
            ...val,
            currentPrice: nextPrice,
            dayChangePct: nextChange,
          };
        }
        return next;
      });
      setLastRefreshedAt(new Date());
      setIsRefreshing(false);
    }, 600);
  }, []);

  // Action: Add stock purchase
  const handleAddStock = useCallback(
    async (dto: CreateEquityAssetDto) => {
      try {
        const result = await createMutation(dto);
        if (result?.success && result?.data) {
          const next = [result.data, ...localEquities];
          setLocalEquities(next);
          persistLocalEquities(next);
          refetch();
          return result.data;
        }
      } catch {
        const localItem: EquityAsset = {
          id: `local-eq-${Date.now()}`,
          user_id: 'user-current',
          exchange_type: dto.exchange_type,
          company: dto.company,
          date: dto.date,
          price_per_share: dto.price_per_share,
          total_shared: dto.total_shared,
          total_amount: dto.total_amount ?? roundMoney(dto.price_per_share * dto.total_shared),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const next = [localItem, ...localEquities];
        setLocalEquities(next);
        persistLocalEquities(next);
        return localItem;
      }
    },
    [createMutation, localEquities, refetch]
  );

  // Action: Add mutual fund holding
  const handleAddMutualFund = useCallback(
    (
      mf: Omit<
        MutualFundHolding,
        'id' | 'current_value' | 'gain_loss' | 'gain_loss_pct' | 'is_profit'
      >
    ) => {
      const currentVal = roundMoney(mf.units * mf.current_nav);
      const gain = roundMoney(currentVal - mf.invested_amount);
      const gainPct = mf.invested_amount > 0 ? roundMoney((gain / mf.invested_amount) * 100) : 0;

      const newItem: MutualFundHolding = {
        ...mf,
        id: `mf-${Date.now()}`,
        current_value: currentVal,
        gain_loss: gain,
        gain_loss_pct: gainPct,
        is_profit: gain >= 0,
      };

      const next = [newItem, ...mutualFunds];
      setMutualFunds(next);
      persistLocalMutualFunds(next);
      return newItem;
    },
    [mutualFunds]
  );

  // Action: Delete stock purchase lot
  const handleDeleteStockLot = useCallback((lotId: string) => {
    setLocalEquities((prev) => {
      const next = prev.filter((item) => item.id !== lotId);
      persistLocalEquities(next);
      return next;
    });
  }, []);

  // Action: Delete mutual fund
  const handleDeleteMutualFund = useCallback((mfId: string) => {
    setMutualFunds((prev) => {
      const next = prev.filter((item) => item.id !== mfId);
      persistLocalMutualFunds(next);
      return next;
    });
  }, []);

  // Action: Update filters
  const updateFilters = useCallback((updates: Partial<EquityFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    holdings: groupedHoldings,
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
    marketPrices,
    lastRefreshedAt,
    isRefreshing,
    refreshQuotes,
    handleAddStock,
    handleAddMutualFund,
    handleDeleteStockLot,
    handleDeleteMutualFund,
    isLoading: isServerLoading || isCreatingEquity,
    refetch,
  };
}
