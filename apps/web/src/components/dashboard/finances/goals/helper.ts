import type { Bucket, GoalStatus } from '@kalya/types';
import { roundMoney, formatInr } from '@kalya/utils';
import type {
  GoalContribution,
  GoalFiltersState,
  GoalInsight,
  GoalPaceExtended,
  GoalRow,
  GoalTotals,
  ProjectionTimelinePoint,
  GoalContributionMonthPoint,
} from './types';

/* ── Pace & Timeline Calculation ────────────────────────── */

export function computeGoalPaceDetails(
  targetAmount: number,
  currentProgress: number,
  targetDateStr: string | Date,
  monthlyContributionPlan: number = 0
): GoalPaceExtended {
  const safeTarget = roundMoney(Number(targetAmount) || 0);
  const safeProgress = roundMoney(Number(currentProgress) || 0);
  const remainingAmount = roundMoney(Math.max(0, safeTarget - safeProgress));
  const progressPercentage = safeTarget > 0 ? roundMoney((safeProgress / safeTarget) * 100) : 100;

  const now = new Date();
  const targetDate = new Date(targetDateStr);

  // Difference in calendar months
  const diffMonths =
    (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
  const diffTime = targetDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = daysRemaining < 0 && remainingAmount > 0;
  const monthsRemaining = Math.max(0, diffMonths);

  const recommendedMonthly =
    monthsRemaining > 0 ? roundMoney(remainingAmount / monthsRemaining) : remainingAmount;

  const safeMonthlyPlan = roundMoney(Number(monthlyContributionPlan) || 0);

  // On track check:
  // If progress is >= 100%, always on track!
  // If not overdue, and monthly plan is configured and >= recommendedMonthly, on track!
  // Or if no plan configured, but current progress already satisfies target.
  const isOnTrack =
    progressPercentage >= 100 ||
    (!isOverdue &&
      (safeMonthlyPlan > 0
        ? safeMonthlyPlan >= recommendedMonthly
        : safeProgress >= recommendedMonthly));

  const monthlyShortfall =
    safeMonthlyPlan < recommendedMonthly ? roundMoney(recommendedMonthly - safeMonthlyPlan) : 0;

  const projectedMonths =
    remainingAmount <= 0
      ? 0
      : safeMonthlyPlan > 0
        ? Math.ceil(remainingAmount / safeMonthlyPlan)
        : undefined;

  let projectedCompletionDate: string | null = null;
  if (remainingAmount <= 0) {
    projectedCompletionDate = 'Completed';
  } else if (projectedMonths !== undefined && Number.isFinite(projectedMonths)) {
    const proj = new Date();
    proj.setMonth(proj.getMonth() + projectedMonths);
    projectedCompletionDate = proj.toISOString().slice(0, 10);
  }

  return {
    progressPercentage,
    remainingAmount,
    monthsRemaining,
    daysRemaining,
    recommendedMonthly,
    isOnTrack,
    isOverdue,
    projectedMonths,
    projectedCompletionDate,
    monthlyShortfall,
  };
}

/* ── Normalizer ─────────────────────────────────────────── */

export function normalizeGoalRow(
  raw: any,
  buckets: Bucket[] = [],
  contributionsMap: Record<string, GoalContribution[]> = {}
): GoalRow {
  const id = raw.id || `goal-${Math.random().toString(36).slice(2, 9)}`;
  const bucketId = raw.bucket_id ?? raw.bucketId ?? '';
  const bucket = buckets.find((b) => b.id === bucketId);
  const bucketLabel = bucket?.label ?? raw.bucket_label ?? raw.bucketLabel ?? 'Savings';
  const bucketColor = bucket?.color ?? raw.bucket_color ?? raw.bucketColor ?? '#2563EB';

  const name = raw.name || 'Untitled Goal';
  const targetAmount = Number(raw.target_amount ?? raw.targetAmount ?? 0);
  const targetDate = String(
    raw.target_date ?? raw.targetDate ?? new Date().toISOString().slice(0, 10)
  );
  const currentProgress = Number(raw.current_progress ?? raw.currentProgress ?? 0);
  const monthlyContributionPlan = Number(
    raw.monthly_contribution_plan ?? raw.monthlyContributionPlan ?? 0
  );

  let rawStatus = (raw.status as GoalStatus) || 'in_progress';
  if (currentProgress >= targetAmount && targetAmount > 0) {
    rawStatus = 'completed';
  }

  const rawContributions = contributionsMap[id] ?? raw.contributions ?? [];
  const contributions: GoalContribution[] = [...rawContributions];

  // Calculate sum of recorded contributions
  const recordedTotal = contributions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  // If the goal already has saved progress that exceeds explicitly recorded deposits,
  // record an initial opening savings deposit entry so the user sees their full contribution history
  if (currentProgress > recordedTotal) {
    const openingAmount = roundMoney(currentProgress - recordedTotal);
    const createdDate = raw.created_at ?? raw.createdAt ?? new Date().toISOString();
    contributions.push({
      id: `c-init-${id}`,
      goal_id: id,
      amount: openingAmount,
      date: String(createdDate).slice(0, 10),
      note: 'Initial savings / opening balance',
      created_at: String(createdDate),
    });
  }

  // Sort newest first
  contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Compute extended pace
  const pace = computeGoalPaceDetails(
    targetAmount,
    currentProgress,
    targetDate,
    monthlyContributionPlan
  );

  return {
    id,
    user_id: raw.user_id ?? raw.userId,
    bucket_id: bucketId,
    bucketLabel,
    bucketColor,
    name,
    target_amount: targetAmount,
    target_date: targetDate,
    current_progress: currentProgress,
    monthly_contribution_plan: monthlyContributionPlan,
    status: rawStatus,
    pace,
    contributions,
    created_at: raw.created_at ?? raw.createdAt,
    updated_at: raw.updated_at ?? raw.updatedAt,
  };
}

/* ── KPI Totals ─────────────────────────────────────────── */

export function computeGoalTotals(rows: GoalRow[]): GoalTotals {
  let totalSaved = 0;
  let totalTarget = 0;
  let activeGoalsCount = 0;
  let onTrackCount = 0;
  let behindCount = 0;
  let completedCount = 0;
  let pausedCount = 0;
  let overdueCount = 0;
  let totalMonthlyPlanNeeded = 0;
  let totalMonthlyPlanConfigured = 0;

  for (const g of rows) {
    totalSaved += g.current_progress;
    totalTarget += g.target_amount;
    totalMonthlyPlanConfigured += g.monthly_contribution_plan;

    if (g.status === 'completed' || g.pace.progressPercentage >= 100) {
      completedCount++;
    } else if (g.status === 'paused') {
      pausedCount++;
    } else {
      activeGoalsCount++;
      totalMonthlyPlanNeeded += g.pace.recommendedMonthly;

      if (g.pace.isOverdue) {
        overdueCount++;
        behindCount++;
      } else if (g.pace.isOnTrack) {
        onTrackCount++;
      } else {
        behindCount++;
      }
    }
  }

  const overallProgressPct = totalTarget > 0 ? roundMoney((totalSaved / totalTarget) * 100) : 0;

  return {
    totalSaved: roundMoney(totalSaved),
    totalTarget: roundMoney(totalTarget),
    overallProgressPct,
    activeGoalsCount,
    onTrackCount,
    behindCount,
    completedCount,
    pausedCount,
    overdueCount,
    totalMonthlyPlanNeeded: roundMoney(totalMonthlyPlanNeeded),
    totalMonthlyPlanConfigured: roundMoney(totalMonthlyPlanConfigured),
  };
}

/* ── Filtering & Sorting ────────────────────────────────── */

export function filterAndSortGoals(rows: GoalRow[], filters: GoalFiltersState): GoalRow[] {
  let filtered = [...rows];

  // 1. Status Filter
  if (filters.status === 'active') {
    filtered = filtered.filter((g) => g.status !== 'completed' && g.status !== 'paused');
  } else if (filters.status === 'completed') {
    filtered = filtered.filter((g) => g.status === 'completed' || g.pace.progressPercentage >= 100);
  } else if (filters.status === 'paused') {
    filtered = filtered.filter((g) => g.status === 'paused');
  }

  // 2. Bucket Filter
  if (filters.bucketId && filters.bucketId !== 'all') {
    filtered = filtered.filter((g) => g.bucket_id === filters.bucketId);
  }

  // 3. Search query
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (g) => g.name.toLowerCase().includes(q) || g.bucketLabel.toLowerCase().includes(q)
    );
  }

  // 4. Sort
  filtered.sort((a, b) => {
    let diff = 0;
    switch (filters.sortBy) {
      case 'target_date':
        diff = new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
        break;
      case 'progress_pct':
        diff = a.pace.progressPercentage - b.pace.progressPercentage;
        break;
      case 'remaining_amount':
        diff = a.pace.remainingAmount - b.pace.remainingAmount;
        break;
      case 'target_amount':
        diff = a.target_amount - b.target_amount;
        break;
      case 'name':
        diff = a.name.localeCompare(b.name);
        break;
    }
    return filters.sortDirection === 'asc' ? diff : -diff;
  });

  return filtered;
}

/* ── Smart Insights Generator ───────────────────────────── */

export function generateGoalInsights(rows: GoalRow[]): GoalInsight[] {
  const insights: GoalInsight[] = [];

  // Completed goal celebration
  const recentlyCompleted = rows.find(
    (g) => g.status === 'completed' || g.pace.progressPercentage >= 100
  );
  if (recentlyCompleted) {
    insights.push({
      id: `milestone-${recentlyCompleted.id}`,
      type: 'milestone',
      title: `Milestone reached: ${recentlyCompleted.name}!`,
      description: `Target of ${formatInr(recentlyCompleted.target_amount)} fully achieved. You've successfully built your goal fund!`,
      actionLabel: 'View Goal',
      goalId: recentlyCompleted.id,
      tone: 'positive',
    });
  }

  // Overdue goals alert
  const overdueGoal = rows.find((g) => g.pace.isOverdue);
  if (overdueGoal) {
    insights.push({
      id: `overdue-${overdueGoal.id}`,
      type: 'overdue',
      title: `${overdueGoal.name} is past due date`,
      description: `Target date was ${overdueGoal.target_date}. You still need ${formatInr(overdueGoal.pace.remainingAmount)} to complete this goal.`,
      actionLabel: 'Add Money',
      goalId: overdueGoal.id,
      tone: 'negative',
    });
  }

  // Behind pace recommendation
  const behindGoal = rows.find(
    (g) =>
      !g.pace.isOverdue && !g.pace.isOnTrack && g.status !== 'completed' && g.status !== 'paused'
  );
  if (behindGoal) {
    const targetMonthYear = new Date(behindGoal.target_date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    insights.push({
      id: `behind-${behindGoal.id}`,
      type: 'behind',
      title: `${behindGoal.name} needs attention`,
      description: `Needs ${formatInr(behindGoal.pace.recommendedMonthly)}/month (₹${(behindGoal.pace.monthlyShortfall ?? 0).toLocaleString('en-IN')} more) to be ready by ${targetMonthYear}.`,
      actionLabel: 'Adjust Plan',
      goalId: behindGoal.id,
      tone: 'warning',
    });
  }

  return insights;
}

/* ── "What-if" Calculator Helper ────────────────────────── */

export function calculateWhatIf(
  targetAmount: number,
  currentSaved: number,
  targetDateStr: string,
  customMonthly?: number,
  customTargetDate?: string
) {
  const remaining = Math.max(0, targetAmount - currentSaved);

  if (customMonthly !== undefined && customMonthly > 0) {
    const monthsNeeded = Math.ceil(remaining / customMonthly);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);
    return {
      type: 'by_amount' as const,
      monthsNeeded,
      projectedDate: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      weeklyPace: roundMoney(customMonthly / 4.33),
    };
  }

  // By target date
  const targetDate = new Date(customTargetDate || targetDateStr);
  const now = new Date();
  const diffMonths = Math.max(
    1,
    (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth())
  );
  const monthlyNeeded = roundMoney(remaining / diffMonths);
  const weeklyNeeded = roundMoney(monthlyNeeded / 4.33);

  return {
    type: 'by_date' as const,
    monthsNeeded: diffMonths,
    monthlyNeeded,
    weeklyNeeded,
  };
}

/* ── Projection Timeline Data ───────────────────────────── */

export function generateProjectionTimeline(goal: GoalRow): ProjectionTimelinePoint[] {
  const points: ProjectionTimelinePoint[] = [];
  const now = new Date();
  const currentSaved = goal.current_progress;
  const target = goal.target_amount;
  const plan = goal.monthly_contribution_plan || goal.pace.recommendedMonthly || 1000;
  const rec = goal.pace.recommendedMonthly || plan;

  // Generate 6-12 month projection
  const totalMonths = Math.min(18, Math.max(6, goal.pace.monthsRemaining + 2));

  let runningPlan = currentSaved;
  let runningRec = currentSaved;

  for (let i = 0; i <= totalMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    if (i > 0) {
      runningPlan = Math.min(target, roundMoney(runningPlan + plan));
      runningRec = Math.min(target, roundMoney(runningRec + rec));
    }

    points.push({
      month: d.toISOString().slice(0, 7),
      label: monthKey,
      projected: runningPlan,
      recommended: runningRec,
      target,
    });
  }

  return points;
}

/* ── Monthly Contribution History Aggregate ─────────────── */

export function generateMonthlyContributionHistory(rows: GoalRow[]): GoalContributionMonthPoint[] {
  const map: Record<string, { amount: number; count: number }> = {};

  for (const g of rows) {
    for (const c of g.contributions) {
      const monthKey = c.date.slice(0, 7);
      if (!map[monthKey]) {
        map[monthKey] = { amount: 0, count: 0 };
      }
      map[monthKey].amount += Number(c.amount) || 0;
      map[monthKey].count += 1;
    }
  }

  const sortedMonths = Object.keys(map).sort();
  if (sortedMonths.length === 0) {
    // Generate recent 3 months default empty/starter
    const now = new Date();
    return [-2, -1, 0].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const m = d.toISOString().slice(0, 7);
      return {
        month: m,
        monthLabel: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: 0,
        count: 0,
      };
    });
  }

  return sortedMonths.map((m) => {
    const [y, mo] = m.split('-').map(Number);
    const d = new Date(y, mo - 1, 1);
    return {
      month: m,
      monthLabel: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount: roundMoney(map[m].amount),
      count: map[m].count,
    };
  });
}
