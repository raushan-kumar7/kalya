import React from 'react';
import { View } from 'react-native';
import { Text } from '../primitives/text';
import { HapticTouchable, triggerHaptic } from '../primitives/haptic-touchable';
import { cn } from '@/libs/utils';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

export interface TabsProps<T extends string> {
  /**
   * Available tab definitions.
   */
  tabs: TabItem<T>[];

  /**
   * Currently active tab ID.
   */
  activeTab: T;

  /**
   * Selection change callback.
   */
  onChange: (tabId: T) => void;

  /**
   * Sizing / layout style.
   * @default 'line'
   */
  variant?: 'line' | 'pill';

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * Tabs provides an accessible in-screen tab bar with line or pill indicators.
 *
 * @param props - TabsProps
 * @returns React.JSX.Element
 */
export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  className,
}: TabsProps<T>): React.JSX.Element {
  const handleTabPress = (id: T) => {
    if (id !== activeTab) {
      triggerHaptic('selection');
      onChange(id);
    }
  };

  return (
    <View
      className={cn(
        'w-full flex-row items-center',
        variant === 'line'
          ? 'border-b border-kalya-border-subtle'
          : 'p-1 bg-kalya-surface-subtle rounded-kalya-pill',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        if (variant === 'pill') {
          return (
            <HapticTouchable
              key={tab.id}
              hapticTier="none"
              onPress={() => handleTabPress(tab.id)}
              className={cn(
                'flex-1 py-2 px-3 rounded-kalya-pill items-center justify-center flex-row gap-1.5',
                isActive ? 'bg-kalya-primary' : 'bg-transparent'
              )}
            >
              {tab.icon ? <View>{tab.icon}</View> : null}
              <Text
                variant="body-sm"
                className={cn(
                  isActive
                    ? 'font-inter-bold text-kalya-text-inverse'
                    : 'font-inter text-kalya-text-secondary'
                )}
              >
                {tab.label}
              </Text>
            </HapticTouchable>
          );
        }

        return (
          <HapticTouchable
            key={tab.id}
            hapticTier="none"
            onPress={() => handleTabPress(tab.id)}
            className={cn(
              'flex-1 py-3 items-center justify-center border-b-2 flex-row gap-1.5',
              isActive ? 'border-kalya-primary' : 'border-transparent'
            )}
          >
            {tab.icon ? <View>{tab.icon}</View> : null}
            <Text
              variant="body-sm"
              className={cn(
                isActive
                  ? 'font-inter-bold text-kalya-primary'
                  : 'font-inter text-kalya-text-secondary'
              )}
            >
              {tab.label}
            </Text>

            {tab.badge !== undefined && tab.badge > 0 ? (
              <View className="px-1.5 py-0.2 rounded-full bg-kalya-gold">
                <Text
                  variant="caption"
                  className="font-ibm-plex-bold text-[10px] text-kalya-primary-dark"
                >
                  {tab.badge}
                </Text>
              </View>
            ) : null}
          </HapticTouchable>
        );
      })}
    </View>
  );
}
