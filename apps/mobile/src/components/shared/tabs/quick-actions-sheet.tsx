import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useIsQuickActionsOpen, useTabStore } from '@/stores/tabs';
import { QUICK_ACTIONS, QuickAction } from './config';
import { toast } from '@/stores/toast';
import { BottomSheet, ListItem } from '@/components/ui';
import { cn } from '@/libs/utils';

export const QuickActionsSheet = () => {
  const router = useRouter();
  const isOpen = useIsQuickActionsOpen();

  const close = () => useTabStore.getState().closeQuickActions();

  const onSelect = (action: QuickAction) => {
    useTabStore.getState().setActiveQuickAction(action.type);
    close();
    if (action.href) {
      router.push(action.href);
    } else {
      toast.info(`${action.title} is coming soon`);
    }
  };
  return (
    <BottomSheet visible={isOpen} onClose={close} title="Quick Actions">
      <View className="pb-4">
        {QUICK_ACTIONS.map((action, index) => (
          <ListItem
            key={action.type}
            title={action.title}
            subtitle={action.subtitle}
            leading={
              <View
                className={cn(
                  'h-11 w-11 items-center justify-center rounded-kalya-sm border border-kalya-border-subtle',
                  action.tint
                )}
              >
                <action.Icon size={22} color={action.color} />
              </View>
            }
            onPress={() => onSelect(action)}
            bottomDivider={index < QUICK_ACTIONS.length - 1}
          />
        ))}
      </View>
    </BottomSheet>
  );
};
