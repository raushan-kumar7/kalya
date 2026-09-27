import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { EMAILS_CONFIG } from '../constants';

export const IconBadge = ({
  icon: Icon,
  background,
  color = EMAILS_CONFIG.color.textPrimary,
  size = 22,
}: {
  icon: LucideIcon;
  background: string;
  color?: string;
  size?: number;
}) => {
  const padding = (48 - size) / 2;

  return (
    <div
      style={{
        display: 'inline-block',
        padding: `${padding}px`,
        borderRadius: '50%',
        backgroundColor: background,
        marginBottom: 16,
      }}
    >
      <Icon size={size} color={color} strokeWidth={2} style={{ display: 'block' }} />
    </div>
  );
};
