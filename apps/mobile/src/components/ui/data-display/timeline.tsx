import React from 'react';
import { View } from 'react-native';
import {
  formatRelativeTime,
  formatDateTime,
  formatTime,
  formatCardDate,
  TimestampInput,
} from '@kalya/utils';
import { Typo } from '../primitives/typo';
import { cn } from '@/libs/utils';

export type TimelineTimestampFormat = 'relative' | 'short' | 'full' | 'time' | 'raw';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: TimestampInput;
  timestampFormat?: TimelineTimestampFormat;
  icon?: React.ReactNode;
  completed?: boolean;
}

export interface TimelineProps {
  /**
   * Chronological timeline items.
   */
  items: TimelineItem[];

  /**
   * Default timestamp formatting strategy across items if not overridden per item.
   * Uses @kalya/utils timestamp helpers.
   * @default 'relative'
   */
  defaultTimestampFormat?: TimelineTimestampFormat;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

/**
 * Formats timeline timestamp using @kalya/utils timestamp functions.
 */
function formatTimelineTimestamp(
  timestamp?: TimestampInput,
  format: TimelineTimestampFormat = 'relative'
): string | undefined {
  if (timestamp === undefined || timestamp === null) return undefined;
  if (format === 'raw' && typeof timestamp === 'string') return timestamp;
  try {
    if (format === 'relative') {
      return formatRelativeTime(timestamp);
    }
    if (format === 'time') {
      return formatTime(timestamp);
    }
    if (format === 'full') {
      return formatDateTime(timestamp);
    }
    if (format === 'short') {
      return formatCardDate(
        typeof timestamp === 'string'
          ? timestamp
          : new Date(timestamp as any).toISOString().split('T')[0]
      );
    }
    return typeof timestamp === 'string' ? timestamp : String(timestamp);
  } catch {
    return typeof timestamp === 'string' ? timestamp : String(timestamp);
  }
}

/**
 * Timeline renders chronological activity, sync audit trails, and settlement history.
 *
 * Implements Excel Data Display #55 using @kalya/utils timestamp formatting.
 *
 * @param props - TimelineProps
 * @returns React.JSX.Element
 */
export const Timeline: React.FC<TimelineProps> = ({
  items,
  defaultTimestampFormat = 'relative',
  className,
}) => {
  return (
    <View className={cn('flex-col py-2 px-1', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const formattedTimestamp = formatTimelineTimestamp(
          item.timestamp,
          item.timestampFormat ?? defaultTimestampFormat
        );

        return (
          <View key={item.id} className="flex-row items-start min-h-[56px]">
            {/* Timeline Column with Dot & Connecting Line */}
            <View className="items-center mr-3">
              <View
                className={cn(
                  'w-3.5 h-3.5 rounded-full border-2 items-center justify-center bg-kalya-surface z-10',
                  item.completed ? 'border-kalya-primary bg-kalya-primary' : 'border-kalya-border'
                )}
              />
              {!isLast ? <View className="w-[1.5px] flex-1 bg-kalya-border-subtle my-0.5" /> : null}
            </View>

            {/* Content Details */}
            <View className="flex-1 pb-4">
              <View className="flex-row items-center justify-between">
                <Typo variant="body-sm" tone="primary" className="font-inter-bold">
                  {item.title}
                </Typo>
                {formattedTimestamp ? (
                  <Typo variant="caption" tone="tertiary" className="font-inter">
                    {formattedTimestamp}
                  </Typo>
                ) : null}
              </View>

              {item.description ? (
                <Typo variant="caption" tone="secondary" className="font-inter mt-0.5 leading-snug">
                  {item.description}
                </Typo>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};
