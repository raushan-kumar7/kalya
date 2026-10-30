import { ReactNode } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { IconButton, Screen, Typo } from '../ui';
import { logoColored } from '@/constants/images';

interface AuthContainerProps {
  children: ReactNode;
  /** Show a back button above the logo. @default false */
  showBackButton?: boolean;
  /** Custom back handler. Falls back to router.back(). */
  onBackPress?: () => void;
}

export const AuthContainer = ({
  children,
  showBackButton = false,
  onBackPress,
}: AuthContainerProps) => {
  const router = useRouter();
  const year = new Date().getFullYear();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <Screen
      scrollable
      contentContainerClassName="items-center justify-between px-6 py-4"
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View className="w-full items-center">
        {showBackButton ? (
          <View className="mb-2 w-full items-start">
            <IconButton
              icon={<ChevronLeft size={20} color="#0d3e26" />}
              variant="glass"
              size="md"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={handleBack}
            />
          </View>
        ) : null}

        <View className="h-14 w-40 items-center justify-center self-center">
          <Image
            source={logoColored}
            resizeMode="contain"
            style={styles.logo}
            accessibilityLabel="Kalya logo"
          />
        </View>
      </View>

      <View className="my-auto w-full flex-1 items-center justify-center">{children}</View>

      <View className="mt-auto w-full items-center py-4">
        <Typo size="body-sm" tone="secondary" className="text-center font-semibold">
          Kalya Personal Finance App
        </Typo>
        <Typo size="caption" tone="muted" className="mt-1 text-center">
          &copy; {year} All rights reserved.
        </Typo>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
