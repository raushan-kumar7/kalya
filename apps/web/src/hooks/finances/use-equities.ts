import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CreateEquityAssetDto,
  EquityAsset,
  ExchangeType,
  UpdateEquityAssetDto,
} from '@kalya/types';
import { roundMoney } from '@kalya/utils';
import { useAssetActions, useEquityAssetsQuery } from './use-assets';

/** One stock purchase (a single row in the equity table) */
export interface EquityRow {
  id: string;
  company: string;
  exchange_type: ExchangeType;
  date: string;
  price_per_share: number;
  total_shared: number;
  total_amount: number;
}

export interface EquitiesTotals {
  totalInvested: number;
  totalShares: number;
  stocksCount: number;
  purchasesCount: number;
  stocksCurrentValue: number;
  mfsCurrentValue: number;
  mfsCount: number;
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
  purchase_date?: string;
}

export const STOCK_MARKET_DATA: Record<
  string,
  { symbol: string; price: number; currentPrice: number; change: number }
> = {
  'Reliance Industries': { symbol: 'RELIANCE', price: 1285.5, currentPrice: 1285.5, change: 1.45 },
  'Tata Consultancy Services': {
    symbol: 'TCS',
    price: 4210.0,
    currentPrice: 4210.0,
    change: -0.65,
  },
  'HDFC Bank': { symbol: 'HDFCBANK', price: 1675.25, currentPrice: 1675.25, change: 0.8 },
  Infosys: { symbol: 'INFY', price: 1890.75, currentPrice: 1890.75, change: 1.15 },
  'Tata Motors': { symbol: 'TATAMOTORS', price: 945.0, currentPrice: 945.0, change: 2.3 },
  'Larsen & Toubro': { symbol: 'LT', price: 3580.0, currentPrice: 3580.0, change: -0.4 },
  ITC: { symbol: 'ITC', price: 512.4, currentPrice: 512.4, change: 0.25 },
  'ICICI Bank': { symbol: 'ICICIBANK', price: 1240.0, currentPrice: 1240.0, change: 0.9 },
};

const EQUITIES_STORAGE_KEY = 'kalya_equity_assets_cache_v1';

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

function toRow(item: EquityAsset): EquityRow {
  const shares = Number(item.total_shared) || 0;
  const price = Number(item.price_per_share) || 0;

  return {
    id: item.id,
    company: String(item.company).trim(),
    exchange_type: item.exchange_type,
    date: String(item.date).slice(0, 10),
    price_per_share: price,
    total_shared: shares,
    total_amount: Number(item.total_amount) || roundMoney(shares * price),
  };
}

export function useEquitiesData() {
  const { data: serverEquities = [], isLoading: isServerLoading, refetch } = useEquityAssetsQuery();
  const {
    createEquityAsset: createMutation,
    updateEquityAsset: updateMutation,
    deleteEquityAsset: deleteMutation,
    isCreatingEquity,
    isUpdatingEquity,
    isDeletingEquity,
  } = useAssetActions();

  const [localEquities, setLocalEquities] = useState<EquityAsset[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Load locally cached purchases
  useEffect(() => {
    const stored = getStoredLocalEquities();
    if (stored.length > 0) setLocalEquities(stored);
  }, []);

  // Merge server + local purchases, newest first
  const equities: EquityRow[] = useMemo(() => {
    const map = new Map<string, EquityAsset>();

    for (const s of serverEquities) {
      if (!deletedIds.has(s.id)) {
        map.set(s.id, s);
      }
    }

    for (const l of localEquities) {
      if (!deletedIds.has(l.id)) {
        if (map.has(l.id)) {
          map.set(l.id, { ...map.get(l.id)!, ...l });
        } else {
          map.set(l.id, l);
        }
      }
    }

    return Array.from(map.values())
      .map(toRow)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serverEquities, localEquities, deletedIds]);

  const totals: EquitiesTotals = useMemo(() => {
    let totalInvested = 0;
    let totalShares = 0;
    const companies = new Set<string>();

    for (const e of equities) {
      totalInvested += e.total_amount;
      totalShares += e.total_shared;
      companies.add(e.company.toLowerCase());
    }

    return {
      totalInvested: roundMoney(totalInvested),
      totalShares,
      stocksCount: companies.size,
      purchasesCount: equities.length,
      stocksCurrentValue: roundMoney(totalInvested),
      mfsCurrentValue: 0,
      mfsCount: 0,
    };
  }, [equities]);

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

  // Action: Edit stock purchase
  const handleEditStock = useCallback(
    async (id: string, updates: Partial<UpdateEquityAssetDto>) => {
      try {
        await updateMutation(id, updates);
        refetch();
      } catch {
        // Fallback for offline/local
      }

      setLocalEquities((prev) => {
        const next = prev.map((item) => {
          if (item.id === id) {
            const nextCompany = updates.company ?? item.company;
            const nextExchange = updates.exchange_type ?? item.exchange_type;
            const nextDate = updates.date ?? item.date;
            const nextPrice = updates.price_per_share ?? item.price_per_share;
            const nextShares = updates.total_shared ?? item.total_shared;
            const nextTotal = updates.total_amount ?? roundMoney(nextPrice * nextShares);
            return {
              ...item,
              company: nextCompany,
              exchange_type: nextExchange,
              date: nextDate,
              price_per_share: nextPrice,
              total_shared: nextShares,
              total_amount: nextTotal,
              updated_at: new Date().toISOString(),
            };
          }
          return item;
        });
        persistLocalEquities(next);
        return next;
      });
    },
    [updateMutation, refetch]
  );

  // Action: Delete stock purchase
  const handleDeleteStockLot = useCallback(
    async (lotId: string) => {
      setDeletedIds((prev) => new Set(prev).add(lotId));
      try {
        await deleteMutation(lotId);
        refetch();
      } catch {
        // Ignore offline
      }
      setLocalEquities((prev) => {
        const next = prev.filter((item) => item.id !== lotId);
        persistLocalEquities(next);
        return next;
      });
    },
    [deleteMutation, refetch]
  );

  return {
    equities,
    totals,
    handleAddStock,
    handleEditStock,
    handleDeleteStockLot,
    isLoading: isServerLoading || isCreatingEquity || isUpdatingEquity || isDeletingEquity,
    refetch,
  };
}
