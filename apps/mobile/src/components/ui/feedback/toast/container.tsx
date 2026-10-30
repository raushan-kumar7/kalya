import { useToastStore } from '@/stores/toast';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastItem } from './item';

export const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  const top = toasts.filter((t) => t.position !== 'bottom');
  const bottom = toasts.filter((t) => t.position === 'bottom');

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: insets.top + 8 }}
      >
        {top.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </View>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 8,
        }}
      >
        {bottom.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </View>
    </View>
  );
};
