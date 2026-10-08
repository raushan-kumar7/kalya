'use client';

import React from 'react';
import {
  Bell,
  CheckCheck,
  Filter,
  Search,
  Settings,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  Sparkles,
  Activity,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/forms/button';
import type { AlertDateFilter, AlertSortOrder, AlertTabFilter, AlertViewMode } from './types';

interface AlertsToolbarProps {
  tabFilter: AlertTabFilter;
  onTabChange: (tab: AlertTabFilter) => void;
  dateFilter: AlertDateFilter;
  onDateChange: (date: AlertDateFilter) => void;
  sortOrder: AlertSortOrder;
  onSortChange: (sort: AlertSortOrder) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: AlertViewMode;
  onViewModeChange: (mode: AlertViewMode) => void;
  unreadCount: number;
  totalCount: number;
  onMarkAllAsRead: () => void;
  onOpenPreferences: () => void;
}

export function AlertsToolbar({
  tabFilter,
  onTabChange,
  dateFilter,
  onDateChange,
  sortOrder,
  onSortChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  unreadCount,
  totalCount,
  onMarkAllAsRead,
  onOpenPreferences,
}: AlertsToolbarProps) {
  const tabs: { id: AlertTabFilter; label: string; badge?: number }[] = [
    { id: 'all', label: 'All', badge: totalCount },
    { id: 'unread', label: 'Unread', badge: unreadCount },
    { id: 'budget_alert', label: 'Budgets' },
    { id: 'split_update', label: 'Splits' },
    { id: 'goal_milestone', label: 'Goals' },
    { id: 'system', label: 'System' },
  ];

  const dateOptions: { id: AlertDateFilter; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
              Alerts & Activity Feed
            </h1>
            {unreadCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/30">
                {unreadCount} unread
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-surface-raised px-2.5 py-0.5 text-xs font-medium text-text-muted border border-border/80">
                Caught up
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-text-secondary sm:text-sm">
            Real-time financial notifications, threshold alerts, and transaction milestones.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* View Mode Toggle: Alerts vs Combined Activity */}
          <div className="flex items-center rounded-xl border border-border/80 bg-surface-raised/70 p-1">
            <button
              type="button"
              onClick={() => onViewModeChange('alerts')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                viewMode === 'alerts'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              <Bell className="h-3.5 w-3.5" />
              Alerts
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('feed')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                viewMode === 'feed'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              <Activity className="h-3.5 w-3.5" />
              Activity Feed
            </button>
          </div>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-9 gap-1.5 border-border/80 text-xs font-medium hover:bg-surface-subtle"
            >
              <CheckCheck className="h-3.5 w-3.5 text-accent" />
              Mark all read
            </Button>
          )}

          {/* Preferences Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPreferences}
            className="h-9 gap-1.5 border-border/80 text-xs font-medium hover:bg-surface-subtle"
          >
            <Settings className="h-3.5 w-3.5 text-text-secondary" />
            Preferences
          </Button>
        </div>
      </div>

      {/* 2. Controls & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface-raised/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const isActive = tabFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition-all select-none',
                  isActive
                    ? 'bg-surface text-text-primary shadow-xs ring-1 ring-border/80 font-semibold'
                    : 'text-text-secondary hover:bg-surface/50 hover:text-text-primary'
                )}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={cn(
                      'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
                      isActive ? 'bg-accent/20 text-accent' : 'bg-surface-subtle text-text-muted'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative min-w-50 flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search alerts…"
              className="w-full rounded-xl border border-border/80 bg-surface py-1.5 pl-8 pr-8 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => onDateChange(e.target.value as AlertDateFilter)}
              className="h-8 rounded-xl border border-border/80 bg-surface px-2.5 pr-7 text-xs font-medium text-text-secondary hover:text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-all appearance-none cursor-pointer"
            >
              {dateOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary" />
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => onSortChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
            title={`Sort: ${sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}`}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-border/80 bg-surface px-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-all"
          >
            <ArrowUpDown className="h-3 w-3 text-text-tertiary" />
            <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
