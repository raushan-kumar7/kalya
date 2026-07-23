"use client";

import {  AccountSecurity, Notification, Preferences, Profile, SettingsNav } from "@/components/dashboard/settings";
import { useAppEvent, useHotkeys } from "@/hooks";
import { User, UserSection } from "@/types/auth";
import { appEvents } from "@/utils/events";
import { ComponentType, useState } from "react";
import { useAuth } from "@/hooks/auth";

/**
 * Placeholder panels — swap each for the real section component as it's
 * built. Kept as components (not strings) so `<ActiveSection />` below is a
 * valid JSX element type.
 */
function Placeholder({ title }: { title: string }) {
  return (
    <div className="border-border bg-surface text-text-secondary text-body-sm rounded-xl border p-6">
      {title} settings — coming soon.
    </div>
  );
}

// "g" then a letter — Gmail/Linear-style jump-to-section shortcuts.
const SECTION_HOTKEYS: Record<string, UserSection> = {
  "g p": "profile",
  "g a": "account-security",
  "g c": "categories-budgets",
  "g n": "notification",
  "g r": "preferences",
};

export function SettingsClient() {
  const { user } = useAuth();
  const [active, setActive] = useState<UserSection>("profile");

  const SECTION_COMPONENTS: Record<UserSection, ComponentType> = {
    profile: () => <Profile user={user as User} />,
    "account-security": () => <AccountSecurity user={user as User} />,
    "categories-budgets": () => <Placeholder title="Categories & Budgets" />,
    notification: () => <Notification/>,
    preferences: () => <Preferences/>,
  };

  const ActiveSection = SECTION_COMPONENTS[active];

  useHotkeys(
    Object.fromEntries(
      Object.entries(SECTION_HOTKEYS).map(([combo, section]) => [combo, () => setActive(section)])
    )
  );

  useAppEvent("auth:session-expired", () => {
    appEvents.emit("toast:show", {
      variant: "warning",
      title: "Your session expired",
      description: "Sign in again to keep editing your settings.",
    });
  });

  return (
    <div className="mt-4">
      <SettingsNav active={active} onSelect={setActive} />

      <div className="relative mt-6 overflow-hidden">
        <ActiveSection />
      </div>
    </div>
  );
}
