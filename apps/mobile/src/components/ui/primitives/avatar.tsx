import React, { useState } from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';
import { Typo } from './typo';
import { cn } from '@/libs/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface AvatarProps {
  /**
   * Remote image source URI or local image asset.
   */
  source?: ImageSourcePropType | { uri: string } | null;

  /**
   * Full name used to generate initial letters when image is unavailable.
   */
  name?: string;

  /**
   * Size tier or exact pixel dimension.
   * @default 'md' (40px)
   */
  size?: AvatarSize;

  /**
   * Border shape.
   * @default 'circle'
   */
  shape?: 'circle' | 'rounded';

  /**
   * Custom NativeWind className.
   */
  className?: string;
}

const sizeMap: Record<
  string,
  { size: number; textVariant: 'caption' | 'body-sm' | 'body-md' | 'title-sm' }
> = {
  xs: { size: 24, textVariant: 'caption' },
  sm: { size: 32, textVariant: 'body-sm' },
  md: { size: 40, textVariant: 'body-md' },
  lg: { size: 48, textVariant: 'title-sm' },
  xl: { size: 64, textVariant: 'title-sm' },
};

function getInitials(name?: string): string {
  if (!name) return 'K';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar renders a user profile picture with an automatic initials fallback.
 *
 * @param props - AvatarProps
 * @returns React.JSX.Element
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  shape = 'circle',
  className,
}) => {
  const [hasError, setHasError] = useState(false);

  const dimension = typeof size === 'number' ? size : (sizeMap[size]?.size ?? 40);
  const textVariant =
    typeof size === 'number' ? 'body-sm' : (sizeMap[size]?.textVariant ?? 'body-md');
  const initials = getInitials(name);

  const borderRadius = shape === 'circle' ? dimension / 2 : 10;

  const showImage = source && !hasError;

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius,
      }}
      className={cn(
        'items-center justify-center overflow-hidden border border-kalya-border-subtle bg-kalya-primary',
        className
      )}
    >
      {showImage ? (
        <Image
          source={source}
          onError={() => setHasError(true)}
          style={{ width: dimension, height: dimension }}
          resizeMode="cover"
        />
      ) : (
        <Typo
          variant={textVariant}
          className="font-outfit-bold text-kalya-text-inverse tracking-wider"
        >
          {initials}
        </Typo>
      )}
    </View>
  );
};
