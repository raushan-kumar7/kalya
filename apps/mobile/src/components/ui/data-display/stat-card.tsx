import React from 'react';
import { View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { Card } from '../layout/card';
import { Typo } from '../primitives/typo';
import { cn } from '@/libs/utils';

export interface StatTrend {
  /**
   * Delta string (e.g. "+14.2%").
   */
  value: string;

  /**
   * Whether trend is positive/favorable.
   */
  positive: boolean;

  /**
   * Optional comparison label (e.g. "vs last month").
   */
  comparisonLabel?: string;
}

export interface StatCardProps {
  /**
   * Metric title label (e.g. "Net Cash Flow").
   */
  label: string;

  /**
   * Formatted value text or component (e.g. MoneyText).
   */
  value: React.ReactNode;

  /**
   * Optional percentage trend delta.
   */
  trend?: StatTrend;

  /**
   * Optional header icon graphic.
   */
  icon?: React.ReactNode;

  /**
   * Optional click handler.
   */
  onPress?: () => void;

  /**
   * Card visual variant.
   * @default 'surface'
   */
  variant?: 'surface' | 'subtle' | 'glass' | 'glass-emerald';

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * StatCard displays key performance indicators and dashboard metrics
 * with trend indicators and comparison copy.
 *
 * @param props - StatCardProps
 * @returns React.JSX.Element
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  icon,
  onPress,
  variant = 'surface',
  className,
}) => {
  return (
    <Card
      variant={variant}
      padding="md"
      rounded="lg"
      onPress={onPress}
      className={cn('flex-col justify-between min-h-[96px]', className)}
    >
      <View className="flex-row items-center justify-between mb-1.5">
        <Typo
          variant="caption"
          tone="tertiary"
          className="font-inter-bold uppercase tracking-wider"
        >
          {label}
        </Typo>
        {icon ? <View>{icon}</View> : null}
      </View>

      <View className="my-0.5">
        {typeof value === 'string' ? (
          <Typo variant="numeral-lg" tone="primary" className="font-ibm-plex-bold">
            {value}
          </Typo>
        ) : (
          value
        )}
      </View>

      {trend ? (
        <View className="flex-row items-center gap-1.5 mt-1.5">
          {trend.positive ? (
            <TrendingUp size={13} color="#1b8a51" />
          ) : (
            <TrendingDown size={13} color="#c83535" />
          )}

          <Typo
            variant="caption"
            className={cn(
              'font-ibm-plex-bold text-[11px]',
              trend.positive ? 'text-kalya-inflow' : 'text-kalya-outflow'
            )}
          >
            {trend.value}
          </Typo>

          {trend.comparisonLabel ? (
            <Typo variant="caption" tone="tertiary" className="font-inter text-[10px]">
              {trend.comparisonLabel}
            </Typo>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
};
