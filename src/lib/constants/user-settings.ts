import { User, ShieldCheck, Tags, Bell, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { USER_SECTIONS, type UserSection } from "@/types/auth";

export interface SettingsNavItem {
  key: UserSection;
  label: string;
  icon?: LucideIcon;
}

export const settings: SettingsNavItem[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "account-security", label: "Account & Security", icon: ShieldCheck },
  { key: "categories-budgets", label: "Categories & Budgets", icon: Tags },
  { key: "notification", label: "Notification", icon: Bell },
  { key: "preferences", label: "Preferences", icon: SlidersHorizontal }, // Currency, Region, Appearance, Language
];

// Re-exported so anything already importing the old names keeps working.
export { USER_SECTIONS as SETTINGS_SECTIONS };
export type { UserSection as SettingsSection };
