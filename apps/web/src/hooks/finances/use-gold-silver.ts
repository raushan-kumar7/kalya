import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CreateDigitalAssetDto,
  DigitalAsset,
  DigitalAssetType,
  UpdateDigitalAssetDto,
} from '@kalya/types';
import { roundMoney } from '@kalya/utils';
import { useAssetActions, useDigitalAssetsQuery } from './use-assets';

export interface DigitalAssetItem extends DigitalAsset {}

export interface GoldSilverTotals {
  totalInvested: number;
  totalWeight: number;
  goldWeight: number;
  goldInvested: number;
  silverWeight: number;
  silverInvested: number;
  purchaseCount: number;
}

const GOLD_SILVER_STORAGE_KEY = 'kalya_digital_assets_cache_v1';

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

function toRow(raw: any): DigitalAssetItem {
  const weight = Number(raw.weight_in_gram ?? raw.weightInGram) || 0;
  const rate = Number(raw.rate_per_gram ?? raw.ratePerGram) || 0;
  const amountPaid = Number(raw.amount_paid ?? raw.amountPaid) || 0;

  const rawGst = Number(raw.gst_3_percent ?? raw.gst3_percent ?? raw.gst3Percent);
  const gst3Percent =
    !Number.isNaN(rawGst) && rawGst > 0
      ? roundMoney(rawGst)
      : roundMoney(weight * rate * 0.03 || (amountPaid > 0 ? (amountPaid * 0.03) / 1.03 : 0));

  return {
    id: raw.id,
    user_id: raw.user_id ?? raw.userId ?? 'user-current',
    type: (raw.type as DigitalAssetType) ?? 'gold',
    date: String(raw.date).slice(0, 10),
    platform: String(raw.platform || '').trim(),
    rate_per_gram: rate,
    weight_in_gram: weight,
    amount_paid: amountPaid,
    gst_3_percent: gst3Percent,
    asset_value: Number(raw.asset_value ?? raw.assetValue) || roundMoney(weight * rate),
    created_at: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? raw.updatedAt ?? new Date().toISOString(),
  };
}

export function useGoldSilverData() {
  const {
    data: serverPurchases = [],
    isLoading: isServerLoading,
    refetch,
  } = useDigitalAssetsQuery();

  const {
    createDigitalAsset: createMutation,
    updateDigitalAsset: updateMutation,
    deleteDigitalAsset: deleteMutation,
    isCreatingDigital,
    isUpdatingDigital,
    isDeletingDigital,
  } = useAssetActions();

  const [localPurchases, setLocalPurchases] = useState<DigitalAsset[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Load cached purchases on mount
  useEffect(() => {
    const stored = getStoredLocalPurchases();
    if (stored.length > 0) {
      setLocalPurchases(stored);
    }
  }, []);

  // Merge server & local purchases, excluding any deleted ids
  const purchases: DigitalAssetItem[] = useMemo(() => {
    const map = new Map<string, any>();

    for (const s of serverPurchases) {
      if (!deletedIds.has(s.id)) {
        map.set(s.id, s);
      }
    }

    for (const l of localPurchases) {
      if (!deletedIds.has(l.id)) {
        if (map.has(l.id)) {
          map.set(l.id, { ...map.get(l.id), ...l });
        } else {
          map.set(l.id, l);
        }
      }
    }

    return Array.from(map.values())
      .map(toRow)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serverPurchases, localPurchases, deletedIds]);

  // Compute portfolio totals (only the required fields)
  const totals: GoldSilverTotals = useMemo(() => {
    let goldWeight = 0;
    let silverWeight = 0;
    let goldInvested = 0;
    let silverInvested = 0;

    for (const item of purchases) {
      const weight = item.weight_in_gram;
      const invested = item.amount_paid;

      if (item.type === 'gold') {
        goldWeight += weight;
        goldInvested += invested;
      } else {
        silverWeight += weight;
        silverInvested += invested;
      }
    }

    return {
      totalInvested: roundMoney(goldInvested + silverInvested),
      totalWeight: roundMoney(goldWeight + silverWeight),
      goldWeight: roundMoney(goldWeight),
      goldInvested: roundMoney(goldInvested),
      silverWeight: roundMoney(silverWeight),
      silverInvested: roundMoney(silverInvested),
      purchaseCount: purchases.length,
    };
  }, [purchases]);

  // Action: Add purchase
  const handleAddPurchase = useCallback(
    async (dto: CreateDigitalAssetDto) => {
      try {
        const result = await createMutation(dto);
        if (result?.success && result?.data) {
          const next = [result.data, ...localPurchases];
          setLocalPurchases(next);
          persistLocalPurchases(next);
          refetch();
          return result.data;
        }
      } catch {
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
  const handleEditPurchase = useCallback(
    async (id: string, updates: Partial<UpdateDigitalAssetDto>) => {
      try {
        await updateMutation(id, updates);
        refetch();
      } catch {
        // Fallback for offline/local
      }

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
    },
    [updateMutation, refetch]
  );

  // Action: Delete purchase
  const handleDeletePurchase = useCallback(
    async (id: string) => {
      setDeletedIds((prev) => new Set(prev).add(id));
      try {
        await deleteMutation(id);
        refetch();
      } catch {
        // Fallback
      }
      setLocalPurchases((prev) => {
        const next = prev.filter((item) => item.id !== id);
        persistLocalPurchases(next);
        return next;
      });
    },
    [deleteMutation, refetch]
  );

  return {
    purchases,
    totals,
    handleAddPurchase,
    handleEditPurchase,
    handleDeletePurchase,
    isLoading: isServerLoading || isCreatingDigital || isUpdatingDigital || isDeletingDigital,
    refetch,
  };
}
