'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserPlus,
  UserCheck,
  Unlink,
  User as UserIcon,
  Mail,
  Phone,
  Sparkles,
  Check,
} from 'lucide-react';
import type { SplitContactMember } from '@kalya/types';
import {
  z,
  type CreateSplitContactMemberInput,
  type UpdateSplitContactMemberInput,
} from '@kalya/validations';
import { FinanceFormModal } from '../modal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Combobox,
  type ComboboxOption,
  Input,
} from '@/components/ui';
import { useUserSearch } from '@/hooks/users';

export interface SplitContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Split contact member — Pass when editing; omit when creating */
  splitContact?: SplitContactMember | null;
  /** Callback function to save the split contact */
  onSave: (payload: CreateSplitContactMemberInput | UpdateSplitContactMemberInput) => Promise<void>;
}

const SplitContactFormValidationSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Invalid email address',
    }),
  phone: z.string().trim().max(20, 'Phone number is too long').optional().nullable(),
  image: z.string().optional().nullable(),
  is_linked: z.boolean().default(false),
  linked_user_id: z.string().optional().nullable(),
});

export function SplitContactForm({
  open,
  onOpenChange,
  splitContact,
  onSave,
}: SplitContactFormProps) {
  const [query, setQuery] = useState('');

  const form = useForm<CreateSplitContactMemberInput>({
    resolver: zodResolver(SplitContactFormValidationSchema as any),
    defaultValues: {
      name: splitContact?.name ?? '',
      phone: splitContact?.phone ?? '',
      email: splitContact?.email ?? '',
      image: splitContact?.image ?? '',
      is_linked: splitContact?.is_linked ?? (splitContact as any)?.isLinked ?? false,
      linked_user_id: splitContact?.linked_user_id ?? (splitContact as any)?.linkedUserId ?? null,
    },
  });

  const isLinked = useWatch({ control: form.control, name: 'is_linked' });
  const watchedName = useWatch({ control: form.control, name: 'name' });
  const watchedEmail = useWatch({ control: form.control, name: 'email' });
  const watchedPhone = useWatch({ control: form.control, name: 'phone' });
  const watchedImage = useWatch({ control: form.control, name: 'image' });

  const { results, isSearching, isDebouncing } = useUserSearch(query, {
    limit: 8,
    includeSelf: true,
  });

  const options: ComboboxOption[] = useMemo(
    () =>
      results.map((u) => ({
        value: u.id,
        label: u.name,
        description: [u.username ? `@${u.username}` : null, u.email || u.phone]
          .filter(Boolean)
          .join(' • '),
      })),
    [results]
  );

  const emptyText =
    query.trim().length < 2
      ? 'Type at least 2 characters to search directory…'
      : isSearching || isDebouncing
        ? 'Searching registered members…'
        : 'No registered user found — enter details manually below.';

  useEffect(() => {
    if (!open) return;
    setQuery('');
    form.reset({
      name: splitContact?.name ?? '',
      phone: splitContact?.phone ?? '',
      email: splitContact?.email ?? '',
      image: splitContact?.image ?? '',
      is_linked: splitContact?.is_linked ?? (splitContact as any)?.isLinked ?? false,
      linked_user_id: splitContact?.linked_user_id ?? (splitContact as any)?.linkedUserId ?? null,
    });
  }, [open, splitContact, form]);

  const onSelect = (userId: string) => {
    const user = results.find((u) => u.id === userId);
    if (!user) return;
    const opts = { shouldValidate: true, shouldDirty: true } as const;
    form.setValue('name', user.name, opts);
    form.setValue('email', user.email ?? '', opts);
    form.setValue('phone', user.phone ?? '', opts);
    form.setValue('image', user.image ?? '', opts);
    form.setValue('is_linked', true, opts);
    form.setValue('linked_user_id', user.id, opts);
  };

  const unlink = () => {
    const opts = { shouldValidate: true, shouldDirty: true } as const;
    form.setValue('is_linked', false, opts);
    form.setValue('linked_user_id', null, opts);
    setQuery('');
  };

  const onSubmit = async (
    payload: CreateSplitContactMemberInput | UpdateSplitContactMemberInput
  ) => {
    const cleanPayload: CreateSplitContactMemberInput = {
      name: payload.name?.trim() ?? '',
      email: payload.email?.trim() ? payload.email.trim().toLowerCase() : null,
      phone: payload.phone?.trim() ? payload.phone.trim() : null,
      image: payload.image?.trim() ? payload.image.trim() : null,
      is_linked: Boolean(payload.is_linked),
      linked_user_id: payload.linked_user_id ?? null,
    };
    await onSave(cleanPayload);
    onOpenChange(false);
  };

  const initials = (watchedName || 'U').trim().slice(0, 2).toUpperCase();

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      title={splitContact ? 'Edit split contact' : 'Add split contact'}
      description="Saved contacts can be picked quickly when splitting expenses and tracking settlements."
      onSubmit={onSubmit}
      icon={<UserPlus className="h-5 w-5" />}
      submitLabel={splitContact ? 'Save Changes' : 'Create Split Contact'}
      isSubmitting={form.formState.isSubmitting}
      size="md"
    >
      <div className="space-y-5">
        {/* Registered-user lookup (shown when not yet linked, in both Add and Edit modes) */}
        {!isLinked && (
          <div className="rounded-xl border border-dashed border-border/80 bg-surface-raised/30 p-3.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="text-caption font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
                Find on Kalya
              </span>
              <span className="text-[11px] text-text-muted">Auto-fill & link profile</span>
            </div>

            <Combobox
              options={options}
              value=""
              onChange={onSelect}
              onSearchChange={setQuery}
              filterLocally={false}
              clearable={false}
              placeholder="Search by name, @username, or email…"
              searchPlaceholder="Type a name, @username, or email…"
              emptyText={emptyText}
              renderOption={(opt, selected) => {
                const user = results.find((u) => u.id === opt.value);
                const optInitials = (opt.label || 'U').slice(0, 2).toUpperCase();
                return (
                  <div className="flex w-full items-center justify-between gap-2.5 py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar size="sm" className="h-7 w-7 text-xs shrink-0">
                        {user?.image && <AvatarImage src={user.image} alt={opt.label} />}
                        <AvatarFallback className="bg-primary-subtle text-primary font-semibold text-[11px]">
                          {optInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium text-text-primary text-body-sm">
                            {opt.label}
                          </span>
                          {user?.username && (
                            <span className="text-[11px] text-accent font-mono truncate">
                              @{user.username}
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p className="truncate text-caption text-text-muted mt-0.5">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                );
              }}
            />
          </div>
        )}

        {/* Linked member card */}
        {isLinked && (
          <div className="relative overflow-hidden rounded-xl border border-success/30 bg-success-subtle/15 dark:bg-success-subtle/10 p-3.5 transition-all shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  size="md"
                  className="h-10 w-10 shrink-0 border border-success/40 ring-2 ring-success/20 overflow-hidden"
                >
                  {watchedImage ? (
                    <AvatarImage src={watchedImage} alt={watchedName || 'User'} />
                  ) : null}
                  <AvatarFallback className="bg-success-subtle text-success font-semibold text-caption">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body-sm font-semibold text-text-primary truncate">
                      {watchedName || 'Linked Member'}
                    </span>
                    <Badge
                      variant="success"
                      size="sm"
                      dot
                      dotColor="success"
                      leadingIcon={<UserCheck className="h-3 w-3" />}
                    >
                      Linked Member
                    </Badge>
                  </div>
                  <p className="text-caption text-text-muted mt-0.5 truncate">
                    {watchedEmail || watchedPhone || 'Kalya platform account'}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={unlink}
                className="text-text-muted hover:text-danger hover:bg-danger-subtle/30 shrink-0 text-caption gap-1 px-2.5 h-7 transition-colors self-end sm:self-auto"
              >
                <Unlink className="h-3.5 w-3.5" />
                <span>Unlink</span>
              </Button>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 border-t border-success/20 pt-2 text-[11px] text-text-muted">
              <Sparkles className="h-3 w-3 text-accent shrink-0" />
              <span>Splits with this person will automatically sync to their Kalya dashboard.</span>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <Input
            label="Name"
            required
            placeholder="e.g. John Doe"
            leadingIcon={<UserIcon className="h-4 w-4 text-text-muted" />}
            errorMessage={form.formState.errors.name?.message}
            {...form.register('name', { required: 'Name is required' })}
          />

          <Input
            label="Email"
            type="email"
            placeholder="e.g. john.doe@kalya.com"
            leadingIcon={<Mail className="h-4 w-4 text-text-muted" />}
            helperText={isLinked ? 'Synced from linked Kalya account' : 'Optional contact email'}
            errorMessage={form.formState.errors.email?.message}
            {...form.register('email')}
          />

          <Input
            label="Phone"
            placeholder="e.g. +91 88888 88888"
            leadingIcon={<Phone className="h-4 w-4 text-text-muted" />}
            helperText={
              isLinked ? 'Synced from linked Kalya account' : 'Optional phone for UPI / WhatsApp'
            }
            errorMessage={form.formState.errors.phone?.message}
            {...form.register('phone')}
          />
        </div>
      </div>
    </FinanceFormModal>
  );
}
