import type { Goal, GoalStatus, Bucket } from '@kalya/types';

export interface GoalContribution {
  id: string;
  goal_id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  created_at?: string;
}

export interface GoalPaceExtended {
  progressPercentage: number;
  remainingAmount: number;
  monthsRemaining: number;
  daysRemaining: number;
  recommendedMonthly: number;
  isOnTrack: boolean;
  isOverdue: boolean;
  projectedCompletionDate?: string | null;
  projectedMonths?: number;
  monthlyShortfall?: number;
}

export interface GoalRow {
  id: string;
  user_id?: string;
  bucket_id: string;
  bucketLabel: string;
  bucketColor?: string;
  name: string;
  target_amount: number;
  target_date: string; // YYYY-MM-DD
  current_progress: number;
  monthly_contribution_plan: number;
  status: GoalStatus;
  pace: GoalPaceExtended;
  contributions: GoalContribution[];
  created_at?: string;
  updated_at?: string;
}

export interface GoalTotals {
  totalSaved: number;
  totalTarget: number;
  overallProgressPct: number;
  activeGoalsCount: number;
  onTrackCount: number;
  behindCount: number;
  completedCount: number;
  pausedCount: number;
  overdueCount: number;
  totalMonthlyPlanNeeded: number;
  totalMonthlyPlanConfigured: number;
}

export type GoalSortField =
  'target_date' | 'progress_pct' | 'remaining_amount' | 'target_amount' | 'name';
export type GoalSortDirection = 'asc' | 'desc';
export type GoalStatusFilter = 'all' | 'active' | 'completed' | 'paused';
export type GoalViewMode = 'cards' | 'table';

export interface GoalFiltersState {
  status: GoalStatusFilter;
  bucketId: string; // 'all' or bucket UUID
  searchQuery: string;
  sortBy: GoalSortField;
  sortDirection: GoalSortDirection;
  viewMode: GoalViewMode;
}

export interface GoalInsight {
  id: string;
  type: 'behind' | 'overdue' | 'milestone' | 'recommendation';
  title: string;
  description: string;
  actionLabel?: string;
  goalId?: string;
  tone: 'positive' | 'warning' | 'negative' | 'info';
}

export interface ProjectionTimelinePoint {
  month: string;
  label: string;
  projected: number;
  recommended: number;
  target: number;
}

export interface GoalContributionMonthPoint {
  month: string;
  monthLabel: string;
  amount: number;
  count: number;
}
