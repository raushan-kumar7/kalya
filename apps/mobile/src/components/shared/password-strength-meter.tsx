import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { PASSWORD_RULES } from '@kalya/validations';
import type {
  PasswordRuleResult,
  PasswordStrengthLevel,
  PasswordStrengthReport,
} from '@kalya/types';
import { cn } from '@/libs/utils';
import { Typo } from '../ui';

interface LevelDefinition {
  level: PasswordStrengthLevel;
  label: string;
  barClass: string;
  textClass: string;
}

const STRENGTH_LEVELS: LevelDefinition[] = [
  {
    level: 'too-weak',
    label: 'Too weak',
    barClass: 'bg-kalya-outflow',
    textClass: 'text-kalya-outflow',
  },
  { level: 'weak', label: 'Weak', barClass: 'bg-kalya-outflow', textClass: 'text-kalya-outflow' },
  { level: 'fair', label: 'Fair', barClass: 'bg-kalya-gold', textClass: 'text-kalya-gold-dark' },
  { level: 'good', label: 'Good', barClass: 'bg-kalya-savings', textClass: 'text-kalya-savings' },
  { level: 'strong', label: 'Strong', barClass: 'bg-kalya-inflow', textClass: 'text-kalya-inflow' },
];

export interface PasswordStrengthMeterProps {
  password: string;
  variant?: 'segmented' | 'continuous';
  showChecklist?: boolean;
  showLabel?: boolean;
  showScore?: boolean;
  /** Memoize with useCallback in the parent, or this fires on every render. */
  onStrengthChange?: (report: PasswordStrengthReport) => void;
  className?: string;
}

/** One animated segment of the segmented bar. */
const Segment = ({
  filled,
  barClass,
  reduceMotion,
}: {
  filled: boolean;
  barClass: string;
  reduceMotion: boolean;
}) => {
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    const target = filled ? 1 : 0;
    progress.value = reduceMotion ? target : withTiming(target, { duration: 220 });
  }, [filled, reduceMotion, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View className="h-1.5 flex-1 overflow-hidden rounded-kalya-pill bg-kalya-border-subtle">
      <Animated.View style={fillStyle} className={cn('h-full rounded-kalya-pill', barClass)} />
    </View>
  );
};

/** Smooth single bar. */
const ContinuousBar = ({
  percent,
  barClass,
  reduceMotion,
}: {
  percent: number;
  barClass: string;
  reduceMotion: boolean;
}) => {
  const progress = useSharedValue(percent);

  useEffect(() => {
    progress.value = reduceMotion ? percent : withTiming(percent, { duration: 260 });
  }, [percent, reduceMotion, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <View className="h-1.5 w-full overflow-hidden rounded-kalya-pill bg-kalya-border-subtle">
      <Animated.View style={fillStyle} className={cn('h-full rounded-kalya-pill', barClass)} />
    </View>
  );
};

export const PasswordStrengthMeter = ({
  password,
  variant = 'segmented',
  showChecklist = true,
  showLabel = true,
  showScore = false,
  onStrengthChange,
  className,
}: PasswordStrengthMeterProps) => {
  const reduceMotion = useReducedMotion();

  const report = useMemo<PasswordStrengthReport>(() => {
    const checklist: PasswordRuleResult[] = PASSWORD_RULES.map((rule) => ({
      message: rule.message,
      met: rule.test(password),
    }));

    const passedCount = checklist.filter((r) => r.met).length;
    const total = checklist.length;
    const levelIndex = Math.max(0, Math.min(passedCount - 1, STRENGTH_LEVELS.length - 1));
    const active = password.length > 0 ? STRENGTH_LEVELS[levelIndex] : STRENGTH_LEVELS[0];

    return {
      score: passedCount,
      level: active.level,
      label: active.label,
      percent: total > 0 ? (passedCount / total) * 100 : 0,
      isValid: passedCount === total,
      checklist,
    };
  }, [password]);

  useEffect(() => {
    onStrengthChange?.(report);
  }, [report, onStrengthChange]);

  if (!password) return null;

  const levelDef = STRENGTH_LEVELS.find((l) => l.level === report.level) ?? STRENGTH_LEVELS[0];

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(160)}
      className={cn('mt-1 gap-2.5', className)}
    >
      <View className="gap-1.5">
        {(showLabel || showScore) && (
          <View className="flex-row items-center justify-between">
            {showLabel ? (
              <Typo
                variant="caption"
                className={cn('font-inter-bold', levelDef.textClass)}
                accessibilityLiveRegion="polite"
              >
                {levelDef.label}
              </Typo>
            ) : (
              <View />
            )}
            {showScore && (
              <Typo variant="caption" tone="muted" className="font-mono">
                {report.score}/{report.checklist.length}
              </Typo>
            )}
          </View>
        )}

        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Password strength"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(report.percent),
            text: levelDef.label,
          }}
        >
          {variant === 'segmented' ? (
            <View className="flex-row gap-1.5">
              {report.checklist.map((rule, idx) => (
                <Segment
                  key={rule.message}
                  filled={idx < report.score}
                  barClass={levelDef.barClass}
                  reduceMotion={reduceMotion}
                />
              ))}
            </View>
          ) : (
            <ContinuousBar
              percent={report.percent}
              barClass={levelDef.barClass}
              reduceMotion={reduceMotion}
            />
          )}
        </View>
      </View>

      {showChecklist && (
        <View className="gap-1.5">
          {report.checklist.map((rule) => (
            <View key={rule.message} className="flex-row items-center gap-2">
              <View
                className={cn(
                  'h-4 w-4 items-center justify-center rounded-kalya-pill border',
                  rule.met
                    ? 'border-kalya-inflow/40 bg-kalya-inflow/10'
                    : 'border-kalya-border-subtle bg-kalya-surface'
                )}
              >
                {rule.met ? (
                  <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(150)}>
                    <Check size={10} strokeWidth={3} color="#1b8a51" />
                  </Animated.View>
                ) : (
                  <View className="h-1 w-1 rounded-kalya-pill bg-kalya-border-subtle" />
                )}
              </View>
              <Typo
                variant="caption"
                className={cn(
                  'flex-1',
                  rule.met ? 'text-kalya-text-primary' : 'text-kalya-text-tertiary'
                )}
              >
                {rule.message}
              </Typo>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};
