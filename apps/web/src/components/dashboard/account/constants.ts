import { Bell, LucideIcon, ShieldCheck, SlidersHorizontal, User as UserIcon } from 'lucide-react';

export interface UserSettingsTab {
  key: 'profile' | 'account-security' | 'notification' | 'preferences';
  label: string;
  icon?: LucideIcon;
  description?: string;
}

export const TABS: UserSettingsTab[] = [
  {
    key: 'profile',
    label: 'Profile',
    icon: UserIcon,
    description: 'Personal details, avatar, and contact information',
  },
  {
    key: 'account-security',
    label: 'Account & Security',
    icon: ShieldCheck,
    description: 'Password, active device sessions, and account protection',
  },
  {
    key: 'notification',
    label: 'Notifications',
    icon: Bell,
    description: 'Email alerts, budget warnings, and security updates',
  },
  {
    key: 'preferences',
    label: 'Preferences',
    icon: SlidersHorizontal,
    description: 'Theme appearance, default currency, and regional format',
  },
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) — Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) — US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) — Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) — British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD ($) — Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', label: 'AUD ($) — Australian Dollar' },
  { code: 'SGD', symbol: 'SG$', label: 'SGD ($) — Singapore Dollar' },
  { code: 'AED', symbol: 'AED', label: 'AED (د.إ) — UAE Dirham' },
] as const;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other / Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT, UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT, UTC-8/-7)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT, UTC-6/-5)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST, UTC+1/+2)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT, UTC+10/+11)' },
] as const;
