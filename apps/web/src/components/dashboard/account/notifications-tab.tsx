'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  CalendarClock,
  Clock,
  Laptop,
  Lightbulb,
  Mail,
  RotateCcw,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@kalya/types';
import {
  formatDateTime,
  formatRelativeTime,
  formatTimeAgo,
  getNextCronRunDate,
} from '@kalya/utils';
import {
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  toast,
} from '@/components/ui';
import { cn } from '@/libs/utils';
import { useWebPush } from '@/hooks/use-web-push';
import {
  useNotificationPreferencesQuery,
  useUpsertNotificationPreferenceMutation,
} from '@/hooks/finances';

export interface NotificationsTabProps {
  user: User | null;
}

type Frequency = 'off' | 'weekly' | 'monthly';
type Channels = { email: boolean; push: boolean; inApp: boolean };

interface NotificationSettings {
  expenseReportFrequency: Frequency;
  budgetThresholdEnabled: boolean;
  budgetThresholdPercent: string;
  budgetThresholdChannels: Channels;
  largeTransactionEnabled: boolean;
  largeTransactionAmount: string;
  largeTransactionChannels: Channels;
  weeklyDigestEnabled: boolean;
  smartInsightsEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  expenseReportFrequency: 'monthly',
  budgetThresholdEnabled: true,
  budgetThresholdPercent: '90',
  budgetThresholdChannels: { email: true, push: true, inApp: true },
  largeTransactionEnabled: true,
  largeTransactionAmount: '10000',
  largeTransactionChannels: { email: true, push: true, inApp: true },
  weeklyDigestEnabled: true,
  smartInsightsEnabled: true,
};

/* ---------- Shared Sub-components ---------- */

function RowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="bg-primary-subtle text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
      <Icon className="h-4 w-4" />
    </div>
  );
}

function ChannelToggle({
  channels,
  onChange,
}: {
  channels: Channels;
  onChange: (next: Channels) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange({ ...channels, email: !channels.email })}
        aria-pressed={channels.email}
        title="Email notifications"
        aria-label="Toggle email notifications"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-md border transition-colors cursor-pointer',
          channels.email
            ? 'border-primary/30 bg-primary-subtle text-primary'
            : 'border-border text-text-muted hover:text-text-primary hover:bg-surface-raised'
        )}
      >
        <Mail className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onChange({ ...channels, push: !channels.push })}
        aria-pressed={channels.push}
        title="Push notifications (Browser & Mobile)"
        aria-label="Toggle push notifications"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-md border transition-colors cursor-pointer',
          channels.push
            ? 'border-primary/30 bg-primary-subtle text-primary'
            : 'border-border text-text-muted hover:text-text-primary hover:bg-surface-raised'
        )}
      >
        <Smartphone className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onChange({ ...channels, inApp: !channels.inApp })}
        aria-pressed={channels.inApp}
        title="In-app notifications"
        aria-label="Toggle in-app notifications"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-md border transition-colors cursor-pointer',
          channels.inApp
            ? 'border-primary/30 bg-primary-subtle text-primary'
            : 'border-border text-text-muted hover:text-text-primary hover:bg-surface-raised'
        )}
      >
        <Bell className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function DetailPanel({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="overflow-hidden"
      >
        <div className="border-border bg-surface-raised/70 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <h2 className="border-accent text-text-primary text-body-md flex items-center gap-2 border-l-2 pl-2.5 font-semibold">
      <Icon className="text-accent h-4 w-4" />
      {title}
    </h2>
  );
}

export function NotificationsTab({ user }: NotificationsTabProps) {
  const [settings, setSettings] = React.useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = React.useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = React.useState(false);

  // TanStack Query & Web Push Hooks
  const { data: serverPrefs } = useNotificationPreferencesQuery();
  const upsertMutation = useUpsertNotificationPreferenceMutation();
  const {
    permission,
    isSubscribed,
    isLoading: isPushLoading,
    devices,
    subscribeToPush,
    unsubscribeFromPush,
    revokeDevice,
    isRevoking,
    sendTestPush,
    isSendingTest,
  } = useWebPush();

  // Populate settings from server preferences when loaded
  React.useEffect(() => {
    if (!serverPrefs || serverPrefs.length === 0) return;

    setSettings((prev) => {
      const next = { ...prev };
      for (const pref of serverPrefs) {
        if (pref.category === 'statement') {
          next.expenseReportFrequency = (pref.frequency as Frequency) || 'monthly';
        }
        if (pref.category === 'budget_alerts') {
          next.budgetThresholdEnabled = pref.is_enabled;
          if (pref.channel === 'push') next.budgetThresholdChannels.push = pref.is_enabled;
          if (pref.channel === 'email') next.budgetThresholdChannels.email = pref.is_enabled;
          if (pref.channel === 'in_app') next.budgetThresholdChannels.inApp = pref.is_enabled;
        }
        if (pref.category === 'large_transactions') {
          next.largeTransactionEnabled = pref.is_enabled;
          if (pref.channel === 'push') next.largeTransactionChannels.push = pref.is_enabled;
          if (pref.channel === 'email') next.largeTransactionChannels.email = pref.is_enabled;
          if (pref.channel === 'in_app') next.largeTransactionChannels.inApp = pref.is_enabled;
        }
        if (pref.category === 'marketing') {
          next.weeklyDigestEnabled = pref.is_enabled;
        }
        if (pref.category === 'smart_insights') {
          next.smartInsightsEnabled = pref.is_enabled;
        }
      }
      return next;
    });

    setSaved((prev) => ({ ...prev }));
  }, [serverPrefs]);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(saved);

  // Next run dates computed via @kalya/utils
  const nextExpenseReport = React.useMemo(() => {
    if (settings.expenseReportFrequency === 'off') return null;
    const cronExpr =
      settings.expenseReportFrequency === 'weekly'
        ? '0 9 * * 1' // Monday at 9am
        : '0 9 1 * *'; // 1st of month at 9am
    return getNextCronRunDate(cronExpr);
  }, [settings.expenseReportFrequency]);

  const nextWeeklyDigest = React.useMemo(() => {
    if (!settings.weeklyDigestEnabled) return null;
    return getNextCronRunDate('0 8 * * 1'); // Monday at 8am
  }, [settings.weeklyDigestEnabled]);

  const amountInvalid =
    settings.largeTransactionEnabled &&
    (!settings.largeTransactionAmount || Number(settings.largeTransactionAmount) <= 0);

  const update = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleDiscard = () => setSettings(saved);

  const handleSave = async () => {
    if (amountInvalid) return;
    setIsSaving(true);
    try {
      // Upsert preferences across categories & channels
      const promises: Promise<any>[] = [];

      // 1. Budget Alerts
      const budgetChannelConfigs: { channel: 'email' | 'push' | 'in_app'; isEnabled: boolean }[] = [
        { channel: 'email', isEnabled: settings.budgetThresholdChannels.email },
        { channel: 'push', isEnabled: settings.budgetThresholdChannels.push },
        { channel: 'in_app', isEnabled: settings.budgetThresholdChannels.inApp },
      ];
      for (const item of budgetChannelConfigs) {
        promises.push(
          upsertMutation.mutateAsync({
            category: 'budget_alerts',
            channel: item.channel,
            frequency: 'immediate',
            is_enabled: settings.budgetThresholdEnabled && item.isEnabled,
          })
        );
      }

      // 2. Large Transactions
      const largeTxConfigs: { channel: 'email' | 'push' | 'in_app'; isEnabled: boolean }[] = [
        { channel: 'email', isEnabled: settings.largeTransactionChannels.email },
        { channel: 'push', isEnabled: settings.largeTransactionChannels.push },
        { channel: 'in_app', isEnabled: settings.largeTransactionChannels.inApp },
      ];
      for (const item of largeTxConfigs) {
        promises.push(
          upsertMutation.mutateAsync({
            category: 'large_transactions',
            channel: item.channel,
            frequency: 'immediate',
            is_enabled: settings.largeTransactionEnabled && item.isEnabled,
          })
        );
      }

      // 3. Statement Frequency
      promises.push(
        upsertMutation.mutateAsync({
          category: 'statement',
          channel: 'email',
          frequency:
            settings.expenseReportFrequency === 'off' ? 'monthly' : settings.expenseReportFrequency,
          is_enabled: settings.expenseReportFrequency !== 'off',
        })
      );

      // 4. Digest & Insights
      promises.push(
        upsertMutation.mutateAsync({
          category: 'marketing',
          channel: 'push',
          frequency: 'weekly',
          is_enabled: settings.weeklyDigestEnabled,
        })
      );

      promises.push(
        upsertMutation.mutateAsync({
          category: 'smart_insights',
          channel: 'push',
          frequency: 'immediate',
          is_enabled: settings.smartInsightsEnabled,
        })
      );

      await Promise.allSettled(promises);
      setSaved(settings);
      toast.success('Notification preferences saved successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Please try again.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const currencySymbol = user?.currency === 'USD' ? '$' : user?.currency === 'EUR' ? '€' : '₹';

  return (
    <Card className="mb-10 p-6 shadow-card">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-border flex flex-col gap-1.5 border-b pb-5">
          <h2 className="text-text-primary font-display text-body-lg flex items-center gap-2 font-semibold">
            <Bell className="text-accent h-4.5 w-4.5" />
            Notifications & Alerts
          </h2>
          <p className="text-text-secondary text-body-sm">
            Control push notifications, email reports, and alert thresholds across devices.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* ---------- 1. Web Push & Device Management ---------- */}
          <div className="flex flex-col gap-4">
            <SectionHeader icon={Smartphone} title="Push Notifications & Connected Devices" />

            <div className="border-border bg-surface-raised/40 rounded-xl border p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <RowIcon icon={Smartphone} />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary text-body-sm font-medium">
                        Browser Push Notifications
                      </span>
                      {isSubscribed ? (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10.5px] font-semibold px-2 py-0.5 rounded-full">
                          Active on this browser
                        </span>
                      ) : permission === 'denied' ? (
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10.5px] font-semibold px-2 py-0.5 rounded-full">
                          Blocked in browser
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10.5px] font-semibold px-2 py-0.5 rounded-full">
                          Not enabled
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-caption">
                      Receive immediate budget warnings and split reminders even when Kalya is
                      closed.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => sendTestPush()}
                    isLoading={isSendingTest}
                    leftIcon={<Send size={13} />}
                    className="text-xs h-8"
                  >
                    Send Test Push
                  </Button>

                  {isSubscribed ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => unsubscribeFromPush()}
                      isLoading={isPushLoading}
                      className="text-xs h-8 text-rose-500 hover:text-rose-600"
                    >
                      Disable
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => subscribeToPush()}
                      isLoading={isPushLoading}
                      className="text-xs h-8"
                    >
                      Enable Browser Push
                    </Button>
                  )}
                </div>
              </div>

              {/* Registered Devices List */}
              {devices.length > 0 && (
                <div className="border-border/60 mt-4 border-t pt-3">
                  <span className="text-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Registered Devices ({devices.length})
                  </span>
                  <div className="mt-2 divide-y divide-border/40">
                    {devices.map((device) => {
                      const DeviceIcon = device.platform === 'web' ? Laptop : Smartphone;
                      return (
                        <div
                          key={device.id}
                          className="flex items-center justify-between py-2.5 text-body-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <DeviceIcon className="text-text-muted h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="text-text-primary text-xs font-medium">
                                {device.device_name}
                              </span>
                              <span className="text-text-muted text-[10.5px]">
                                Added {formatTimeAgo(device.created_at)}
                                {device.last_seen_at &&
                                  ` • Active ${formatTimeAgo(device.last_seen_at)}`}
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeDevice(device.id)}
                            disabled={isRevoking}
                            title="Revoke device"
                            className="text-text-muted hover:text-rose-500 h-7 w-7 p-0"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---------- 2. Email Reports ---------- */}
          <div className="flex flex-col gap-4">
            <SectionHeader icon={Mail} title="Email Reports" />

            <div className="flex items-start gap-3.5">
              <RowIcon icon={Mail} />
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-primary text-body-sm font-medium">
                    Financial Expense Summary
                  </span>
                  <p className="text-text-secondary text-caption">
                    A comprehensive report of your income, expenses, and category allocations
                    delivered by email.
                  </p>
                  {nextExpenseReport ? (
                    <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1.5">
                      <Clock size={12} className="text-accent shrink-0" />
                      Next scheduled:{' '}
                      <span className="font-medium text-text-secondary">
                        {formatDateTime(nextExpenseReport, user?.timezone ?? undefined)} (
                        {formatRelativeTime(nextExpenseReport)})
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-text-muted mt-1">
                      Scheduled email reports are currently paused.
                    </p>
                  )}
                </div>
                <Select
                  value={settings.expenseReportFrequency}
                  onValueChange={(v) => update('expenseReportFrequency', v as Frequency)}
                >
                  <SelectTrigger className="h-9 w-32 text-body-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ---------- 3. Spending Alerts ---------- */}
          <div className="flex flex-col gap-4">
            <SectionHeader icon={AlertTriangle} title="Spending Alerts" />

            <div className="border-border flex flex-col divide-y divide-border/60">
              {/* Budget threshold */}
              <div className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0">
                <RowIcon icon={AlertTriangle} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text-primary text-body-sm font-medium">
                      Budget Threshold Warnings
                    </span>
                    <Switch
                      checked={settings.budgetThresholdEnabled}
                      onCheckedChange={(v) => update('budgetThresholdEnabled', v)}
                      aria-label="Toggle budget threshold alerts"
                    />
                  </div>
                  <p className="text-text-secondary text-caption">
                    Get notified immediately when a category crosses a percentage threshold you set.
                  </p>

                  {settings.budgetThresholdEnabled && (
                    <DetailPanel>
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted text-caption">Alert me at</span>
                        <Select
                          value={settings.budgetThresholdPercent}
                          onValueChange={(v) => update('budgetThresholdPercent', v)}
                        >
                          <SelectTrigger className="h-8 w-24 text-body-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="75">75%</SelectItem>
                            <SelectItem value="90">90%</SelectItem>
                            <SelectItem value="100">100%</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-text-muted text-caption">of category budget</span>
                      </div>
                      <ChannelToggle
                        channels={settings.budgetThresholdChannels}
                        onChange={(c) => update('budgetThresholdChannels', c)}
                      />
                    </DetailPanel>
                  )}
                </div>
              </div>

              {/* Large transaction */}
              <div className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0">
                <RowIcon icon={ArrowLeftRight} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text-primary text-body-sm font-medium">
                      Large Transaction Alerts
                    </span>
                    <Switch
                      checked={settings.largeTransactionEnabled}
                      onCheckedChange={(v) => update('largeTransactionEnabled', v)}
                      aria-label="Toggle large transaction alerts"
                    />
                  </div>
                  <p className="text-text-secondary text-caption">
                    Get alerted the moment a single transaction exceeds an amount you define.
                  </p>

                  {settings.largeTransactionEnabled && (
                    <DetailPanel>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted text-caption">Alert me above</span>
                          <Input
                            type="number"
                            min={1}
                            prefixText={currencySymbol}
                            value={settings.largeTransactionAmount}
                            onChange={(e) => update('largeTransactionAmount', e.target.value)}
                            className="h-8 text-body-sm w-36"
                          />
                        </div>
                        {amountInvalid && (
                          <span className="text-danger text-caption">Enter an amount above 0.</span>
                        )}
                      </div>
                      <ChannelToggle
                        channels={settings.largeTransactionChannels}
                        onChange={(c) => update('largeTransactionChannels', c)}
                      />
                    </DetailPanel>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- 4. Digest & Insights ---------- */}
          <div className="flex flex-col gap-4">
            <SectionHeader icon={Lightbulb} title="Digest & Insights" />

            <div className="border-border flex flex-col divide-y divide-border/60">
              <div className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0">
                <RowIcon icon={CalendarClock} />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-primary text-body-sm font-medium">
                      Weekly Digest
                    </span>
                    <p className="text-text-secondary text-caption">
                      Delivered every Monday: how your net worth moved, savings progress, and top
                      categories.
                    </p>
                    {settings.weeklyDigestEnabled && nextWeeklyDigest && (
                      <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1.5">
                        <CalendarClock size={12} className="text-accent shrink-0" />
                        Next dispatch:{' '}
                        <span className="font-medium text-text-secondary">
                          {formatDateTime(nextWeeklyDigest, user?.timezone ?? undefined)} (
                          {formatRelativeTime(nextWeeklyDigest)})
                        </span>
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={settings.weeklyDigestEnabled}
                    onCheckedChange={(v) => update('weeklyDigestEnabled', v)}
                    aria-label="Toggle weekly digest"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0">
                <RowIcon icon={Lightbulb} />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-primary text-body-sm font-medium">
                      Smart Financial Insights
                    </span>
                    <p className="text-text-secondary text-caption">
                      New recurring subscriptions, unusual spending anomalies, and savings
                      opportunities.
                    </p>
                  </div>
                  <Switch
                    checked={settings.smartInsightsEnabled}
                    onCheckedChange={(v) => update('smartInsightsEnabled', v)}
                    aria-label="Toggle smart insights"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Sync & Meta Footer */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 pt-4 text-caption text-text-muted">
          <span>
            Target alerts delivery address:{' '}
            <code className="text-text-secondary font-mono">
              {user?.email || 'Registered account email'}
            </code>
          </span>
          {user?.updatedAt && (
            <span>
              Last modified {formatTimeAgo(user.updatedAt)} (
              {formatDateTime(user.updatedAt, user?.timezone ?? undefined)})
            </span>
          )}
        </div>

        {/* Footer actions — appears when pending dirty state */}
        {isDirty && (
          <div className="border-border flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              disabled={isSaving}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Discard changes
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={amountInvalid}
              leftIcon={<Sparkles size={14} />}
            >
              Save Notification Settings
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
export default NotificationsTab;
