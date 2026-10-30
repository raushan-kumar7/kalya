import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './query-provider';
import { ToastContainer } from '@/components/ui/feedback/toast';

export interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          {children}
          <ToastContainer />
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default AppProviders;
