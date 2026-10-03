'use client';

import { useState, useEffect } from 'react';
import type { Bucket } from '@kalya/types';
import {
  type CreateBucketInput,
  CreateBucketSchema,
  type UpdateBucketInput,
  UpdateBucketSchema,
} from '@kalya/validations';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FinanceFormModal } from './modal';
import { Check, Palette, Percent, Wallet } from 'lucide-react';
import { Field, Input, Label, Switch } from '@/components/ui';
import { cn } from '@/libs/utils';

const SWATCHES = [
  '#2563EB', // blue
  '#7C3AED', // violet
  '#DB2777', // pink
  '#EA580C', // orange
  '#0891B2', // cyan
  '#65A30D', // lime
  '#CA8A04', // gold
  '#64748B', // slate
];

interface BucketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucket?: Bucket;
  onSave: (payload: CreateBucketInput | UpdateBucketInput) => Promise<void>;
  otherBucketsAllocatedPercent: number;
}

export function BucketForm({
  open,
  onOpenChange,
  bucket,
  onSave,
  otherBucketsAllocatedPercent,
}: BucketFormProps) {
  const isBuiltIn = bucket?.origin === 'built-in';
  const initialTargetPercent =
    bucket?.target_percent != null
      ? Number(bucket.target_percent)
      : (bucket as any)?.targetPercent != null
        ? Number((bucket as any).targetPercent)
        : undefined;

  const [hasTarget, setHasTarget] = useState(initialTargetPercent !== undefined);
  const [customHex, setCustomHex] = useState(
    Boolean(
      bucket?.color && !SWATCHES.map((s) => s.toLowerCase()).includes(bucket.color.toLowerCase())
    )
  );
  const [isKeyDirty, setIsKeyDirty] = useState(Boolean(bucket));

  const form = useForm<CreateBucketInput>({
    resolver: zodResolver((bucket ? UpdateBucketSchema : CreateBucketSchema) as any),
    defaultValues: {
      key: bucket?.key ?? '',
      label: bucket?.label ?? '',
      target_percent: initialTargetPercent,
      color: bucket?.color ?? SWATCHES[0],
      origin: bucket?.origin ?? 'custom',
    },
  });

  // Re-sync form state when modal opens or bucket changes
  useEffect(() => {
    if (open) {
      const syncTargetPercent =
        bucket?.target_percent != null
          ? Number(bucket.target_percent)
          : (bucket as any)?.targetPercent != null
            ? Number((bucket as any).targetPercent)
            : undefined;

      form.reset({
        key: bucket?.key ?? '',
        label: bucket?.label ?? '',
        target_percent: syncTargetPercent,
        color: bucket?.color ?? SWATCHES[0],
        origin: bucket?.origin ?? 'custom',
      });
      setHasTarget(syncTargetPercent !== undefined);
      setCustomHex(
        Boolean(
          bucket?.color &&
          !SWATCHES.map((s) => s.toLowerCase()).includes(bucket.color.toLowerCase())
        )
      );
      setIsKeyDirty(Boolean(bucket));
    }
  }, [open, bucket, form]);

  const targetPercent = useWatch({
    control: form.control,
    name: 'target_percent',
  });

  const selectedColor = useWatch({
    control: form.control,
    name: 'color',
  });

  const currentAllocation = hasTarget && targetPercent != null ? Number(targetPercent) || 0 : 0;
  const projectTotalAllocation =
    Math.round((otherBucketsAllocatedPercent + currentAllocation) * 10) / 10;

  const handleToggleTarget = (checked: boolean) => {
    setHasTarget(checked);
    if (!checked) {
      form.setValue('target_percent', undefined, { shouldValidate: true });
      form.clearErrors('target_percent');
    } else {
      const current = form.getValues('target_percent');
      if (current == null || isNaN(Number(current))) {
        const remaining = Math.max(0, 100 - otherBucketsAllocatedPercent);
        const suggested = remaining > 0 ? Math.min(20, remaining) : 20;
        form.setValue('target_percent', suggested, { shouldValidate: true });
      }
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!bucket && !isKeyDirty) {
      const slug = e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '');
      form.setValue('key', slug, { shouldValidate: false });
    }
  };

  const onSubmit = async (values: CreateBucketInput) => {
    const sanitizedColor = values.color && values.color.trim() ? values.color.trim() : null;
    const finalPayload: CreateBucketInput | UpdateBucketInput = {
      ...values,
      target_percent:
        hasTarget && values.target_percent != null ? Number(values.target_percent) : null,
      color: sanitizedColor,
    };

    await onSave(finalPayload);
    onOpenChange(false);
  };

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={onSubmit}
      title={isBuiltIn ? `Edit ${bucket?.label}` : bucket ? 'Edit Bucket' : 'New Bucket'}
      description={
        isBuiltIn
          ? 'Built-in buckets keep their name and key — color and target allocation are still yours to edit.'
          : 'Custom buckets extend needs/wants/savings for spending you want tracked separately.'
      }
      icon={<Wallet className="h-5 w-5" />}
      submitLabel={bucket ? 'Save Changes' : 'Create Bucket'}
      isSubmitting={form.formState.isSubmitting}
      size="md"
    >
      <div className="space-y-4">
        {!isBuiltIn && (
          <>
            <Input
              label="Name"
              required
              placeholder="e.g. Sinking Fund"
              errorMessage={form.formState.errors.label?.message}
              {...form.register('label', {
                required: 'Name is required',
                onChange: handleLabelChange,
              })}
            />
            <Input
              label="Key"
              required
              placeholder="e.g. sinking_fund"
              helperText="Lowercase, no spaces — used internally, can't be needs/wants/savings."
              errorMessage={form.formState.errors.key?.message}
              {...form.register('key', {
                required: 'Key is required',
                onChange: (e) => {
                  setIsKeyDirty(true);
                  e.target.value = e.target.value.toLowerCase().replace(/\s+/g, '_');
                },
              })}
            />
          </>
        )}

        <Field
          label="Color"
          description="Shown on the bucket's card and in the allocation bar."
          error={form.formState.errors.color?.message}
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
                    'h-7 w-7 shrink-0 rounded-full transition-transform duration-150 cursor-pointer',
                    'hover:scale-110',
                    'focus-visible:ring-primary focus-visible:ring-offset-surface outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    active && 'ring-primary ring-offset-surface ring-2 ring-offset-2 scale-105'
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
                id="bucket-custom-color"
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
                htmlFor="bucket-custom-color"
                aria-label="Pick custom color"
                title="Pick custom color"
                className={cn(
                  'border-border text-text-muted flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed',
                  'hover:border-primary hover:text-primary transition-colors duration-150',
                  'focus-visible:ring-primary focus-visible:ring-offset-surface outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  customHex &&
                    'border-primary text-primary border-solid ring-2 ring-primary ring-offset-2'
                )}
              >
                <Palette className="h-3.5 w-3.5" />
              </label>
            </div>

            {customHex && (
              <Input
                placeholder="#7C3AED"
                wrapperClassName="w-32"
                className="font-numeric uppercase h-8 text-caption"
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

        <div className="border-border bg-surface-raised flex items-center justify-between rounded-lg border px-3.5 py-2.5">
          <Label htmlFor="has-target" className="mb-0 cursor-pointer">
            Give this bucket a target allocation
          </Label>
          <Switch id="has-target" checked={hasTarget} onCheckedChange={handleToggleTarget} />
        </div>

        {hasTarget && (
          <Field
            label="Target percent"
            error={form.formState.errors.target_percent?.message}
            warning={
              projectTotalAllocation > 100
                ? `This would put your total allocation at ${projectTotalAllocation}% — over 100%.`
                : undefined
            }
            description={
              projectTotalAllocation <= 100
                ? `Total allocated across all buckets: ${projectTotalAllocation}%`
                : undefined
            }
          >
            <Input
              type="number"
              placeholder="e.g. 20"
              min={0}
              max={100}
              step="0.1"
              className="font-numeric"
              trailingIcon={<Percent className="h-4 w-4" />}
              {...form.register('target_percent', {
                setValueAs: (v) =>
                  v === '' || v === null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </Field>
        )}
      </div>
    </FinanceFormModal>
  );
}
