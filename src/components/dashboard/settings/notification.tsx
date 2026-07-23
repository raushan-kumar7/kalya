/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Mail,
  AlertTriangle,
  ArrowLeftRight,
  CalendarClock,
  Lightbulb,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  InputGroup,
  Input,
  Button,
  Switch,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { appEvents } from "@/utils/events";

/* ============================================================
   Notification — Kalya design system
   ------------------------------------------------------------
   Five settings, grouped by what they're actually for rather than
   left as a flat list: how you're kept informed by email on a
   schedule, what gets flagged as it happens, and what Kalya
   surfaces on its own.

   Each alert's extra configuration (threshold, amount, channel)
   only appears once that alert is switched on — a "large
   transaction alert" with no amount set yet isn't a real setting,
   it's a half-finished one, so there's nothing to configure until
   there's something to configure.

   Colors are all semantic tokens (bg-primary-subtle, text-danger,
   border-border, ...), which are re-pointed per [data-theme="dark"]
   in globals.css, so light/dark falls out of the design system
   rather than needing separate handling here.

   NOTE: settings persist to local component state for now. Wire
   `handleSave` to your notification-preferences mutation the same
   way `useUser().updatePreferences` is wired in Preferences.tsx —
   left as local state here since no such hook exists yet.
   ============================================================ */

type Frequency = "off" | "weekly" | "monthly";
type Channels = { email: boolean; inApp: boolean };

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
  expenseReportFrequency: "monthly",
  budgetThresholdEnabled: true,
  budgetThresholdPercent: "90",
  budgetThresholdChannels: { email: true, inApp: true },
  largeTransactionEnabled: true,
  largeTransactionAmount: "10000",
  largeTransactionChannels: { email: true, inApp: true },
  weeklyDigestEnabled: true,
  smartInsightsEnabled: true,
};

/* ---------- shared row pieces ---------- */

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
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange({ ...channels, email: !channels.email })}
        aria-pressed={channels.email}
        title="Email"
        aria-label="Toggle email notifications"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
          channels.email
            ? "border-primary/30 bg-primary-subtle text-primary"
            : "border-border text-text-muted hover:text-text-primary"
        )}
      >
        <Mail className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange({ ...channels, inApp: !channels.inApp })}
        aria-pressed={channels.inApp}
        title="In-app"
        aria-label="Toggle in-app notifications"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
          channels.inApp
            ? "border-primary/30 bg-primary-subtle text-primary"
            : "border-border text-text-muted hover:text-text-primary"
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
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="overflow-hidden"
      >
        <div className="border-border bg-surface-raised mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
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

export function Notification() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(saved);

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
      // TODO: replace with a real mutation, e.g.
      // await updateNotificationSettings(settings);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaved(settings);
      appEvents.emit("toast:show", {
        variant: "success",
        title: "Notification settings saved",
      });
    } catch (err) {
      appEvents.emit("toast:show", {
        variant: "error",
        title: "Could not save notification settings",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-6 p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-border flex flex-col gap-1.5 border-b pb-5">
          <h2 className="text-text-primary font-display text-body-lg flex items-center gap-2 font-semibold">
            <Bell className="text-accent h-4.5 w-4.5" />
            Notifications
          </h2>
          <p className="text-text-secondary text-body-sm">
            Choose what Kalya tells you about, and how — nothing here is on by default that you didn't
            ask for.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* ---------- Email Reports ---------- */}
          <div className="flex flex-col gap-4">
            <SectionHeader icon={Mail} title="Email Reports" />

            <div className="flex items-start gap-3">
              <RowIcon icon={Mail} />
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-primary text-body-sm font-medium">Expense report</span>
                  <p className="text-text-secondary text-caption">
                    A summary of your income and expenses, delivered by email.
                  </p>
                </div>
                <Select
                  value={settings.expenseReportFrequency}
                  onValueChange={(v) => update("expenseReportFrequency", v as Frequency)}
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

          {/* ---------- Spending Alerts ---------- */}
          <div className="flex flex-col gap-4">
            <SectionHeader icon={AlertTriangle} title="Spending Alerts" />

            <div className="border-border flex flex-col divide-y">
              {/* Budget threshold */}
              <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <RowIcon icon={AlertTriangle} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text-primary text-body-sm font-medium">
                      Budget threshold alerts
                    </span>
                    <Switch
                      checked={settings.budgetThresholdEnabled}
                      onCheckedChange={(v) => update("budgetThresholdEnabled", v)}
                      aria-label="Toggle budget threshold alerts"
                    />
                  </div>
                  <p className="text-text-secondary text-caption">
                    Get notified when a category crosses a spending threshold you set.
                  </p>

                  {settings.budgetThresholdEnabled && (
                    <DetailPanel>
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted text-caption">Alert me at</span>
                        <Select
                          value={settings.budgetThresholdPercent}
                          onValueChange={(v) => update("budgetThresholdPercent", v)}
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
                        <span className="text-text-muted text-caption">of a category's budget</span>
                      </div>
                      <ChannelToggle
                        channels={settings.budgetThresholdChannels}
                        onChange={(c) => update("budgetThresholdChannels", c)}
                      />
                    </DetailPanel>
                  )}
                </div>
              </div>

              {/* Large transaction */}
              <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <RowIcon icon={ArrowLeftRight} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text-primary text-body-sm font-medium">
                      Large transaction alerts
                    </span>
                    <Switch
                      checked={settings.largeTransactionEnabled}
                      onCheckedChange={(v) => update("largeTransactionEnabled", v)}
                      aria-label="Toggle large transaction alerts"
                    />
                  </div>
                  <p className="text-text-secondary text-caption">
                    Get notified the moment a single transaction crosses an amount you choose.
                  </p>

                  {settings.largeTransactionEnabled && (
                    <DetailPanel>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted text-caption">Alert me above</span>
                          <InputGroup prefix="₹" className="w-36">
                            <Input
                              type="number"
                              min={1}
                              value={settings.largeTransactionAmount}
                              onChange={(e) => update("largeTransactionAmount", e.target.value)}
                              className="h-8 text-body-sm"
                            />
                          </InputGroup>
                        </div>
                        {amountInvalid && (
                          <span className="text-danger text-caption">Enter an amount above 0.</span>
                        )}
                      </div>
                      <ChannelToggle
                        channels={settings.largeTransactionChannels}
                        onChange={(c) => update("largeTransactionChannels", c)}
                      />
                    </DetailPanel>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Digest & Insights ---------- */}
          <div className="flex flex-col gap-4">
            <SectionHeader icon={Lightbulb} title="Digest & Insights" />

            <div className="border-border flex flex-col divide-y">
              <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <RowIcon icon={CalendarClock} />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-primary text-body-sm font-medium">Weekly digest</span>
                    <p className="text-text-secondary text-caption">
                      Every Monday: how your net worth moved and where most of last week went.
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigestEnabled}
                    onCheckedChange={(v) => update("weeklyDigestEnabled", v)}
                    aria-label="Toggle weekly digest"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <RowIcon icon={Lightbulb} />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-primary text-body-sm font-medium">Smart insights</span>
                    <p className="text-text-secondary text-caption">
                      New recurring charges, unusual spending, and saving opportunities — surfaced on
                      your dashboard as they're found.
                    </p>
                  </div>
                  <Switch
                    checked={settings.smartInsightsEnabled}
                    onCheckedChange={(v) => update("smartInsightsEnabled", v)}
                    aria-label="Toggle smart insights"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions — mirrors Preferences.tsx: only appear once
            there's something to save. */}
        {isDirty && (
          <div className="border-border flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={handleDiscard} disabled={isSaving}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Discard changes
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={amountInvalid}
            >
              Save notification settings
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}