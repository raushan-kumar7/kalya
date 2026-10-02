'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  KeyRound,
  Laptop,
  LogOut,
  Monitor,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  XCircle,
} from 'lucide-react';
import type { Session, User } from '@kalya/types';
import { formatDateTime, formatRelativeTime, formatTimeAgo, isExpired } from '@kalya/utils';
import { useChangePasswordMutation } from '@/hooks/auth';
import { useUser, useSessionsQuery } from '@/hooks/users';
import { runAction } from '@/libs/run-actions';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  CheckboxField,
} from '@/components/ui';

export interface SecurityTabProps {
  user: User | null;
}

function parseUserAgent(ua?: string | null) {
  if (!ua) return { browser: 'Web Browser', os: 'Desktop Device', isMobile: false };
  const lower = ua.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|ipod/.test(lower);

  let os = 'Unknown OS';
  if (/windows/.test(lower)) os = 'Windows';
  else if (/macintosh|mac os x/.test(lower)) os = 'macOS';
  else if (/iphone|ipad|ipod/.test(lower)) os = 'iOS';
  else if (/android/.test(lower)) os = 'Android';
  else if (/linux/.test(lower)) os = 'Linux';

  let browser = 'Browser';
  if (/edg\//.test(lower)) browser = 'Microsoft Edge';
  else if (/chrome|crios/.test(lower)) browser = 'Google Chrome';
  else if (/firefox|fxios/.test(lower)) browser = 'Mozilla Firefox';
  else if (/safari/.test(lower)) browser = 'Apple Safari';
  else if (/opr\/|opera/.test(lower)) browser = 'Opera';

  return { browser, os, isMobile };
}

export function SecurityTab({ user }: SecurityTabProps) {
  const changePasswordMutation = useChangePasswordMutation();
  const { revokeSession, revokeOtherSessions, scheduleAccountDeletion, cancelAccountDeletion } =
    useUser();
  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useSessionsQuery();

  // Password change state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [revokeOthers, setRevokeOthers] = React.useState(true);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  // Danger zone state
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [isCancellingDeletion, setIsCancellingDeletion] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteConfirmationWord, setDeleteConfirmationWord] = React.useState('');
  const [scheduledDeletionDate, setScheduledDeletionDate] = React.useState<string | Date | null>(
    null
  );

  // Password strength calculations
  const passwordCriteria = React.useMemo(() => {
    return {
      hasMinLength: newPassword.length >= 8,
      hasNumber: /\d/.test(newPassword),
      hasCaseMix: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const strengthScore = React.useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (passwordCriteria.hasMinLength) score++;
    if (newPassword.length >= 12) score++;
    if (passwordCriteria.hasNumber) score++;
    if (passwordCriteria.hasCaseMix) score++;
    if (passwordCriteria.hasSpecial) score++;
    return score;
  }, [newPassword, passwordCriteria]);

  const strengthMeta = React.useMemo(() => {
    if (!newPassword) return { label: '', color: 'bg-border', textColor: 'text-text-muted' };
    if (strengthScore <= 2) {
      return { label: 'Weak', color: 'bg-danger', textColor: 'text-danger' };
    }
    if (strengthScore <= 4) {
      return { label: 'Medium', color: 'bg-warning', textColor: 'text-warning' };
    }
    return { label: 'Strong', color: 'bg-success', textColor: 'text-success' };
  }, [newPassword, strengthScore]);

  const passwordsMatch =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await runAction(
        () =>
          changePasswordMutation.mutateAsync({
            currentPassword,
            newPassword,
            revokeOtherSessions: revokeOthers,
          }),
        {
          loading: 'Updating password…',
          success: 'Password updated successfully',
        }
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      refetchSessions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    await revokeSession(sessionId);
    refetchSessions();
  };

  const handleRevokeOtherSessions = async () => {
    await revokeOtherSessions();
    refetchSessions();
  };

  const handleScheduleDeletion = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await scheduleAccountDeletion();
      if (res.success && res.data?.scheduledDate) {
        setScheduledDeletionDate(res.data.scheduledDate);
      }
      setShowDeleteConfirm(false);
      setDeleteConfirmationWord('');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCancelDeletion = async () => {
    setIsCancellingDeletion(true);
    try {
      await cancelAccountDeletion();
      setScheduledDeletionDate(null);
    } finally {
      setIsCancellingDeletion(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Change Password Card */}
      <Card className="border-border/80 bg-surface/90 shadow-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound size={18} />
            </div>
            <div>
              <CardTitle className="text-body-lg font-semibold text-text-primary">
                Change Password
              </CardTitle>
              <CardDescription className="text-body-sm text-text-muted">
                Ensure your financial credentials remain robust and protected.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-5 pt-6">
            {passwordError && (
              <Alert variant="danger">
                <AlertTitle>Validation Error</AlertTitle>
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Current Password" required>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <Field
                  label="New Password"
                  description="Use 8+ characters mixing letters, digits & symbols."
                  required
                >
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                </Field>

                {newPassword && (
                  <div className="mt-1 space-y-1.5">
                    <div className="flex items-center justify-between text-caption">
                      <span className="text-text-muted">Password Strength</span>
                      <span className={`font-medium ${strengthMeta.textColor}`}>
                        {strengthMeta.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-raised overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthMeta.color}`}
                        style={{
                          width: `${Math.min(100, Math.max(15, (strengthScore / 5) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Field label="Confirm New Password" required>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                </Field>

                {confirmPassword && (
                  <div className="flex items-center gap-1.5 text-caption mt-0.5">
                    {passwordsMatch ? (
                      <span className="text-success inline-flex items-center gap-1">
                        <CheckCircle2 size={13} /> Passwords match
                      </span>
                    ) : passwordsMismatch ? (
                      <span className="text-danger inline-flex items-center gap-1">
                        <XCircle size={13} /> Passwords do not match
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1">
              <CheckboxField
                checked={revokeOthers}
                onCheckedChange={(checked) => setRevokeOthers(Boolean(checked))}
                label="Sign out of all other devices on password change"
                description="Immediately invalidate existing active sessions across other phones or laptops."
              />
            </div>
          </CardContent>

          <div className="flex items-center justify-end border-t border-border/60 bg-surface-raised/40 px-6 py-4 rounded-b-xl">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isChangingPassword || changePasswordMutation.isPending}
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Active Devices & Sessions Card */}
      <Card className="border-border/80 bg-surface/90 shadow-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Laptop size={18} />
              </div>
              <div>
                <CardTitle className="text-body-lg font-semibold text-text-primary">
                  Active Sessions & Devices
                </CardTitle>
                <CardDescription className="text-body-sm text-text-muted">
                  Devices and locations currently signed in to your Kalya account.
                </CardDescription>
              </div>
            </div>

            {sessions.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRevokeOtherSessions}
                leftIcon={<LogOut size={14} />}
              >
                Sign Out Other Devices
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border/60 p-0">
          {isLoadingSessions ? (
            <div className="p-6 text-center text-body-sm text-text-muted">
              Loading active sessions…
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-body-sm text-text-muted">
              Only your current active session is recorded.
            </div>
          ) : (
            sessions.map((sess: Session, idx: number) => {
              const { browser, os, isMobile } = parseUserAgent(sess.userAgent);
              const isCurrentSession = idx === 0;
              const hasExpired = sess.expiresAt ? isExpired(sess.expiresAt) : false;

              return (
                <div
                  key={sess.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-surface-raised/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-raised border border-border text-text-secondary">
                      {isMobile ? (
                        <Smartphone size={18} />
                      ) : os === 'macOS' || os === 'Windows' ? (
                        <Laptop size={18} />
                      ) : (
                        <Monitor size={18} />
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm font-semibold text-text-primary">
                          {browser} on {os}
                        </span>
                        {isCurrentSession && (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium bg-success-subtle text-success">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                            </span>
                            This Device
                          </span>
                        )}
                        {hasExpired && (
                          <Badge variant="danger" size="sm">
                            Expired
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-caption text-text-muted">
                        <span>
                          IP:{' '}
                          <code className="font-mono text-text-secondary">
                            {sess.ipAddress || '127.0.0.1'}
                          </code>
                        </span>
                        <span>•</span>
                        <span title={formatDateTime(sess.createdAt, user?.timezone ?? undefined)}>
                          Signed in {formatTimeAgo(sess.createdAt)} (
                          {formatDateTime(sess.createdAt, user?.timezone ?? undefined)})
                        </span>
                        {sess.expiresAt && !hasExpired && (
                          <>
                            <span>•</span>
                            <span className="text-text-muted">
                              Expires in {formatRelativeTime(sess.expiresAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isCurrentSession && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-danger hover:bg-danger-subtle hover:text-danger self-start sm:self-center"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 3. Danger Zone Card */}
      <Card className="border-danger/30 bg-danger/5 shadow-card">
        <CardHeader className="border-b border-danger/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger">
              <AlertTriangle size={18} />
            </div>
            <div>
              <CardTitle className="text-body-lg font-semibold text-danger">Danger Zone</CardTitle>
              <CardDescription className="text-body-sm text-text-muted">
                Irreversible account lifecycle actions and data deletion.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {scheduledDeletionDate ? (
            <div className="rounded-xl border border-danger/40 bg-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-danger font-semibold text-body-sm">
                  <ShieldAlert size={16} />
                  Account Scheduled for Permanent Deletion
                </div>
                <p className="text-caption text-text-muted">
                  Full purge scheduled for{' '}
                  <span className="font-semibold text-text-primary">
                    {formatDateTime(scheduledDeletionDate, user?.timezone ?? undefined)}
                  </span>{' '}
                  ({formatRelativeTime(scheduledDeletionDate)}). You can cancel this anytime during
                  the grace period.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isCancellingDeletion}
                onClick={handleCancelDeletion}
                leftIcon={<RotateCcw size={14} />}
                className="shrink-0 self-start sm:self-center border-border hover:bg-surface-raised"
              >
                Cancel Deletion
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-body-sm font-semibold text-text-primary">Delete Account</h3>
                <p className="text-caption text-text-muted max-w-xl">
                  Permanently deletes your financial portfolios, transaction history, budgets, and
                  linked account credentials. Once scheduled, a grace period allows recovery before
                  full purge.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-danger/40 text-danger hover:bg-danger hover:text-white shrink-0 self-start sm:self-center"
                >
                  Delete Account…
                </Button>
              ) : (
                <div className="flex flex-col gap-2.5 rounded-lg border border-danger/30 bg-surface p-3.5 sm:max-w-xs">
                  <p className="text-caption text-text-muted">
                    Type <code className="font-semibold text-danger">DELETE</code> below to confirm:
                  </p>
                  <Input
                    size="sm"
                    value={deleteConfirmationWord}
                    onChange={(e) => setDeleteConfirmationWord(e.target.value)}
                    placeholder="Type DELETE"
                    className="h-8 text-caption"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmationWord('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      isLoading={isDeletingAccount}
                      disabled={deleteConfirmationWord !== 'DELETE'}
                      onClick={handleScheduleDeletion}
                    >
                      Confirm Deletion
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
