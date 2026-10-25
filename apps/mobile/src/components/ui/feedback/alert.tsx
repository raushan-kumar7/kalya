import React from 'react';
import { View } from 'react-native';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { Text } from '../primitives/text';
import { cn } from '@/libs/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /**
   * Optional bold alert headline.
   */
  title?: string;

  /**
   * Main explanatory message body.
   */
  description: string;

  /**
   * Visual variant tone.
   * @default 'info'
   */
  variant?: AlertVariant;

  /**
   * Optional custom leading icon.
   */
  icon?: React.ReactNode;

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; title: string; desc: string; defaultIcon: React.ReactNode }
> = {
  info: {
    container: 'bg-kalya-mint-subtle border-kalya-border',
    title: 'text-kalya-primary font-inter-bold',
    desc: 'text-kalya-primary font-inter',
    defaultIcon: <Info size={18} color="#0d3e26" />,
  },
  success: {
    container: 'bg-emerald-50 border-emerald-300',
    title: 'text-emerald-900 font-inter-bold',
    desc: 'text-emerald-800 font-inter',
    defaultIcon: <CheckCircle2 size={18} color="#059669" />,
  },
  warning: {
    container: 'bg-amber-50 border-amber-300',
    title: 'text-amber-900 font-inter-bold',
    desc: 'text-amber-800 font-inter',
    defaultIcon: <AlertTriangle size={18} color="#d97706" />,
  },
  error: {
    container: 'bg-kalya-surface border-kalya-outflow',
    title: 'text-kalya-outflow font-inter-bold',
    desc: 'text-kalya-outflow font-inter',
    defaultIcon: <AlertCircle size={18} color="#c83535" />,
  },
};

/**
 * Alert renders an inline callout for contextual advice, tips, and security notes.
 *
 * @param props - AlertProps
 * @returns React.JSX.Element
 */
export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = 'info',
  icon,
  className,
}) => {
  const v = variantStyles[variant];

  return (
    <View
      className={cn(
        'w-full flex-row items-start gap-2.5 p-3.5 rounded-kalya-md border my-1',
        v.container,
        className
      )}
    >
      <View className="mt-0.5">{icon || v.defaultIcon}</View>

      <View className="flex-1">
        {title ? (
          <Text variant="body-sm" className={v.title}>
            {title}
          </Text>
        ) : null}
        <Text variant="caption" className={cn(v.desc, title && 'mt-0.5')}>
          {description}
        </Text>
      </View>
    </View>
  );
};
