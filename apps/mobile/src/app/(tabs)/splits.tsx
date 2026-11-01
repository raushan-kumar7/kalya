import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Avatar, Badge, Button, Card, ConfirmDialog, MoneyText, Typo } from '@/components/ui';
import { TabScreenWrapper } from '@/components/shared/tabs';
import { SPLIT_GROUPS } from '@/libs/mock/finance';
import { useTabStore } from '@/stores/tabs';

type SplitGroup = (typeof SPLIT_GROUPS)[number];

const SplitGroupCard = ({ group }: { group: SplitGroup }) => (
  <Card padding="md" className="gap-3">
    <View className="flex-row items-center justify-between">
      <Typo variant="body-md" className="font-inter-bold">
        {group.name}
      </Typo>
      {group.pending > 0 ? (
        <View className="flex-row items-center gap-1">
          <Badge variant="wants" label="Pending" />
          <MoneyText paise={group.pending} variant="numeral-sm" />
        </View>
      ) : (
        <Badge variant="savings" label="Settled" />
      )}
    </View>
    <View className="flex-row items-center gap-2">
      {group.members.slice(0, 4).map((name) => (
        <Avatar key={name} name={name} size="xs" />
      ))}
      <Typo variant="caption" tone="secondary" className="ml-2">
        {group.members.length} members
      </Typo>
    </View>
  </Card>
);

export default function SplitsScreen() {
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  // Synchronize dynamic badge count to the Splits tab icon via @/stores/tabs
  useEffect(() => {
    const pendingCount = SPLIT_GROUPS.filter((g) => g.pending > 0).length;
    useTabStore.getState().setTabBadge('splits', pendingCount);
  }, []);

  const handleSettleConfirm = () => {
    setIsSettleOpen(false);
    useTabStore.getState().clearTabBadge('splits');
  };

  return (
    <TabScreenWrapper title="Bill Splits" subtitle="Manage shared group expenses">
      <Card variant="glass-emerald" padding="lg">
        <Typo variant="caption" tone="secondary" className="font-inter-bold uppercase">
          Net Balance
        </Typo>
        <View className="mt-1 flex-row items-baseline gap-2">
          <MoneyText
            paise={425000}
            variant="title-lg"
            className="font-outfit-bold text-kalya-primary"
          />
          <Badge variant="savings" label="You are owed" />
        </View>
        <View className="mt-4 flex-row">
          <Button
            title="Settle Up"
            size="sm"
            variant="primary"
            onPress={() => setIsSettleOpen(true)}
          />
        </View>
      </Card>

      <View className="gap-3">
        <Typo variant="title-sm" className="font-outfit-bold text-kalya-text-primary">
          Active Groups
        </Typo>
        {SPLIT_GROUPS.map((group) => (
          <SplitGroupCard key={group.id} group={group} />
        ))}
      </View>

      <ConfirmDialog
        visible={isSettleOpen}
        title="Settle All Balances"
        message="Mark all pending balances with your groups as settled?"
        confirmLabel="Confirm Settle"
        cancelLabel="Cancel"
        onConfirm={handleSettleConfirm}
        onCancel={() => setIsSettleOpen(false)}
      />
    </TabScreenWrapper>
  );
}
