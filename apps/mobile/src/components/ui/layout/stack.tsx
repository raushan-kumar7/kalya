import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/libs/utils';

export type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface StackProps extends ViewProps {
  /**
   * Gap between child items.
   * - xs: 4px
   * - sm: 8px
   * - md: 16px
   * - lg: 24px
   * - xl: 32px
   * @default 'md'
   */
  gap?: GapSize;

  /**
   * Alignment along cross axis.
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Justification along main axis.
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';

  /**
   * Custom NativeWind className.
   */
  className?: string;

  /**
   * Children components.
   */
  children?: React.ReactNode;
}

const gapMap: Record<string, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export const Stack: React.FC<StackProps> = ({
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className,
  style,
  children,
  ...rest
}) => {
  const gapClass = typeof gap === 'number' ? undefined : (gapMap[gap] ?? 'gap-4');
  const customStyle = typeof gap === 'number' ? [{ gap }, style] : style;

  return (
    <View
      style={customStyle}
      className={cn('flex-col', gapClass, alignMap[align], justifyMap[justify], className)}
      {...rest}
    >
      {children}
    </View>
  );
};

export const VStack = Stack;

export const Row: React.FC<StackProps> = ({
  gap = 'md',
  align = 'center',
  justify = 'start',
  className,
  style,
  children,
  ...rest
}) => {
  const gapClass = typeof gap === 'number' ? undefined : (gapMap[gap] ?? 'gap-4');
  const customStyle = typeof gap === 'number' ? [{ gap }, style] : style;

  return (
    <View
      style={customStyle}
      className={cn('flex-row', gapClass, alignMap[align], justifyMap[justify], className)}
      {...rest}
    >
      {children}
    </View>
  );
};

export const HStack = Row;
