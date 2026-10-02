'use client';

import * as React from 'react';
import {
  Check,
  Clock3,
  Globe,
  Laptop,
  Moon,
  Paintbrush,
  RotateCcw,
  Sparkles,
  Sun,
  WandSparkles,
} from 'lucide-react';
import type { User } from '@kalya/types';
import { formatCardDate, formatDateTime, formatTime, Temporal } from '@kalya/utils';
import { useUser } from '@/hooks/users';
import { useTheme } from '@/components/ui/utilities';
import {
  Button,
  Card,
  Combobox,
  Field,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@/components/ui';
import { cn } from '@/libs/utils';

export interface PreferencesTabProps {
  user: User | null;
}

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT, UTC-5/-4)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT, UTC-6/-5)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT, UTC-7/-6)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT, UTC-8/-7)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (BRT, UTC-3)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST, UTC+1/+2)' },
  { value: 'Europe/Athens', label: 'Europe/Athens (EET/EEST, UTC+2/+3)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK, UTC+3)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4:00)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT, UTC+5:00)' },
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (NPT, UTC+5:45)' },
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (BST, UTC+6:00)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (ICT, UTC+7:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT, UTC+10/+11)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT, UTC+12/+13)' },
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (HST, UTC-10)' },
];

export const LOCALE_OPTIONS = [
  { value: 'en-IN', label: 'English (India) — ₹ Lakhs / Crores' },
  { value: 'en-US', label: 'English (United States) — $ Millions / Billions' },
  { value: 'en-GB', label: 'English (United Kingdom) — £ Millions' },
  { value: 'hi-IN', label: 'Hindi (India) — ₹ लाख / करोड़' },
  { value: 'en-AU', label: 'English (Australia) — A$ Millions' },
  { value: 'en-CA', label: 'English (Canada) — C$ Millions' },
  { value: 'de-DE', label: 'German (Germany) — € Millionen' },
  { value: 'fr-FR', label: 'French (France) — € Millions' },
  { value: 'ar-AE', label: 'Arabic (UAE) — د.إ' },
  { value: 'ja-JP', label: 'Japanese (Japan) — ¥ 万 / 億' },
];

export const CURRENCY_OPTIONS = [
  { value: 'INR', symbol: '₹', label: 'INR (₹) — Indian Rupee' },
  { value: 'USD', symbol: '$', label: 'USD ($) — US Dollar' },
  { value: 'EUR', symbol: '€', label: 'EUR (€) — Euro' },
  { value: 'GBP', symbol: '£', label: 'GBP (£) — British Pound' },
  { value: 'AED', symbol: 'د.إ', label: 'AED (د.إ) — UAE Dirham' },
  { value: 'SGD', symbol: 'S$', label: 'SGD (S$) — Singapore Dollar' },
  { value: 'AUD', symbol: 'A$', label: 'AUD (A$) — Australian Dollar' },
  { value: 'CAD', symbol: 'C$', label: 'CAD (C$) — Canadian Dollar' },
  { value: 'JPY', symbol: '¥', label: 'JPY (¥) — Japanese Yen' },
];

export function PreferencesTab({ user }: PreferencesTabProps) {
  const { updateProfile } = useUser();
  const { theme, setTheme } = useTheme();

  const initialSettings = React.useMemo(
    () => ({
      currency: user?.currency || 'INR',
      timezone: user?.timezone || 'Asia/Kolkata',
      locale: user?.locale || 'en-IN',
    }),
    [user]
  );

  const [settings, setSettings] = React.useState(initialSettings);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const isDirty =
    settings.currency !== initialSettings.currency ||
    settings.timezone !== initialSettings.timezone ||
    settings.locale !== initialSettings.locale;

  // Real-time formatting preview using @kalya/utils
  const preview = React.useMemo(() => {
    const fallback = {
      dateTime: '—',
      time: '—',
      calendarDate: '—',
      number: '—',
      currency: '—',
    };
    try {
      const now = Temporal.Now.instant();
      const dateTime = formatDateTime(now, settings.timezone);
      const time = formatTime(now, settings.timezone);
      const plainDate = Temporal.Now.plainDateISO();
      const calendarDate = formatCardDate(plainDate);

      const number = new Intl.NumberFormat(settings.locale || 'en-IN').format(1234567.89);

      const amount = new Intl.NumberFormat(settings.locale || 'en-IN', {
        style: 'currency',
        currency: settings.currency || 'INR',
        maximumFractionDigits: 2,
      }).format(48259.5);

      return { dateTime, time, calendarDate, number, currency: amount };
    } catch {
      return fallback;
    }
  }, [settings.locale, settings.timezone, settings.currency]);

  // Current live clock in selected timezone
  const currentTimeLabel = React.useMemo(() => {
    try {
      return formatTime(Temporal.Now.instant(), settings.timezone);
    } catch {
      return '—';
    }
  }, [settings.timezone]);

  const detectFromDevice = () => {
    try {
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const deviceLocale = navigator.language;

      const matchedTz = TIMEZONE_OPTIONS.find((t) => t.value === deviceTimezone);
      const matchedLocale = LOCALE_OPTIONS.find(
        (l) => l.value.toLowerCase() === deviceLocale.toLowerCase()
      );

      setSettings((prev) => ({
        ...prev,
        timezone: matchedTz ? matchedTz.value : deviceTimezone || prev.timezone,
        locale: matchedLocale ? matchedLocale.value : prev.locale,
      }));

      toast.success('Regional settings detected from your device');
    } catch {
      toast.error('Unable to auto-detect device settings');
    }
  };

  const handleDiscard = () => {
    setSettings(initialSettings);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        currency: settings.currency,
        timezone: settings.timezone,
        locale: settings.locale,
      });
      toast.success('Preferences saved successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save preferences.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const themeOptions = [
    {
      id: 'system' as const,
      label: 'System Sync',
      description: 'Matches your OS dark/light mode automatically',
      icon: Laptop,
    },
    {
      id: 'light' as const,
      label: 'Light Modern',
      description: 'High contrast crisp surface with evergreen accents',
      icon: Sun,
    },
    {
      id: 'dark' as const,
      label: 'Obsidian Dark',
      description: 'Deep midnight surface optimized for low light',
      icon: Moon,
    },
  ];

  return (
    <Card className="mb-10 p-6 shadow-card">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-border flex flex-col gap-1.5 border-b pb-5">
          <h2 className="text-text-primary font-display text-body-lg flex items-center gap-2 font-semibold">
            <Globe className="text-accent h-4.5 w-4.5" />
            Preferences & Regional Format
          </h2>
          <p className="text-text-secondary text-body-sm">
            Configure how numbers, dates, and currencies are presented across Kalya — this does not
            alter your financial records, only how they appear to you.
          </p>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 1. Theme Appearance Selection                                */}
        {/* ------------------------------------------------------------ */}
        <div className="flex flex-col gap-4">
          <h2 className="border-accent text-text-primary text-body-md flex items-center gap-2 border-l-2 pl-2.5 font-semibold">
            <Paintbrush className="text-accent h-4 w-4" />
            Appearance & Theme
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={cn(
                    'relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary-subtle/50 ring-2 ring-primary/20 shadow-sm'
                      : 'border-border bg-surface hover:border-border/80 hover:bg-surface-raised'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-raised text-text-secondary'
                      )}
                    >
                      <Icon size={18} />
                    </div>

                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-body-sm font-semibold text-text-primary">{opt.label}</h3>
                    <p className="text-caption text-text-muted mt-0.5">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 2. Regional & Financial Localization                         */}
        {/* ------------------------------------------------------------ */}
        <form onSubmit={handleSave} className="flex flex-col gap-6 pt-2">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="border-accent text-text-primary text-body-md flex items-center gap-2 border-l-2 pl-2.5 font-semibold">
                <Globe className="text-accent h-4 w-4" />
                Regional Settings
              </h2>

              <button
                type="button"
                onClick={detectFromDevice}
                className="text-accent hover:text-text-primary text-body-sm inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <WandSparkles className="h-3.5 w-3.5" />
                Detect from this device
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
              <Field
                label="Account Timezone"
                description={`Current local time: ${currentTimeLabel} • Governs daily cutoff & recurring cycles.`}
              >
                <Combobox
                  options={TIMEZONE_OPTIONS}
                  value={settings.timezone}
                  onChange={(val) => setSettings((s) => ({ ...s, timezone: val }))}
                  placeholder="Select timezone"
                  searchPlaceholder="Search timezones..."
                />
              </Field>

              <Field
                label="Regional Locale"
                description="Number grouping and date formatting standard."
              >
                <Select
                  value={settings.locale}
                  onValueChange={(val) => setSettings((s) => ({ ...s, locale: val }))}
                >
                  <SelectTrigger className="w-full text-body-sm">
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label="Base Currency"
                description="Primary monetary denomination across reports."
              >
                <Select
                  value={settings.currency}
                  onValueChange={(val) => setSettings((s) => ({ ...s, currency: val }))}
                >
                  <SelectTrigger className="w-full text-body-sm">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* 3. Live Preview Card                                         */}
          {/* ------------------------------------------------------------ */}
          <div className="border-border bg-surface-raised/70 flex flex-col gap-4 rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-caption flex items-center gap-1.5 font-medium tracking-wide uppercase">
                <Clock3 className="h-3.5 w-3.5 text-accent" />
                Live Localization Preview
              </span>
              <span className="text-caption text-text-muted">
                Timezone: <code className="font-mono text-text-secondary">{settings.timezone}</code>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-caption">Date & Time</span>
                <span className="text-text-primary text-body-sm font-medium">
                  {preview.dateTime}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-caption">Calendar Date</span>
                <span className="text-text-primary text-body-sm font-medium">
                  {preview.calendarDate}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-caption">Number Formatting</span>
                <span className="text-text-primary font-numeric text-body-sm font-medium">
                  {preview.number}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-caption">Currency Formatting</span>
                <span className="text-primary font-numeric text-body-sm font-semibold">
                  {preview.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Footer actions — only appear when values are dirty */}
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
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Sparkles size={14} />}
              >
                Save Preferences
              </Button>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
}
