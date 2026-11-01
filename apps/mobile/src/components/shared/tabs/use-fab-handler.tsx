import { useTabStore } from '@/stores/tabs';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export const useFabHandler = (handler: () => void) => {
  useFocusEffect(
    useCallback(() => {
      useTabStore.getState().setFabHandler(handler);
      return () => useTabStore.getState().clearFabHandler();
    }, [handler])
  );
};
