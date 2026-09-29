import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { TrendingDown } from 'lucide-react';
import { Layout, Callout, DetailRow, IconBadge, Button } from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface GoalOffTrackAlertProps {
  userName?: string;
  goalName?: string;
  currentProgress?: string;
  targetAmount?: string;
  targetDate?: string;
  currentMonthlyPlan?: string;
  recommendedMonthlyPlan?: string;
  shortfallAmount?: string;
  goalUrl?: string;
}

export const GoalOffTrackAlert = ({
  userName = 'Arjun',
  goalName = 'Down Payment for Home',
  currentProgress = '₹4,50,000.00',
  targetAmount = '₹15,00,000.00',
  targetDate = '31 Mar 2027',
  currentMonthlyPlan = '₹35,000.00/mo',
  recommendedMonthlyPlan = '₹48,000.00/mo',
  shortfallAmount = '₹13,000.00/mo',
  goalUrl = 'https://kalya.app/goals',
}: GoalOffTrackAlertProps) => {
  return (
    <Layout preview={`Action Required: Your ${goalName} goal is currently behind schedule`}>
      <Section className="text-center">
        <IconBadge
          icon={TrendingDown}
          background={EMAILS_CONFIG.color.warningSubtle}
          color={EMAILS_CONFIG.color.warning}
          size={24}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          Goal Schedule Alert
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-[24px] text-brand-textSecondary mb-6">
          Hi {userName}, based on your recent monthly deposits, your savings pace for{' '}
          <strong>{goalName}</strong> is falling behind the target timeline.
        </Text>
      </Section>

      <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-xl p-5 mb-6 text-center">
        <Text className="m-0 font-body text-[13px] text-brand-textMuted uppercase tracking-wider mb-1">
          Recommended Monthly Adjustment
        </Text>
        <Text className="m-0 font-numeric text-[32px] font-bold text-brand-warning leading-tight">
          {recommendedMonthlyPlan}
        </Text>
        <Text className="m-0 font-body text-[12px] text-brand-textSecondary mt-1">
          An increase of +{shortfallAmount} from your current plan ({currentMonthlyPlan})
        </Text>
      </Section>

      <Section className="my-6">
        <DetailRow label="Goal Name" value={goalName} />
        <DetailRow label="Saved So Far" value={currentProgress} />
        <DetailRow label="Target Goal" value={targetAmount} />
        <DetailRow label="Target Deadline" value={targetDate} />
        <DetailRow label="Current Contribution Plan" value={currentMonthlyPlan} last />
      </Section>

      <Callout tone="warning">
        You can either adjust your monthly bucket allocation or extend the target date to keep your
        monthly savings comfortable.
      </Callout>

      <Section className="text-center my-8">
        <Button href={goalUrl}>Adjust Goal Strategy</Button>
      </Section>
    </Layout>
  );
};

export default GoalOffTrackAlert;
