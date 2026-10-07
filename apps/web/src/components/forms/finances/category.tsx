'use client';

import React, { useState, useEffect } from 'react';
import type { Bucket, Category } from '@kalya/types';
import {
  type CreateCategoryInput,
  CreateCategorySchema,
  type UpdateCategoryInput,
  UpdateCategorySchema,
} from '@kalya/validations';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FinanceFormModal } from './modal';
import {
  Baby,
  BookOpen,
  Briefcase,
  Car,
  Check,
  Coffee,
  Dumbbell,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Palette,
  Plane,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tag,
  Utensils,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/libs/utils';

export const CATEGORY_ICONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'tag', label: 'General', icon: Tag },
  { id: 'shopping-bag', label: 'Shopping', icon: ShoppingBag },
  { id: 'utensils', label: 'Food & Dining', icon: Utensils },
  { id: 'coffee', label: 'Coffee & Drinks', icon: Coffee },
  { id: 'car', label: 'Transport', icon: Car },
  { id: 'home', label: 'Housing', icon: Home },
  { id: 'zap', label: 'Utilities', icon: Zap },
  { id: 'film', label: 'Entertainment', icon: Film },
  { id: 'dumbbell', label: 'Fitness', icon: Dumbbell },
  { id: 'heart-pulse', label: 'Health', icon: HeartPulse },
  { id: 'graduation-cap', label: 'Education', icon: GraduationCap },
  { id: 'plane', label: 'Travel', icon: Plane },
  { id: 'gift', label: 'Gifts & Charity', icon: Gift },
  { id: 'briefcase', label: 'Work', icon: Briefcase },
  { id: 'sparkles', label: 'Personal Care', icon: Sparkles },
  { id: 'wrench', label: 'Maintenance', icon: Wrench },
  { id: 'smartphone', label: 'Phone & Tech', icon: Smartphone },
  { id: 'book-open', label: 'Books & Learning', icon: BookOpen },
  { id: 'wifi', label: 'Internet', icon: Wifi },
  { id: 'baby', label: 'Family & Kids', icon: Baby },
];

export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Tag;
  const match = CATEGORY_ICONS.find((item) => item.id === iconName);
  return match ? match.icon : Tag;
}

const SWATCHES = [
  '#2563EB', // blue
  '#7C3AED', // violet
  '#DB2777', // pink
  '#EA580C', // orange
  '#0891B2', // cyan
  '#16A34A', // emerald
  '#CA8A04', // gold
  '#DC2626', // rose / red
  '#4F46E5', // indigo
  '#0D9488', // teal
  '#64748B', // slate
];

const BUILT_IN_BUCKET_COLOR: Record<string, string> = {
  needs: '#0284C7',
  wants: '#D97706',
  savings: '#16A34A',
};

export interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buckets: Bucket[];
  category?: Category;
  defaultBucketId?: string;
  onSave: (payload: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
}

export function CategoryForm({
  open,
  onOpenChange,
  buckets,
  category,
  defaultBucketId,
  onSave,
}: CategoryFormProps) {
  const isBuiltIn = category?.origin === 'built-in';

  // Normalize bucket_id across snake_case / camelCase
  const initialBucketId =
    category?.bucket_id ?? (category as any)?.bucketId ?? defaultBucketId ?? buckets[0]?.id ?? '';

  const [customHex, setCustomHex] = useState(
    Boolean(
      category?.color &&
      !SWATCHES.map((s) => s.toLowerCase()).includes(category.color.toLowerCase())
    )
  );
  const [isKeyDirty, setIsKeyDirty] = useState(Boolean(category));

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver((category ? UpdateCategorySchema : CreateCategorySchema) as any),
    defaultValues: {
      key: category?.key ?? '',
      label: category?.label ?? '',
      bucket_id: initialBucketId,
      color: category?.color ?? SWATCHES[0],
      icon: category?.icon ?? 'tag',
      origin: category?.origin ?? 'custom',
    },
  });

  // Re-sync form state when modal opens or category changes
  useEffect(() => {
    if (open) {
      const bucketId =
        category?.bucket_id ??
        (category as any)?.bucketId ??
        defaultBucketId ??
        buckets[0]?.id ??
        '';

      form.reset({
        key: category?.key ?? '',
        label: category?.label ?? '',
        bucket_id: bucketId,
        color: category?.color ?? SWATCHES[0],
        icon: category?.icon ?? 'tag',
        origin: category?.origin ?? 'custom',
      });

      setCustomHex(
        Boolean(
          category?.color &&
          !SWATCHES.map((s) => s.toLowerCase()).includes(category.color.toLowerCase())
        )
      );
      setIsKeyDirty(Boolean(category));
    }
  }, [open, category, buckets, defaultBucketId, form]);

  const watchedLabel = useWatch({
    control: form.control,
    name: 'label',
  });

  const watchedKey = useWatch({
    control: form.control,
    name: 'key',
  });

  const watchedBucketId = useWatch({
    control: form.control,
    name: 'bucket_id',
  });

  const selectedColor = useWatch({
    control: form.control,
    name: 'color',
  });

  const watchedIcon = useWatch({
    control: form.control,
    name: 'icon',
  });

  // Find currently selected bucket for visual preview & color matching
  const selectedBucket = buckets.find((b) => b.id === watchedBucketId);
  const selectedBucketColor = selectedBucket
    ? (selectedBucket.color ?? BUILT_IN_BUCKET_COLOR[selectedBucket.key] ?? '#64748B')
    : undefined;

  const ActiveIcon = getCategoryIcon(watchedIcon);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!category && !isKeyDirty) {
      const slug = e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '');
      form.setValue('key', slug, { shouldValidate: false });
    }
  };

  const onSubmit = async (values: CreateCategoryInput) => {
    const sanitizedColor = values.color && values.color.trim() ? values.color.trim() : null;
    const sanitizedIcon = values.icon && values.icon.trim() ? values.icon.trim() : 'tag';

    const payload: CreateCategoryInput | UpdateCategoryInput = {
      ...values,
      label: values.label.trim(),
      key: values.key.trim().toLowerCase(),
      color: sanitizedColor,
      icon: sanitizedIcon,
    };

    await onSave(payload);
    onOpenChange(false);
  };

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={onSubmit}
      title={isBuiltIn ? `Edit ${category?.label}` : category ? 'Edit Category' : 'New Category'}
      description={
        isBuiltIn
          ? 'Built-in categories keep their key and bucket — label, icon, and color can still be personalized.'
          : 'Categories organize and tag your transactions under a high-level budget bucket.'
      }
      icon={<Tag className="h-5 w-5" />}
      submitLabel={category ? 'Save Changes' : 'Create Category'}
      isSubmitting={form.formState.isSubmitting}
      size="xl"
    >
      <div className="space-y-4">
        {/* Category Live Preview */}
        <div className="border-border/70 bg-surface-raised/40 flex items-center gap-3.5 rounded-xl border p-3.5 shadow-xs">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-200"
            style={{
              backgroundColor: selectedColor
                ? `color-mix(in srgb, ${selectedColor} 16%, transparent)`
                : 'var(--surface-raised)',
              border: `1.5px solid ${selectedColor ?? 'var(--border)'}`,
              color: selectedColor ?? 'var(--text-primary)',
            }}
          >
            <ActiveIcon className="h-5 w-5" strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-body-sm font-semibold text-text-primary">
                {watchedLabel?.trim() || 'Category Name'}
              </span>
              {selectedBucket && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: selectedBucketColor
                      ? `color-mix(in srgb, ${selectedBucketColor} 14%, transparent)`
                      : 'var(--surface-raised)',
                    color: selectedBucketColor ?? 'var(--text-secondary)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: selectedBucketColor ?? 'var(--text-muted)' }}
                    aria-hidden
                  />
                  {selectedBucket.label}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-caption text-text-muted">
              <code className="font-mono text-[11px]">
                {watchedKey ? `#${watchedKey}` : '#category_key'}
              </code>
              <span className="text-border">•</span>
              <span className="text-[11px]">
                {isBuiltIn ? 'System category' : 'Custom category'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Name */}
        <Input
          label="Name"
          required
          placeholder="e.g. Groceries, Coffee, Electric Bill"
          errorMessage={form.formState.errors.label?.message}
          {...form.register('label', {
            required: 'Name is required',
            onChange: handleLabelChange,
          })}
        />

        {/* Key (Slug) */}
        {isBuiltIn ? (
          <Input
            label="Key"
            disabled
            value={category?.key ?? ''}
            helperText="Built-in system category keys cannot be changed."
            className="font-mono text-caption"
          />
        ) : (
          <Input
            label="Key"
            required
            placeholder="e.g. groceries"
            helperText="Lowercase, no spaces — used internally to identify this category."
            errorMessage={form.formState.errors.key?.message}
            {...form.register('key', {
              required: 'Key is required',
              onChange: (e) => {
                setIsKeyDirty(true);
                e.target.value = e.target.value.toLowerCase().replace(/\s+/g, '_');
              },
            })}
          />
        )}

        {/* Parent Bucket */}
        <Field
          label="Parent Bucket"
          required
          description={
            isBuiltIn
              ? 'Parent bucket cannot be changed for built-in categories.'
              : 'The budget bucket this category reports to.'
          }
          error={form.formState.errors.bucket_id?.message}
        >
          <Select
            value={watchedBucketId}
            onValueChange={(val) => form.setValue('bucket_id', val, { shouldValidate: true })}
            disabled={isBuiltIn || buckets.length === 0}
          >
            <SelectTrigger error={Boolean(form.formState.errors.bucket_id)}>
              <SelectValue
                placeholder={buckets.length === 0 ? 'No buckets available' : 'Choose a bucket'}
              />
            </SelectTrigger>
            <SelectContent>
              {buckets.map((b) => {
                const bColor = b.color ?? BUILT_IN_BUCKET_COLOR[b.key] ?? '#64748B';
                const bTarget =
                  b.target_percent != null
                    ? Number(b.target_percent)
                    : (b as any)?.targetPercent != null
                      ? Number((b as any).targetPercent)
                      : undefined;
                return (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex w-full items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: bColor }}
                          aria-hidden
                        />
                        <span className="truncate font-medium">{b.label}</span>
                        {b.origin === 'custom' && (
                          <span className="text-[10px] text-text-muted shrink-0">(custom)</span>
                        )}
                      </div>
                      {bTarget !== undefined && (
                        <span className="text-caption text-text-muted font-numeric shrink-0">
                          {bTarget}%
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </Field>

        {/* Icon Selection */}
        <Field
          label="Icon"
          description="Visual glyph representing transactions assigned to this category."
          error={form.formState.errors.icon?.message}
        >
          <div className="border-border bg-surface-raised/20 grid max-h-36 grid-cols-5 gap-1.5 overflow-y-auto rounded-lg border p-1.5 sm:grid-cols-10">
            {CATEGORY_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = (watchedIcon || 'tag') === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  aria-pressed={isSelected}
                  onClick={() => form.setValue('icon', item.id, { shouldValidate: true })}
                  className={cn(
                    'flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-all',
                    'hover:bg-surface-raised hover:text-text-primary',
                    'focus-visible:ring-primary focus-visible:ring-offset-surface outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                    isSelected
                      ? 'ring-primary shadow-xs scale-105 font-semibold ring-2'
                      : 'text-text-muted bg-surface/70'
                  )}
                  style={
                    isSelected && selectedColor
                      ? {
                          backgroundColor: selectedColor,
                          color: '#FFFFFF',
                          boxShadow: `0 2px 8px color-mix(in srgb, ${selectedColor} 40%, transparent)`,
                        }
                      : undefined
                  }
                >
                  <IconComp className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </Field>

        {/* Color Palette */}
        <Field
          label="Color"
          description="Used on transaction pills, charts, and budget breakdowns."
          error={form.formState.errors.color?.message}
          labelAction={
            selectedBucketColor &&
            selectedColor?.toLowerCase() !== selectedBucketColor.toLowerCase() ? (
              <button
                type="button"
                onClick={() => {
                  setCustomHex(false);
                  form.setValue('color', selectedBucketColor, { shouldValidate: true });
                }}
                className="text-primary flex cursor-pointer items-center gap-1 text-[11px] font-medium hover:underline"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: selectedBucketColor }}
                  aria-hidden
                />
                Match bucket ({selectedBucket?.label})
              </button>
            ) : null
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            {SWATCHES.map((hex) => {
              const active = !customHex && selectedColor?.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Use ${hex}`}
                  aria-pressed={active}
                  onClick={() => {
                    setCustomHex(false);
                    form.setValue('color', hex, { shouldValidate: true });
                    form.clearErrors('color');
                  }}
                  className={cn(
                    'h-7 w-7 shrink-0 cursor-pointer rounded-full transition-transform duration-150',
                    'hover:scale-110',
                    'focus-visible:ring-primary focus-visible:ring-offset-surface outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    active && 'ring-primary ring-offset-surface scale-105 ring-2 ring-offset-2'
                  )}
                  style={{ backgroundColor: hex }}
                >
                  {active && (
                    <Check className="mx-auto h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden />
                  )}
                </button>
              );
            })}

            <div className="relative">
              <input
                type="color"
                id="category-custom-color"
                value={
                  selectedColor && /^#[0-9a-fA-F]{6}$/.test(selectedColor)
                    ? selectedColor
                    : '#2563EB'
                }
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setCustomHex(true);
                  form.setValue('color', val, { shouldValidate: true });
                }}
                className="sr-only"
              />
              <label
                htmlFor="category-custom-color"
                aria-label="Pick custom color"
                title="Pick custom color"
                className={cn(
                  'border-border text-text-muted flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed',
                  'hover:border-primary hover:text-primary transition-colors duration-150',
                  'focus-visible:ring-primary focus-visible:ring-offset-surface outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  customHex &&
                    'border-primary text-primary ring-primary border-solid ring-2 ring-offset-2'
                )}
              >
                <Palette className="h-3.5 w-3.5" />
              </label>
            </div>

            {customHex && (
              <Input
                placeholder="#7C3AED"
                wrapperClassName="w-32"
                className="font-numeric text-caption h-8 uppercase"
                value={selectedColor ?? ''}
                errorMessage={form.formState.errors.color?.message}
                onChange={(e) => {
                  const val = e.target.value;
                  form.setValue('color', val, { shouldValidate: true });
                }}
              />
            )}
          </div>
        </Field>
      </div>
    </FinanceFormModal>
  );
}
