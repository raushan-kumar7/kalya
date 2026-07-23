/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Mail,
  AtSign,
  User as UserIcon,
  Calendar,
  Phone,
  Globe,
  Hash,
  Clock3,
  Wallet,
  RefreshCw,
  Fingerprint,
  CheckCircle2,
  XCircle,
  VenetianMask,
  History,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, ReadOnlyField } from "@/components/ui";
import { formatDateTime, formatCalendarDateOrDash } from "@/utils";
import type { User } from "@/types/auth";
import { UserAvatar } from "@/components/users";

export interface ProfileProps {
  user: User;
}

/* ============================================================
   Config
   ------------------------------------------------------------
   Every section declares its own `columns`. That number is used
   for BOTH the grouped rows (e.g. "Name") and the plain rows in
   that section, so a group of 2 fields and a row of 3 fields
   inside the same section always share the same column grid and
   line up edge-to-edge — that's what was causing the ragged
   alignment before (groups were hardcoded to 3 columns while
   plain rows used 2, regardless of how many fields were in each).
   ============================================================ */

type ConfigField = {
  key: string;
  label: string;
  value: any;
  icon?: LucideIcon;
  copyable?: boolean;
  mask?: boolean;
};
type ConfigGroup = { label?: string; fields: ConfigField[] };
type ConfigItem = ConfigField | { group: ConfigGroup[] };
type ConfigSection = { title: string; icon: LucideIcon; columns: 2 | 3; fields: ConfigItem[] };

const CORE_HEADER_FIELDS = ["name", "email", "username", "image"];

export function Profile({ user }: ProfileProps) {
  const PF_USR_SC: ConfigSection[] = [
    {
      title: "Personal Details",
      icon: UserIcon,
      columns: 3,
      fields: [
        {
          group: [
            {
              label: "Name",
              fields: [
                { key: "first_name", label: "First Name", value: user?.first_name, icon: UserIcon },
                { key: "middle_name", label: "Middle Name", value: user?.middle_name, icon: UserIcon },
                { key: "last_name", label: "Last Name", value: user?.last_name, icon: UserIcon },
              ],
            },
          ],
        },
        { key: "gender", label: "Gender", value: user?.gender, icon: VenetianMask },
        { key: "date_of_birth", label: "Date of Birth", value: user?.date_of_birth, icon: Calendar },
      ],
    },
    {
      title: "Contact Information",
      icon: Mail,
      columns: 2,
      fields: [
        { key: "email", label: "Email Address", value: user?.email, icon: Mail, copyable: true },
        { key: "phone", label: "Phone Number", value: user?.phone, icon: Phone, copyable: true },
      ],
    },
    {
      title: "Account",
      icon: Fingerprint,
      columns: 2,
      fields: [
        {
          group: [
            {
              label: "Identity",
              fields: [
                { key: "username", label: "Username", value: user?.username, icon: AtSign, copyable: true },
                {
                  key: "displayUsername",
                  label: "Display Name",
                  value: user?.displayUsername,
                  icon: AtSign,
                },
              ],
            },
          ],
        },
        {
          key: "id",
          label: "Account ID",
          value: user?.id,
          icon: Hash,
          copyable: true,
          mask: true,
        },
        { key: "emailVerified", label: "Email Verified", value: user?.emailVerified },
        { key: "sync_status", label: "Sync Status", value: user?.sync_status },
      ],
    },
    {
      title: "Preferences",
      icon: Globe,
      columns: 3,
      fields: [
        {
          group: [
            {
              label: "Regional Settings",
              fields: [
                { key: "timezone", label: "Timezone", value: user?.timezone || "Not set", icon: Clock3 },
                { key: "locale", label: "Locale", value: user?.locale || "Not set", icon: Globe },
                { key: "currency", label: "Currency", value: user?.currency || "Not set", icon: Wallet },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Activity",
      icon: History,
      columns: 2,
      fields: [
        { key: "created_at", label: "Created At", value: user?.createdAt, icon: Clock3 },
        { key: "updated_at", label: "Updated At", value: user?.updatedAt, icon: Clock3 },
      ],
    },
  ];

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined || value === "") return "—";

    if (key === "date_of_birth") return formatCalendarDateOrDash(value);

    if (
      key === "created_at" ||
      key === "updated_at" ||
      value instanceof Date ||
      (typeof value === "string" && !isNaN(Date.parse(value)) && /GMT|T\d{2}:\d{2}/.test(value))
    ) {
      return formatDateTime(value, user?.timezone || undefined);
    }

    if (typeof value === "boolean") return value ? "Verified" : "Not Verified";

    return String(value);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Dynamically collect every explicitly mapped key so new/unknown fields
  // coming back from the API still surface somewhere instead of vanishing.
  const knownKeys = new Set<string>([...CORE_HEADER_FIELDS]);
  PF_USR_SC.forEach((section) => {
    section.fields.forEach((item) => {
      if ("group" in item) {
        item.group.forEach((g) => g.fields.forEach((f) => knownKeys.add(f.key)));
      } else {
        knownKeys.add(item.key);
      }
    });
  });
  // const extraFields = Object.keys(user || {}).filter((k) => !knownKeys.has(k));

  const renderField = (field: ConfigField) => {
    const { key, label, value, icon: Icon } = field;

    // Boolean flags render as a status pill, not a text box — a "yes/no"
    // fact is faster to scan as a pill than as a word inside an input shape.
    if (typeof value === "boolean") {
      const verified = value;
      return (
        <div key={key} className="flex flex-col gap-1.5 mt-3.5">
          <span className="text-text-muted text-caption flex items-center gap-1.5 font-medium tracking-wide uppercase">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
          </span>
          <span
            className={`text-body-sm inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
              verified ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
            }`}
          >
            {verified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {verified ? "Verified" : "Not Verified"}
          </span>
        </div>
      );
    }

    if (key === "sync_status") {
      const stringValue = String(value ?? "").toUpperCase();
      const synced = stringValue === "SYNCED";
      return (
        <div key={key} className="flex flex-col gap-1.5">
          <span className="text-text-muted text-caption flex items-center gap-1.5 font-medium tracking-wide uppercase">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
          </span>
          <span
            className={`text-body-sm inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
              synced ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {stringValue || "—"}
          </span>
        </div>
      );
    }

    return (
      <ReadOnlyField
        key={key}
        label={label}
        value={formatValue(key, value)}
        icon={Icon}
        copyable={field.copyable}
        mask={field.mask}
      />
    );
  };

  /**
   * Renders a section's fields, sharing `columns` across grouped rows and
   * plain rows alike so column edges always line up within a section.
   */
  const renderSectionFields = (fields: ConfigItem[], columns: 2 | 3) => {
    const elements: React.ReactNode[] = [];
    let currentUngrouped: ConfigField[] = [];
    const colClass = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

    const flushUngrouped = () => {
      if (currentUngrouped.length > 0) {
        elements.push(
          <div key={`ungrouped-${elements.length}`} className={`grid grid-cols-1 gap-x-8 gap-y-5 ${colClass}`}>
            {currentUngrouped.map(renderField)}
          </div>
        );
        currentUngrouped = [];
      }
    };

    fields.forEach((item) => {
      if ("group" in item) {
        flushUngrouped();
        elements.push(
          <div key={`grouped-${elements.length}`} className="flex flex-col gap-4">
            {item.group.map((g, gIdx) => (
              <div key={gIdx} className="flex flex-col gap-2.5">
                {g.label && (
                  <span className="text-text-muted text-caption font-medium tracking-wide uppercase">
                    {g.label}
                  </span>
                )}
                <div className={`grid grid-cols-1 gap-x-8 gap-y-5 ${colClass}`}>{g.fields.map(renderField)}</div>
              </div>
            ))}
          </div>
        );
      } else {
        currentUngrouped.push(item);
      }
    });

    flushUngrouped();
    return <div className="flex flex-col gap-6">{elements}</div>;
  };

  return (
    <Card className="mb-5 p-6">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="border-border flex flex-col items-start gap-5 border-b pb-6 sm:flex-row sm:items-center">
          <UserAvatar url={user?.image ?? "/public/user.jpg"} alt={user?.name ?? "User"} fallback={initials} />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-text-primary font-display text-display-md truncate font-bold tracking-tight">
              {user?.name || "—"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-text-secondary text-body-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user?.email || "—"}</span>
              </p>
              {user?.username && (
                <>
                  <span className="bg-border hidden h-1 w-1 shrink-0 rounded-full sm:block" />
                  <p className="text-text-secondary text-body-sm flex items-center gap-1.5">
                    <AtSign className="h-3.5 w-3.5 shrink-0" />
                    {user.username}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {PF_USR_SC.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.title} className="flex flex-col gap-5">
                <h2 className="border-accent text-text-primary text-body-md flex items-center gap-2 border-l-2 pl-2.5 font-semibold">
                  <SectionIcon className="text-accent h-4 w-4" />
                  {section.title}
                </h2>
                {renderSectionFields(section.fields, section.columns)}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}