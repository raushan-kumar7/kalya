import React from 'react';
import { View } from 'react-native';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export interface LegendItem {
  label: string;
  color: string;
  value?: string | number;
}

export interface LegendProps {
  /**
   * Data items in legend.
   */
  items: LegendItem[];

  /**
   * Orientation layout.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * Legend displays color-coded indicators for financial allocation charts.
 *
 * Implements Excel Data Display #52.
 *
 * @param props - LegendProps
 * @returns React.JSX.Element
 */
export const Legend: React.FC<LegendProps> = ({ items, orientation = 'horizontal', className }) => {
  return (
    <View
      className={cn(
        'gap-2',
        orientation === 'horizontal' ? 'flex-row flex-wrap items-center' : 'flex-col',
        className
      )}
    >
      {items.map((item, idx) => (
        <View key={`legend-${idx}`} className="flex-row items-center gap-1.5 mr-3 my-0.5">
          <View style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full" />
          <Text variant="caption" tone="secondary" className="font-inter">
            {item.label}
          </Text>
          {item.value !== undefined ? (
            <Text variant="caption" tone="primary" className="font-ibm-plex-bold">
              ({item.value})
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
};
