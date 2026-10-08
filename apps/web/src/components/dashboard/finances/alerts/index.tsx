'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, RefreshCw, AlertCircle } from 'lucide-react';
import { useAlertsData } from './use-alerts-data';
import { AlertCards } from './cards';
import { AlertsToolbar } from './toolbar';
import { AlertFeed } from './feed';
import { AlertsBulkBar } from './bulk-bar';
import { AlertsEmptyState } from './empty-state';
import { NotificationPreferencesModal } from './preferences-modal';
import { Button } from '@/components/ui/forms/button';

export function Alerts() {
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const {
    alerts,
    dayGroups,
    combinedFeed,
    metrics,
    isLoading,
    isError,
    refetch,

    tabFilter,
    setTabFilter,
    dateFilter,
    setDateFilter,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,

    selectedIds,
    toggleSelect,
    selectAll,
    deselectAll,
    isAllSelected,

    markAsRead,
    toggleReadStatus,
    markAllAsRead,
    markSelectedAsRead,
    deleteAlert,
    deleteSelected,
    snoozeAlert,
  } = useAlertsData();

  const hasActiveFilters =
    tabFilter !== 'all' || dateFilter !== 'all' || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setTabFilter('all');
    setDateFilter('all');
    setSearchQuery('');
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-6 pb-20 select-none">
      {/* 1. Summary KPI Cards at the Top */}
      <div className="mt-5">
        <AlertCards
          metrics={metrics}
          onMarkAllAsRead={markAllAsRead}
          onFilterChange={setTabFilter}
        />
      </div>

      {/* 2. Toolbar & Category Filters */}
      <AlertsToolbar
        tabFilter={tabFilter}
        onTabChange={setTabFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        unreadCount={metrics.unread}
        totalCount={metrics.totalCount}
        onMarkAllAsRead={markAllAsRead}
        onOpenPreferences={() => setPreferencesOpen(true)}
      />

      {/* 3. Main Content: Feed or Empty State or Loading */}
      {isLoading ? (
        <div className="flex flex-col gap-3 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-2xl border border-border/60 bg-surface/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <h3 className="mt-3 text-sm font-semibold text-text-primary">
            Failed to sync live notifications
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            Could not reach the notifications service. Please check your connection.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : alerts.length === 0 ? (
        <AlertsEmptyState
          hasFiltersActive={hasActiveFilters}
          onResetFilters={handleResetFilters}
          onOpenPreferences={() => setPreferencesOpen(true)}
        />
      ) : (
        <AlertFeed
          dayGroups={dayGroups}
          activityFeed={combinedFeed}
          viewMode={viewMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onMarkRead={markAsRead}
          onToggleReadStatus={toggleReadStatus}
          onDelete={deleteAlert}
          onSnooze={snoozeAlert}
        />
      )}

      {/* 4. Bulk Actions Bar (Sticky floating bar when items selected) */}
      <AlertsBulkBar
        selectedCount={selectedIds.size}
        totalFilteredCount={alerts.length}
        isAllSelected={isAllSelected}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onMarkSelectedAsRead={markSelectedAsRead}
        onDeleteSelected={deleteSelected}
      />

      {/* 5. Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </section>
  );
}

export default Alerts;
