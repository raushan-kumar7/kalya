"use client";

import { User } from "@/types/auth";
import { SettingsGroup, SettingsRow } from "./settings-row";
import { useState } from "react";
import {
  AtSign,
  KeyRound,
  Mail,
  MonitorSmartphone,
  ShieldAlert,
  Trash2,
  UserCog,
  UserRound,
} from "lucide-react";
import {
  DeleteAccountModal,
  EmailUpdateModal,
  ProfileUpdateModal,
  UsernameUpdateModal,
  SessionsDrawer,
  ChangePasswordModal,
} from "./modals";
import { useSessions } from "@/hooks/sessions";

type ActiveModal = "profile" | "username" | "email" | "password" | "delete" | null;

interface AccountSecurityProps {
  user: User;
}

export function AccountSecurity({ user }: AccountSecurityProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  // Same query key as SessionsDrawer's useSessions() — react-query shares
  // the cache, so this is just reading state, not a duplicate fetch. It's
  // gated on the current user inside the hook itself.
  const { sessions } = useSessions();

  const close = () => setActiveModal(null);
  const otherSessionsCount = sessions.filter((s) => !s.current).length;

  return (
    <section className="">
      <SettingsGroup
        icon={<UserCog size={18} />}
        title="Account"
        description="Personal details tied to your profile."
      >
        <SettingsRow
          icon={<UserRound size={18} />}
          title="Profile"
          description={user?.name ?? "Add your name and details"}
          actionLabel="Edit"
          onAction={() => setActiveModal("profile")}
        />
        <SettingsRow
          icon={<AtSign size={18} />}
          title="Username"
          description={user?.username ? `@${user?.username}` : "Not set"}
          actionLabel="Change"
          onAction={() => setActiveModal("username")}
        />
        <SettingsRow
          icon={<Mail size={18} />}
          title="Email address"
          description={user?.email ?? "Not set"}
          actionLabel="Change"
          onAction={() => setActiveModal("email")}
        />
      </SettingsGroup>

      <SettingsGroup
        icon={<ShieldAlert size={18} />}
        title="Security"
        description="Manage how you sign in and stay protected."
        className="mt-3"
      >
        <SettingsRow
          icon={<KeyRound size={18} />}
          title="Password"
          description="Change your password"
          actionLabel="Change password"
          onAction={() => setActiveModal("password")}
        />
        <SettingsRow
          icon={<MonitorSmartphone size={18} />}
          title="Active sessions"
          description={
            otherSessionsCount > 0
              ? `${sessions.length} devices signed in`
              : "Only this device is signed in"
          }
          actionLabel="Manage"
          onAction={() => setSessionsOpen(true)}
        />
      </SettingsGroup>

      <SettingsGroup
        title="Danger zone"
        description="Irreversible actions. Proceed with caution."
        tone="danger"
        className="mt-3"
      >
        <SettingsRow
          icon={<Trash2 size={18} />}
          title="Delete account"
          description="Permanently remove your account and all associated data."
          actionLabel="Delete account"
          actionVariant="danger"
          tone="danger"
          onAction={() => setActiveModal("delete")}
        />
      </SettingsGroup>

      <ProfileUpdateModal
        open={activeModal === "profile"}
        onOpenChange={(o) => !o && close()}
        user={user}
      />
      <UsernameUpdateModal
        open={activeModal === "username"}
        onOpenChange={(o) => !o && close()}
        currentUsername={user?.username}
      />
      <EmailUpdateModal
        open={activeModal === "email"}
        onOpenChange={(o) => !o && close()}
        currentEmail={user?.email}
      />
      <ChangePasswordModal open={activeModal === "password"} onOpenChange={(o) => !o && close()} />
      <DeleteAccountModal open={activeModal === "delete"} onOpenChange={(o) => !o && close()} />
      <SessionsDrawer open={sessionsOpen} onOpenChange={setSessionsOpen} />
    </section>
  );
}
