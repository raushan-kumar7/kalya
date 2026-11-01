import React from 'react';
import { View } from 'react-native';
import { Badge, Button, Card, KeyValueRow, MoneyText, Typo } from '@/components/ui';
import { TabScreenWrapper } from '@/components/shared/tabs';
import { useAuth } from '@/hooks/auth';
import { BALANCE_SHEET } from '@/libs/mock/finance';

export default function PortfolioScreen() {
  const { user, signOut, biometric, signOutMutation } = useAuth();
  const isSigningOut = signOutMutation.isPending;

  const totalAssets = BALANCE_SHEET.filter((r) => r.paise > 0).reduce((sum, r) => sum + r.paise, 0);

  // Stack.Protected automatically navigates to (auth) upon sign-out
  const handleSignOut = () => {
    signOut().catch(() => {});
  };

  return (
    <TabScreenWrapper title="Wealth Portfolio" subtitle="Asset allocation and performance">
      <Card variant="surface" padding="lg">
        <Typo variant="caption" tone="secondary" className="font-inter-bold uppercase">
          Total Assets
        </Typo>
        <MoneyText
          paise={totalAssets}
          variant="display"
          className="mt-1 font-outfit-bold text-kalya-primary"
        />
        <View className="mt-3 flex-row items-center gap-2">
          <Badge variant="savings" label="+14.8% YoY" />
        </View>
      </Card>

      <Card padding="md">
        <Typo variant="title-sm" className="mb-3 font-outfit-bold">
          Balance Sheet
        </Typo>
        {BALANCE_SHEET.map((row) => (
          <KeyValueRow
            key={row.label}
            label={row.label}
            value={<MoneyText paise={row.paise} colored={row.paise < 0} />}
          />
        ))}
      </Card>

      <Card padding="md" className="gap-4">
        <Typo variant="title-sm" className="font-outfit-bold">
          Vault Security
        </Typo>
        <KeyValueRow
          label="Biometric Protection"
          value={biometric.isEnabled ? `Active (${biometric.biometricLabel})` : 'Disabled'}
        />
        <KeyValueRow label="Account Email" value={user?.email ?? '—'} />
        <Button
          title="Sign Out"
          variant="destructive"
          isLoading={isSigningOut}
          onPress={handleSignOut}
        />
      </Card>
    </TabScreenWrapper>
  );
}
