import { useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Badge, Card, MoneyText, Section, StatCard, Typo } from '@/components/ui';
import { TabScreenWrapper } from '@/components/shared/tabs';
import { TransactionList } from '@/components/shared/transaction-list';
import { useAuth } from '@/hooks/auth';
import { SUMMARY, TRANSACTIONS } from '@/libs/mock/finance';
import { Top } from '@/components/dashboard';

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const toggleBalance = () => setIsBalanceHidden((v) => !v);

  const handleOpenProfile = () => {
    // 1. Direct React Navigation tab jump
    if (navigation?.navigate) {
      navigation.navigate('profile');
      return;
    }
    // 2. Fallback to router.navigate
    router.navigate('/profile');
  };

  return (
    <TabScreenWrapper
      header={
        <Top
          hasUnread
          userName={user?.name}
          avatarSource={user?.image ? { uri: user.image } : null}
          isBalanceHidden={isBalanceHidden}
          onToggleBalance={toggleBalance}
          onPressNotifications={() => {}}
          onPressProfile={handleOpenProfile}
        />
      }
    >
      <Card variant="hero-emerald" padding="lg">
        <Typo
          variant="caption"
          className="font-inter-bold uppercase tracking-wider text-kalya-mint"
        >
          Total Net Worth
        </Typo>
        <View className="mt-2">
          <MoneyText
            paise={SUMMARY.netWorth}
            variant="display"
            className="font-outfit-bold text-white"
          />
        </View>
        <View className="mt-4 flex-row items-center gap-2">
          <Badge variant="savings" label="+12.4% this month" />
        </View>
      </Card>

      <View className="flex-row gap-3">
        {SUMMARY.stats.map((stat) => (
          <View key={stat.label} className="flex-1">
            <StatCard
              label={stat.label}
              value={<MoneyText paise={stat.paise} variant="numeral-md" />}
              trend={{ value: stat.trend, positive: stat.positive }}
            />
          </View>
        ))}
      </View>

      <Section
        title="Recent Activity"
        actionLabel="See All"
        onAction={() => router.push('/(tabs)/history')}
      >
        <TransactionList items={TRANSACTIONS.slice(0, 3)} />
      </Section>
    </TabScreenWrapper>
  );
}
