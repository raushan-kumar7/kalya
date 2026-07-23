/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3, Globe, RotateCcw, WandSparkles } from "lucide-react";
import {
  Card,
  Field,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Combobox,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui";
import { useUser } from "@/hooks/users";
import { useAuth } from "@/hooks/auth";
import { PreferencesSchema, type PreferencesInput } from "@/validations/users";

const TIMEZONE_OPTIONS = [
  { value: "Pacific/Midway", label: "(GMT-11:00) Midway Island" },
  { value: "Pacific/Honolulu", label: "(GMT-10:00) Hawaii" },
  { value: "America/Anchorage", label: "(GMT-09:00) Alaska" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time — US & Canada" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time — US & Canada" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time — US & Canada" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time — US & Canada" },
  { value: "America/Sao_Paulo", label: "(GMT-03:00) Brasilia" },
  { value: "Atlantic/Azores", label: "(GMT-01:00) Azores" },
  { value: "Europe/London", label: "(GMT+00:00) London, Dublin" },
  { value: "Europe/Paris", label: "(GMT+01:00) Paris, Berlin, Madrid" },
  { value: "Europe/Athens", label: "(GMT+02:00) Athens, Cairo" },
  { value: "Europe/Moscow", label: "(GMT+03:00) Moscow, Nairobi" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Dubai, Abu Dhabi" },
  { value: "Asia/Karachi", label: "(GMT+05:00) Karachi, Tashkent" },
  { value: "Asia/Kolkata", label: "(GMT+05:30) India Standard Time" },
  { value: "Asia/Kathmandu", label: "(GMT+05:45) Kathmandu" },
  { value: "Asia/Dhaka", label: "(GMT+06:00) Dhaka" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok, Jakarta" },
  { value: "Asia/Shanghai", label: "(GMT+08:00) Singapore, Hong Kong, Beijing" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo, Seoul" },
  { value: "Australia/Sydney", label: "(GMT+10:00) Sydney, Melbourne" },
  { value: "Pacific/Auckland", label: "(GMT+12:00) Auckland, Fiji" },
] as const;

const LOCALE_OPTIONS = [
  { value: "en-IN", label: "English (India)" },
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "hi-IN", label: "Hindi (India)" },
  { value: "en-AU", label: "English (Australia)" },
  { value: "en-CA", label: "English (Canada)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "ar-AE", label: "Arabic (UAE)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
] as const;

const CURRENCY_OPTIONS = [
  { value: "INR", symbol: "₹", label: "Indian Rupee" },
  { value: "USD", symbol: "$", label: "US Dollar" },
  { value: "EUR", symbol: "€", label: "Euro" },
  { value: "GBP", symbol: "£", label: "British Pound" },
  { value: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { value: "SGD", symbol: "S$", label: "Singapore Dollar" },
  { value: "AUD", symbol: "A$", label: "Australian Dollar" },
  { value: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { value: "JPY", symbol: "¥", label: "Japanese Yen" },
] as const;

const DEFAULTS: PreferencesInput = {
  timezone: "Asia/Kolkata",
  locale: "en-IN",
  currency: "INR",
};

export function Preferences() {
  const { user } = useAuth();
  const { updatePreferences, isSavingPreferences, savePreferencesError } = useUser();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, errors },
  } = useForm<PreferencesInput>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      timezone: user?.timezone || DEFAULTS.timezone,
      locale: user?.locale || DEFAULTS.locale,
      currency: user?.currency || DEFAULTS.currency,
    },
  });

  // Keep the form in sync if the session's preferences change from outside
  // this form (e.g. SessionSync refetching after another tab saves).
  useEffect(() => {
    if (!user) return;
    reset({
      timezone: user.timezone || DEFAULTS.timezone,
      locale: user.locale || DEFAULTS.locale,
      currency: user.currency || DEFAULTS.currency,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.timezone, user?.locale, user?.currency]);

  // useWatch (not methods.watch()) — watch() is a function returned from
  // useForm() that closes over internal state, which React Compiler can't
  // memoize safely and will skip optimizing around. useWatch is a real
  // hook with its own subscription, so it composes correctly.
  const timezone = useWatch({ control, name: "timezone" });
  const locale = useWatch({ control, name: "locale" });
  const currency = useWatch({ control, name: "currency" });

  const preview = useMemo(() => {
    const fallback = { date: "—", number: "—", currency: "—" };
    try {
      const now = new Date();
      const date = new Intl.DateTimeFormat(locale || "en-IN", {
        timeZone: timezone || undefined,
        dateStyle: "full",
        timeStyle: "short",
      }).format(now);
      const number = new Intl.NumberFormat(locale || "en-IN").format(1234567.89);
      const amount = new Intl.NumberFormat(locale || "en-IN", {
        style: "currency",
        currency: currency || "INR",
        maximumFractionDigits: 2,
      }).format(48259.5);
      return { date, number, currency: amount };
    } catch {
      // An unsupported locale/currency combination — shouldn't happen since
      // both come from closed Select lists, but formatting APIs can still
      // throw on edge platforms, so fail soft rather than crash the form.
      return fallback;
    }
  }, [locale, timezone, currency]);

  const detectFromDevice = () => {
    try {
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (TIMEZONE_OPTIONS.some((t) => t.value === deviceTimezone)) {
        setValue("timezone", deviceTimezone, { shouldDirty: true });
      }
      const deviceLocale = navigator.language;
      const matchedLocale = LOCALE_OPTIONS.find(
        (l) => l.value.toLowerCase() === deviceLocale.toLowerCase()
      );
      if (matchedLocale) {
        setValue("locale", matchedLocale.value, { shouldDirty: true });
      }
    } catch {
      // Intl / navigator unavailable — silently no-op, field stays as-is.
    }
  };

  const onSubmit = async (data: PreferencesInput) => {
    await updatePreferences(data);
    reset(data);
  };

  return (
    <Card className="mb-6 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-border flex flex-col gap-1.5 border-b pb-5">
          <h2 className="text-text-primary font-display text-body-lg flex items-center gap-2 font-semibold">
            <Globe className="text-accent h-4.5 w-4.5" />
            Preferences
          </h2>
          <p className="text-text-secondary text-body-sm">
            Sets how dates, numbers, and amounts are displayed across Kalya — this doesn't change
            your data, only how it's shown to you.
          </p>
        </div>

        {savePreferencesError && (
          <Alert variant="danger">
            <AlertTitle>Couldn't save preferences</AlertTitle>
            <AlertDescription>{savePreferencesError}</AlertDescription>
          </Alert>
        )}

        {/* Form fields */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-text-muted text-caption font-medium tracking-wide uppercase">
              Regional Settings
            </span>
            <button
              type="button"
              onClick={detectFromDevice}
              className="text-accent hover:text-text-primary text-body-sm inline-flex items-center gap-1.5 font-medium transition-colors"
            >
              <WandSparkles className="h-3.5 w-3.5" />
              Detect from this device
            </button>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
            <Field label="Timezone" error={errors.timezone?.message}>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={TIMEZONE_OPTIONS as unknown as { value: string; label: string }[]}
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    placeholder="Select timezone"
                    searchPlaceholder="Search timezones..."
                  />
                )}
              />
            </Field>

            <Field label="Locale" error={errors.locale?.message}>
              <Controller
                name="locale"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
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
                )}
              />
            </Field>

            <Field label="Currency" error={errors.currency?.message}>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.symbol} {opt.value} — {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
        </div>

        {/* Live preview — the only place these three settings are otherwise
            visible is scattered across the rest of the app, so show the
            effect here directly rather than asking the user to save first
            and go look. */}
        <div className="border-border bg-surface-raised flex flex-col gap-4 rounded-xl border p-5">
          <span className="text-text-muted text-caption flex items-center gap-1.5 font-medium tracking-wide uppercase">
            <Clock3 className="h-3.5 w-3.5" />
            Preview
          </span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="text-text-muted text-caption">Date & time</span>
              <span className="text-text-primary text-body-sm font-medium">{preview.date}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-muted text-caption">Number</span>
              <span className="text-text-primary font-numeric text-body-sm font-medium">
                {preview.number}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-muted text-caption">Currency</span>
              <span className="text-primary font-numeric text-body-sm font-semibold">
                {preview.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions — only take up visual weight once there's
            something to act on. */}
        {isDirty && (
          <div className="border-border flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => reset()}
              disabled={isSavingPreferences}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Discard changes
            </Button>
            <Button type="submit" size="sm" isLoading={isSavingPreferences}>
              Save preferences
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
