import { Image, Pressable, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Bell, Eye, EyeOff } from 'lucide-react-native';
import { logoColored } from '@/constants/images';
import { Avatar, HapticTouchable, triggerHaptic } from '../ui';

interface TopProps {
  hasUnread?: boolean;
  isBalanceHidden: boolean;
  userName?: string;
  avatarSource?: ImageSourcePropType | { uri: string } | null;
  onToggleBalance: () => void;
  onPressNotifications: () => void;
  onPressProfile: () => void;
}

export const Top = ({
  hasUnread = false,
  isBalanceHidden,
  userName,
  avatarSource,
  onToggleBalance,
  onPressNotifications,
  onPressProfile,
}: TopProps) => {
  const EyeIcon = isBalanceHidden ? EyeOff : Eye;

  return (
    <View className="w-full flex-row items-center justify-between px-5 py-3">
      <View className="flex-row items-center gap-2">
        <Image source={logoColored} resizeMode="contain" style={{ width: 96, height: 36 }} />
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-2.5">
        <HapticTouchable
          accessibilityRole="button"
          accessibilityLabel={isBalanceHidden ? 'Show balances' : 'Hide balances'}
          hapticTier="light"
          onPress={onToggleBalance}
          className="h-8 w-8 items-center justify-center rounded-full border border-kalya-border-subtle bg-white/80 shadow-sm"
        >
          <EyeIcon size={16} color="#0d3e26" />
        </HapticTouchable>

        <HapticTouchable
          accessibilityRole="button"
          accessibilityLabel={hasUnread ? 'Notifications, unread' : 'Notifications'}
          hapticTier="light"
          onPress={onPressNotifications}
          className="h-8 w-8 items-center justify-center rounded-full border border-kalya-border-subtle bg-white/80 shadow-sm"
        >
          <Bell size={16} color="#0d3e26" />
          {hasUnread ? (
            <View className="absolute -top-0.5 right-1 h-2.5 w-2.5 rounded-full border border-white bg-kalya-gold" />
          ) : null}
        </HapticTouchable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => {
            triggerHaptic('light');
            onPressProfile();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
        >
          <View pointerEvents="none">
            <Avatar name={userName} source={avatarSource} size="sm" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};
