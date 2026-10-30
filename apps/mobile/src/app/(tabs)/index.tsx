import { Typo } from '@/components/ui';
import { useAuth } from '@/hooks/auth';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
// import { ShowUIComponents } from '@/components/ui/show-ui-components';

/**
 * App Index Route.
 * Directly renders the comprehensive Kalya UI Component Showcase.
 */
export default function Index() {
  const { user } = useAuth();
  return (
    <View className="flex-1 bg-kalya-primary-muted items-center justify-center">
      <StatusBar style="dark" />
      <Typo variant="display">{user?.name}</Typo>
    </View>
  );
}
