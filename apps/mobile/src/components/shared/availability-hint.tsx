import { ActivityIndicator, View } from 'react-native';
import { CircleCheck, CircleX } from 'lucide-react-native';
import { Typo } from '@/components/ui';
import type { AvailabilityStatus } from '@kalya/types';

const isBadStatus = (status: AvailabilityStatus) =>
  status === 'taken' || status === 'invalid' || status === 'error';

interface AvailabilityStatusIconProps {
  status: AvailabilityStatus;
  size?: number;
}

export const AvailabilityStatusIcon = ({ status, size = 18 }: AvailabilityStatusIconProps) => {
  if (status === 'idle') return null;

  return (
    <View className="items-center justify-center">
      {status === 'checking' && <ActivityIndicator size="small" color="#5d8a72" />}
      {status === 'available' && <CircleCheck size={size} color="#0d3e26" />}
      {isBadStatus(status) && <CircleX size={size} color="#c83535" />}
    </View>
  );
};

interface AvailabilityHintProps {
  status: AvailabilityStatus;
  message: string | null;
  /** Show a small icon next to the message. Turn off when the field already has a status icon. */
  showIcon?: boolean;
}

export const AvailabilityHint = ({ status, message, showIcon = false }: AvailabilityHintProps) => {
  if (status === 'idle' || !message) return null;

  const isBad = isBadStatus(status);

  return (
    <View className="mt-1 flex-row items-center gap-1.5">
      {showIcon && <AvailabilityStatusIcon status={status} size={14} />}
      <Typo
        size="caption"
        tone={isBad ? 'outflow' : 'muted'}
        className={status === 'available' ? 'text-kalya-primary' : undefined}
      >
        {message}
      </Typo>
    </View>
  );
};
