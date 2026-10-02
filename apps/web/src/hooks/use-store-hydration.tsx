'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useSidebarStore } from '@/stores/sidebar-store';

export const useStoreHydration = () => {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useSidebarStore.persist.rehydrate();
  }, []);
};

export function StoreHydration() {
  useStoreHydration();
  return null;
}

export default StoreHydration;
