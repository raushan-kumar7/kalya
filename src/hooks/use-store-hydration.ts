"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/stores";

export function useStoreHydration() {
  useEffect(() => {
    useSidebarStore.persist.rehydrate();
  }, []);
}

export function StoreHydration() {
  useStoreHydration();
  return null;
}
