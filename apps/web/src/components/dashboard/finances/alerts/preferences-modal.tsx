'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Mail, Smartphone, Clock, Save } from 'lucide-react';
import type { NotificationCategory, NotificationFrequency } from '@kalya/types';
import { useNotificationPreferencesQuery, useAlertActions } from '@/hooks/finances';
import { Button } from '@/components/ui/forms/button';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RowState {
  category: NotificationCategory;
  label: string;
  description: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  frequency: NotificationFrequency;
  customSchedule: string;
}

const DEFAULT_ROWS: RowState[] = [
  {
    category: 'statement',
    label: 'Financial Statements',
    description: 'Monthly overview summaries, exportable snapshots, and annual retrospectives.',
    emailEnabled: true,
    pushEnabled: true,
    frequency: 'monthly',
    customSchedule: '',
  },
  {
    category: 'budget_alerts',
    label: 'Budget Threshold Alerts',
    description:
      'Immediate warnings when spending reaches 80% (Amber) or 100% (Red) of budget limit.',
    emailEnabled: true,
    pushEnabled: true,
    frequency: 'immediate',
    customSchedule: '',
  },
  {
    category: 'split_reminders',
    label: 'Split Bill Reminders',
    description:
      'Notifications for friend share requests, settlements, and overdue pending amounts.',
    emailEnabled: false,
    pushEnabled: true,
    frequency: 'daily',
    customSchedule: '',
  },
  {
    category: 'marketing',
    label: 'Tips & Wealth Insights',
    description: 'Educational insights, market trends on gold/equities, and feature release notes.',
    emailEnabled: false,
    pushEnabled: false,
    frequency: 'weekly',
    customSchedule: '',
  },
];

export function NotificationPreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const { data: serverPrefs } = useNotificationPreferencesQuery();
  const { upsertPreference } = useAlertActions();
  const [rows, setRows] = useState<RowState[]>(DEFAULT_ROWS);
  const [isSaving, setIsSaving] = useState(false);

  // Sync rows from server preferences
  useEffect(() => {
    if (serverPrefs && serverPrefs.length > 0) {
      setRows((prev) =>
        prev.map((row) => {
          const emailPref = serverPrefs.find(
            (p) => p.category === row.category && p.channel === 'email'
          );
          const pushPref = serverPrefs.find(
            (p) => p.category === row.category && p.channel === 'push'
          );

          const freq = emailPref?.frequency ?? pushPref?.frequency ?? row.frequency;
          const customSched =
            emailPref?.custom_schedule ?? pushPref?.custom_schedule ?? row.customSchedule;

          return {
            ...row,
            emailEnabled: emailPref ? emailPref.is_enabled : row.emailEnabled,
            pushEnabled: pushPref ? pushPref.is_enabled : row.pushEnabled,
            frequency: freq,
            customSchedule: customSched ?? '',
          };
        })
      );
    }
  }, [serverPrefs]);

  const handleToggle = (category: NotificationCategory, channel: 'email' | 'push') => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.category !== category) return r;
        return channel === 'email'
          ? { ...r, emailEnabled: !r.emailEnabled }
          : { ...r, pushEnabled: !r.pushEnabled };
      })
    );
  };

  const handleFrequencyChange = (category: NotificationCategory, freq: NotificationFrequency) => {
    setRows((prev) => prev.map((r) => (r.category === category ? { ...r, frequency: freq } : r)));
  };

  const handleScheduleChange = (category: NotificationCategory, schedule: string) => {
    setRows((prev) =>
      prev.map((r) => (r.category === category ? { ...r, customSchedule: schedule } : r))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const row of rows) {
        // Upsert Email pref
        await upsertPreference(
          {
            category: row.category,
            channel: 'email',
            is_enabled: row.emailEnabled,
            frequency: row.frequency,
            custom_schedule: row.frequency === 'custom' ? row.customSchedule : null,
          },
          { silent: true }
        );

        // Upsert Push pref
        await upsertPreference(
          {
            category: row.category,
            channel: 'push',
            is_enabled: row.pushEnabled,
            frequency: row.frequency,
            custom_schedule: row.frequency === 'custom' ? row.customSchedule : null,
          },
          { silent: true }
        );
      }
      onClose();
    } catch {
      // Error handled by runAction toast
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pref-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative z-50 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-surface-raised shadow-2xl backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/30">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 id="pref-modal-title" className="text-base font-bold text-text-primary">
                  Notification Delivery Preferences
                </h2>
                <p className="text-xs text-text-secondary">
                  Configure delivery channels and digest schedules for alerts.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface hover:text-text-primary transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Matrix */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {rows.map((row) => (
              <div
                key={row.category}
                className="rounded-2xl border border-border/80 bg-surface/50 p-4 transition-all hover:bg-surface/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Category Info */}
                  <div className="max-w-xs">
                    <h4 className="text-xs font-semibold text-text-primary sm:text-sm">
                      {row.label}
                    </h4>
                    <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
                      {row.description}
                    </p>
                  </div>

                  {/* Channel Switches & Frequency */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Email Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="flex items-center gap-1 text-xs font-medium text-text-secondary">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </span>
                      <input
                        type="checkbox"
                        checked={row.emailEnabled}
                        onChange={() => handleToggle(row.category, 'email')}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40 accent-accent cursor-pointer"
                      />
                    </label>

                    {/* Push Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="flex items-center gap-1 text-xs font-medium text-text-secondary">
                        <Smartphone className="h-3.5 w-3.5" />
                        Push
                      </span>
                      <input
                        type="checkbox"
                        checked={row.pushEnabled}
                        onChange={() => handleToggle(row.category, 'push')}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40 accent-accent cursor-pointer"
                      />
                    </label>

                    {/* Frequency Selector */}
                    <div className="relative">
                      <select
                        value={row.frequency}
                        onChange={(e) =>
                          handleFrequencyChange(
                            row.category,
                            e.target.value as NotificationFrequency
                          )
                        }
                        className="h-7 rounded-lg border border-border bg-surface px-2 text-xs font-medium text-text-secondary hover:text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 cursor-pointer"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="daily">Daily digest</option>
                        <option value="weekly">Weekly digest</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom schedule</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Custom Schedule input if selected */}
                {row.frequency === 'custom' && (
                  <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-2.5">
                    <Clock className="h-3.5 w-3.5 text-text-tertiary" />
                    <span className="text-xs text-text-secondary">Schedule expression:</span>
                    <input
                      type="text"
                      value={row.customSchedule}
                      onChange={(e) => handleScheduleChange(row.category, e.target.value)}
                      placeholder="e.g. 0 9 * * 1 (Every Mon at 9 AM)"
                      className="flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/80 bg-surface/30 px-6 py-4">
            <span className="text-xs text-text-muted">
              Preferences apply across all linked devices and email addresses.
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs border-border"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={handleSave}
                className="gap-1.5 text-xs font-semibold"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? 'Saving…' : 'Save preferences'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
