import * as React from 'react';
import { Text, Section, Heading } from 'react-email';
import { Award } from 'lucide-react';
import {
  Layout,
  Callout,
  DetailRow,
  IconBadge,
  Button,
} from '../components';
import { EMAILS_CONFIG } from '../constants';

export interface GoalMilestoneAchievedProps {
  userName?: string;
  goalName?: string;
  milestonePercent?: number;
  currentProgress?: string;
  targetAmount?: string;
  targetDate?: string;
  monthlyContribution?: string;
  isFullyCompleted?: boolean;
  goalUrl?: string;
}

export const GoalMilestoneAchieved = ({
  userName = 'Arjun',
  goalName = 'Emergency Fund (6 Months)',
  milestonePercent = 50,
  currentProgress = '₹3,00,000.00',
  targetAmount = '₹6,00,000.00',
  targetDate = '31 Dec 2026',
  monthlyContribution = '₹25,000.00/mo',
  isFullyCompleted = false,
  goalUrl = 'https://kalya.app/goals',
}: GoalMilestoneAchievedProps) => {
  const title = isFullyCompleted
    ? `Goal Achieved: ${goalName}!`
    : `${milestonePercent}% Milestone Reached: ${goalName}`;

  return (
    <Layout preview={`Congratulations! You've achieved ${milestonePercent}% of your ${goalName} goal`}>
      <Section className="text-center">
        <IconBadge
          icon={Award}
          background={EMAILS_CONFIG.color.accentSubtle}
          color={EMAILS_CONFIG.color.accent}
          size={26}
        />
        <Heading className="m-0 font-display text-[22px] font-semibold text-brand-textPrimary mb-2">
          {title}
        </Heading>
        <Text className="m-0 font-body text-[15px] leading-[24px] text-brand-textSecondary mb-6">
          Outstanding progress, {userName}! Your consistent contributions have brought you another
          step closer to your financial independence.
        </Text>
      </Section>

      {/* Milestone Progress Card */}
      <Section className="bg-brand-surfaceRaised border border-solid border-brand-border rounded-xl p-5 mb-6 text-center">
        <Text className="m-0 font-body text-[13px] text-brand-textMuted uppercase tracking-wider mb-1">
          Current Savings Balance
        </Text>
        <Text className="m-0 font-numeric text-[32px] font-bold text-brand-primary leading-tight">
          {currentProgress}
        </Text>
        <Text className="m-0 font-body text-[12px] text-brand-textSecondary mt-1">
          Target: {targetAmount} ({milestonePercent}% Completed)
        </Text>

        <div
          style={{
            backgroundColor: EMAILS_CONFIG.color.border,
            borderRadius: 6,
            height: 10,
            overflow: 'hidden',
            width: '100%',
            marginTop: 14,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              backgroundColor: EMAILS_CONFIG.color.accent,
              width: `${Math.min(milestonePercent, 100)}%`,
              height: '100%',
              borderRadius: 6,
            }}
          />
        </div>
      </Section>

      <Section className="my-6">
        <DetailRow label="Goal Name" value={goalName} />
        <DetailRow label="Target Amount" value={targetAmount} />
        <DetailRow label="Target Date" value={targetDate} />
        <DetailRow label="Monthly Contribution" value={monthlyContribution} last />
      </Section>

      <Callout tone="success">
        {isFullyCompleted
          ? 'You have reached 100% of your target! You can archive this goal or redirect future allocations to other wealth goals.'
          : 'At your current monthly contribution rate, you are on track to achieve this goal by the target date.'}
      </Callout>

      <Section className="text-center my-8">
        <Button href={goalUrl}>View Goal Details</Button>
      </Section>
    </Layout>
  );
};

export default GoalMilestoneAchieved;
