import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabRoute, useTabBadges } from '@/stores/tabs';
import { TAB_ACTIVE_COLOR, TAB_BAR_HEIGHT, TAB_BY_NAME, TAB_INACTIVE_COLOR } from './config';
import { Badge, HapticTouchable, Typo } from '@/components/ui';
import { cn } from '@/libs/utils';

export interface CustomTabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: any }>;
  };
  descriptors?: Record<string, any>;
  navigation?: {
    emit: (event: any) => any;
    navigate: (name: string, params?: any) => void;
  };
  emitter?: {
    emit: (event: any) => any;
  };
  navigateToTab?: (routeKey: string) => void;
  insets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const CustomTabBar = (props: CustomTabBarProps) => {
  const { state, descriptors, navigation, emitter, navigateToTab } = props;
  const insets = useSafeAreaInsets();
  const badges = useTabBadges();

  // Respect screen-level tabBarStyle: { display: 'none' } (e.g. for profile or detail routes)
  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors?.[currentRoute?.key]?.options;
  if (currentOptions?.tabBarStyle && (currentOptions.tabBarStyle as any).display === 'none') {
    return null;
  }

  return (
    <View
      style={{ height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }}
      className="flex-row border-t border-kalya-border-subtle bg-kalya-surface shadow-sm"
    >
      {state.routes.map((route, index) => {
        const routeName = route.name as TabRoute;
        const tab = TAB_BY_NAME[routeName];
        if (!tab) return null;

        const isFocused = state.index === index;
        const color = isFocused ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR;
        const badgeCount = badges[routeName] ?? 0;

        const onPress = () => {
          const event = navigation
            ? navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
            : emitter?.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

          if (!isFocused && !event?.defaultPrevented) {
            if (navigateToTab) {
              navigateToTab(route.key);
            } else if (navigation) {
              navigation.navigate(route.name, route.params);
            }
          }
        };

        return (
          <HapticTouchable
            key={route.key}
            onPress={onPress}
            hapticTier="selection"
            accessibilityRole="tab"
            accessibilityLabel={badgeCount > 0 ? `${tab.title}, ${badgeCount} new` : tab.title}
            accessibilityState={{ selected: isFocused }}
            className="relative flex-1 items-center justify-center py-1"
          >
            {/* <View
              className={cn(
                'items-center justify-center rounded-full px-2 py-1',
                isFocused && 'bg-kalya-mint-subtle'
              )}
            >
              <tab.Icon size={24} color={color} strokeWidth={1.9} />

              {badgeCount > 0 ? (
                <View className="absolute -right-1 -top-1">
                  <Badge variant="counter" count={badgeCount} />
                </View>
              ) : null}
            </View> */}

            <View
              className={cn(
                'h-9 w-9 items-center justify-center rounded-full',
                isFocused && 'bg-kalya-mint-subtle'
              )}
            >
              <tab.Icon size={22} color={color} strokeWidth={isFocused ? 2.2 : 1.9} />

              {badgeCount > 0 ? (
                <View className="absolute -right-1 -top-1">
                  <Badge variant="counter" count={badgeCount} />
                </View>
              ) : null}
            </View>

            <Typo
              variant="caption"
              className={cn(
                'mt-0.5 text-[10px]',
                isFocused
                  ? 'font-inter-bold text-kalya-primary'
                  : 'font-inter text-kalya-text-tertiary'
              )}
            >
              {tab.title}
            </Typo>
          </HapticTouchable>
        );
      })}
    </View>
  );
};
