'use client';

import * as React from 'react';
import {
  AtSign,
  Calendar,
  Camera,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Hash,
  History,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  User as UserIcon,
  VenetianMask,
  XCircle,
} from 'lucide-react';
import type { User } from '@kalya/types';
import {
  formatCalendarDateOrDash,
  formatDateTime,
  formatTimeAgo,
  fromISO,
  Temporal,
} from '@kalya/utils';
import { useUser } from '@/hooks/users';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  Field,
  Input,
  ReadOnlyField,
} from '@/components/ui';
import { GENDERS } from './constants';

export interface ProfileTabProps {
  user: User | null;
}

export function ProfileTab({ user }: ProfileTabProps) {
  const { updateProfile, uploadAvatar, deleteAvatar } = useUser();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = React.useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form state
  const initialData = React.useMemo(
    () => ({
      first_name: user?.first_name ?? '',
      middle_name: user?.middle_name ?? '',
      last_name: user?.last_name ?? '',
      displayUsername: user?.displayUsername ?? user?.username ?? '',
      phone: user?.phone ?? '',
      gender: user?.gender ?? 'prefer_not_to_say',
      dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
    }),
    [user]
  );

  const [formData, setFormData] = React.useState(initialData);

  // Keep form data synced when user changes
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  // Dynamic age calculation & date validation via @kalya/utils
  const birthDateDescription = React.useMemo(() => {
    if (!formData.dateOfBirth) return 'Select your birth date';
    try {
      const formatted = formatCalendarDateOrDash(formData.dateOfBirth);
      const dob = fromISO(formData.dateOfBirth);
      if (!dob) return formatted;
      const today = Temporal.Now.plainDateISO();
      if (Temporal.PlainDate.compare(dob, today) > 0) {
        return `${formatted} (Invalid: future date)`;
      }
      const age = today.since(dob, { largestUnit: 'year' }).years;
      return `${formatted} • ${age} years old`;
    } catch {
      return formatCalendarDateOrDash(formData.dateOfBirth);
    }
  }, [formData.dateOfBirth]);

  const initials = React.useMemo(() => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return (user?.name || user?.username || 'U').slice(0, 2).toUpperCase();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadAvatar(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsDeletingAvatar(true);
      await deleteAvatar();
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || undefined,
        last_name: formData.last_name.trim(),
        displayUsername: formData.displayUsername.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        gender: formData.gender as any,
        dateOfBirth: formData.dateOfBirth || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimestamp = (dateInput?: string | Date | null) => {
    if (!dateInput) return '—';
    try {
      const formatted = formatDateTime(dateInput, user?.timezone ?? undefined);
      const relative = formatTimeAgo(dateInput);
      return `${formatted} (${relative})`;
    } catch {
      return String(dateInput);
    }
  };

  const syncStatus = String(user?.sync_status ?? 'SYNCED').toUpperCase();
  const isSynced = syncStatus === 'SYNCED';

  return (
    <Card className="mb-10 p-6 shadow-card">
      <div className="flex flex-col gap-8">
        {/* ------------------------------------------------------------ */}
        {/* Header Section                                               */}
        {/* ------------------------------------------------------------ */}
        <div className="border-border flex flex-col items-start gap-5 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar size="xl" className="ring-2 ring-primary/20 shadow-md h-18 w-18">
                {user?.image && <AvatarImage src={user.image} alt={user.name ?? 'Avatar'} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Upload overlay on hover */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Upload profile photo"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:pointer-events-none cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Camera size={20} />
                )}
              </button>
            </div>

            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-text-primary font-display text-body-lg sm:text-display-xs font-bold tracking-tight truncate">
                  {user?.name ||
                    `${formData.first_name} ${formData.last_name}`.trim() ||
                    'Kalya Member'}
                </h1>
                {user?.emailVerified ? (
                  <span className="text-caption inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium bg-success-subtle text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="text-caption inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium bg-danger-subtle text-danger">
                    <XCircle className="h-3.5 w-3.5" />
                    Unverified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-secondary text-body-sm">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  <span className="truncate">{user?.email || '—'}</span>
                </span>
                {user?.username && (
                  <>
                    <span className="bg-border hidden h-1 w-1 shrink-0 rounded-full sm:block" />
                    <span className="flex items-center gap-1.5">
                      <AtSign className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                      <span>{user.username}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Actions */}
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              leftIcon={
                isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />
              }
            >
              Change Photo
            </Button>

            {user?.image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDeleteAvatar}
                disabled={isDeletingAvatar}
                className="text-danger hover:bg-danger-subtle hover:text-danger"
                leftIcon={
                  isDeletingAvatar ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )
                }
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Form Body                                                    */}
        {/* ------------------------------------------------------------ */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Section 1: Personal Details */}
          <div className="flex flex-col gap-5">
            <h2 className="border-accent text-text-primary text-body-md flex items-center gap-2 border-l-2 pl-2.5 font-semibold">
              <UserIcon className="text-accent h-4 w-4" />
              Personal Details
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
              <Field label="First Name" required>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData((s) => ({ ...s, first_name: e.target.value }))}
                  placeholder="First name"
                  required
                />
              </Field>

              <Field label="Middle Name">
                <Input
                  value={formData.middle_name}
                  onChange={(e) => setFormData((s) => ({ ...s, middle_name: e.target.value }))}
                  placeholder="Middle name (optional)"
                />
              </Field>

              <Field label="Last Name" required>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData((s) => ({ ...s, last_name: e.target.value }))}
                  placeholder="Last name"
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field label="Gender">
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData((s) => ({ ...s, gender: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-body-sm text-text-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date of Birth" description={birthDateDescription}>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData((s) => ({ ...s, dateOfBirth: e.target.value }))}
                />
              </Field>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="flex flex-col gap-5">
            <h2 className="border-accent text-text-primary text-body-md flex items-center gap-2 border-l-2 pl-2.5 font-semibold">
              <Mail className="text-accent h-4 w-4" />
              Contact Information
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <Field
                label="Display Handle"
                description="Public handle used across shared ledgers and friend bill splits."
              >
                <Input
                  value={formData.displayUsername}
                  onChange={(e) => setFormData((s) => ({ ...s, displayUsername: e.target.value }))}
                  placeholder="username"
                  leadingIcon={<AtSign />}
                />
              </Field>

              <Field
                label="Phone Number"
                description="Contact number used for UPI transactions and verification."
              >
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  leadingIcon={<Phone />}
                />
              </Field>
            </div>
          </div>

          {/* Section 3: Account & System Identifiers */}
          <div className="flex flex-col gap-5">
            <h2 className="border-accent text-text-primary text-body-md flex items-center gap-2 border-l-2 pl-2.5 font-semibold">
              <Fingerprint className="text-accent h-4 w-4" />
              Account & System
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <ReadOnlyField
                label="Account ID"
                value={user?.id}
                icon={Hash}
                copyable
                mask
                hint="Your unique Kalya identity identifier"
              />

              <ReadOnlyField
                label="Primary Email"
                value={user?.email}
                icon={Mail}
                copyable
                hint="Primary login and account recovery email"
              />
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-text-muted text-caption flex items-center gap-1.5 font-medium tracking-wide uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Email Verification Status
                </span>
                <span
                  className={`text-body-sm inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
                    user?.emailVerified
                      ? 'bg-success-subtle text-success'
                      : 'bg-danger-subtle text-danger'
                  }`}
                >
                  {user?.emailVerified ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-text-muted text-caption flex items-center gap-1.5 font-medium tracking-wide uppercase">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Sync Status
                </span>
                <span
                  className={`text-body-sm inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
                    isSynced ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {syncStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Activity */}
          <div className="flex flex-col gap-5">
            <h2 className="border-accent text-text-primary text-body-md flex items-center gap-2 border-l-2 pl-2.5 font-semibold">
              <History className="text-accent h-4 w-4" />
              Activity
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <ReadOnlyField
                label="Account Created"
                value={formatTimestamp(user?.createdAt)}
                icon={Clock3}
                hint={
                  user?.createdAt
                    ? `Registered account ${formatTimeAgo(user.createdAt, { compact: false })}`
                    : 'Initial account registration'
                }
              />
              <ReadOnlyField
                label="Last Modified"
                value={formatTimestamp(user?.updatedAt)}
                icon={Clock3}
                hint={
                  user?.updatedAt
                    ? `Profile modified ${formatTimeAgo(user.updatedAt)}`
                    : 'Last profile change timestamp'
                }
              />
            </div>
          </div>

          {/* Bottom Footer Actions */}
          <div className="border-border flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end sm:items-center">
            {isDirty && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Discard changes
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              disabled={!isDirty}
              leftIcon={<Sparkles size={14} />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
