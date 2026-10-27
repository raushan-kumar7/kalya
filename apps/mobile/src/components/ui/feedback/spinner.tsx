import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Typo } from '../primitives/typo';
import { cn } from '@/libs/utils';

export interface SpinnerProps {
  /**
   * Sizing tier.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Color tone.
   * @default 'primary'
   */
  color?: 'primary' | 'gold' | 'white' | string;

  /**
   * Whether to render as a full-screen centered overlay.
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Optional loading label message displayed below the spinner.
   */
  label?: string;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

const colorMap: Record<string, string> = {
  primary: '#0d3e26',
  gold: '#d4af37',
  white: '#ffffff',
};

/**
 * Spinner provides inline and full-screen loading indicators.
 *
 * @param props - SpinnerProps
 * @returns React.JSX.Element
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  label,
  className,
}) => {
  const spinnerColor = colorMap[color] ?? color;
  const spinnerSize = size === 'sm' ? 'small' : 'large';

  const content = (
    <View className={cn('items-center justify-center gap-2.5 p-4', className)}>
      <ActivityIndicator size={spinnerSize} color={spinnerColor} />
      {label ? (
        <Typo variant="body-sm" tone="secondary" className="font-inter text-center">
          {label}
        </Typo>
      ) : null}
    </View>
  );

  if (fullScreen) {
    return (
      <View
        style={{ backgroundColor: 'rgba(237, 253, 242, 0.85)' }}
        className="absolute inset-0 z-50 items-center justify-center"
      >
        {content}
      </View>
    );
  }

  return content;
};
