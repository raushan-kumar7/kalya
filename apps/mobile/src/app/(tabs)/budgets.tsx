import React from 'react';
import { View } from 'react-native';
import { Card, MoneyText, ProgressBar, ProgressRing, Section, Typo } from '@/components/ui';
import { TabScreenWrapper } from '@/components/shared/tabs';
import { BUCKETS } from '@/libs/mock/finance';

const percent = (spent: number, budget: number) =>
  budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

export default function BudgetsScreen() {
  const totalBudget = BUCKETS.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = BUCKETS.reduce((sum, b) => sum + b.spent, 0);

  return (
    <TabScreenWrapper title="Budget Envelopes" subtitle="Monthly 50/30/20 targets">
      <Card variant="surface" padding="lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Typo variant="caption" tone="secondary" className="font-inter-bold uppercase">
              Total Allocated
            </Typo>
            <MoneyText
              paise={totalBudget}
              variant="title-md"
              className="mt-1 font-outfit-bold text-kalya-primary"
            />
            <View className="mt-2 flex-row items-center gap-1">
              <MoneyText paise={totalSpent} variant="numeral-sm" />
              <Typo variant="body-sm" tone="secondary">
                spent
              </Typo>
            </View>
          </View>
          <ProgressRing
            progress={percent(totalSpent, totalBudget)}
            size={76}
            strokeWidth={8}
            color="#0d3e26"
          />
        </View>
      </Card>

      <Section title="50/30/20 Balance Rule">
        <Card padding="md" className="gap-4">
          {BUCKETS.map((bucket) => (
            <View key={bucket.key}>
              <View className="mb-1 flex-row items-center justify-between">
                <Typo variant="body-sm" className="font-inter-bold">
                  {bucket.label}
                </Typo>
                <View className="flex-row items-center gap-1">
                  <MoneyText paise={bucket.spent} variant="numeral-sm" />
                  <Typo variant="caption" tone="secondary">
                    /
                  </Typo>
                  <MoneyText paise={bucket.budget} variant="numeral-sm" />
                </View>
              </View>
              <ProgressBar progress={percent(bucket.spent, bucket.budget)} />
            </View>
          ))}
        </Card>
      </Section>
    </TabScreenWrapper>
  );
}
