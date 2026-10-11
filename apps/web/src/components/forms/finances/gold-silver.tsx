'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateDigitalAssetDto,
  DigitalAsset,
  DigitalAssetType,
  UpdateDigitalAssetDto,
} from '@kalya/types';
import { CreateDigitalAssetInput, CreateDigitalAssetSchema } from '@kalya/validations';
import { formatInr, roundMoney } from '@kalya/utils';
import { Coins, IndianRupee, Landmark, Scale } from 'lucide-react';
import { Card, Field, Input } from '@/components/ui';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { FinanceFormModal } from './modal';
import { cn } from '@/libs/utils';
import { ComputedValue } from '@/components/shared';

// Hides native spinners so they don't overlap the "g" and "/g" suffixes or change values on scroll
const NUMBER_INPUT_CLASS =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

// Number -> text shown in an input (empty when 0 so the placeholder is visible)
const toInputText = (value: number | string | null | undefined) => {
  const n = Number(value) || 0;
  return n > 0 ? String(n) : '';
};

export interface GoldSilverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: DigitalAsset | null;
  onSave: (payload: CreateDigitalAssetDto | UpdateDigitalAssetDto) => Promise<void>;
  defaultType?: DigitalAssetType;
}

export function GoldSilverForm({
  open,
  onOpenChange,
  asset,
  onSave,
  defaultType = 'gold',
}: GoldSilverFormProps) {
  const isEdit = Boolean(asset);

  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const form = useForm<CreateDigitalAssetInput>({
    resolver: zodResolver(CreateDigitalAssetSchema as any),
    defaultValues: {
      type: (asset?.type as DigitalAssetType) || defaultType,
      date: asset?.date ? String(asset.date).slice(0, 10) : defaultDate,
      platform: asset?.platform || 'Jar',
      rate_per_gram: Number(asset?.rate_per_gram ?? (asset as any)?.ratePerGram ?? 0),
      amount_paid: Number(asset?.amount_paid ?? (asset as any)?.amountPaid ?? 0),
      weight_in_gram: Number(asset?.weight_in_gram ?? (asset as any)?.weightInGram ?? 0),
      gst_3_percent: Number(
        asset?.gst_3_percent ?? (asset as any)?.gst3_percent ?? (asset as any)?.gst3Percent ?? 0
      ),
    },
  });

  const [selectedType, watchAmount, watchWeight, watchRate, watchGst] = useWatch({
    control: form.control,
    name: ['type', 'amount_paid', 'weight_in_gram', 'rate_per_gram', 'gst_3_percent'],
  });

  // Text shown in the number inputs. The form itself only ever stores numbers.
  const [inputText, setInputText] = useState({
    rate: toInputText(asset?.rate_per_gram ?? (asset as any)?.ratePerGram),
    weight: toInputText(asset?.weight_in_gram ?? (asset as any)?.weightInGram),
    amount: toInputText(asset?.amount_paid ?? (asset as any)?.amountPaid),
  });

  // Sync form values when the modal opens or when asset / defaultType changes
  useEffect(() => {
    if (!open) return;

    if (asset) {
      const rate = Number(asset.rate_per_gram ?? (asset as any).ratePerGram ?? 0);
      const weight = Number(asset.weight_in_gram ?? (asset as any).weightInGram ?? 0);
      const amount = Number(asset.amount_paid ?? (asset as any).amountPaid ?? 0);
      const rawGst = Number(
        asset.gst_3_percent ?? (asset as any).gst3_percent ?? (asset as any).gst3Percent ?? 0
      );
      const gst =
        rawGst > 0
          ? rawGst
          : roundMoney(weight * rate * 0.03 || (amount > 0 ? (amount * 0.03) / 1.03 : 0));

      form.reset({
        type: (asset.type as DigitalAssetType) || defaultType,
        date: String(asset.date).slice(0, 10),
        platform: asset.platform,
        rate_per_gram: rate,
        amount_paid: amount,
        weight_in_gram: weight,
        gst_3_percent: gst,
      });
      setInputText({
        rate: toInputText(rate),
        weight: toInputText(weight),
        amount: toInputText(amount),
      });
    } else {
      form.reset({
        type: defaultType,
        date: defaultDate,
        platform: 'Jar',
        rate_per_gram: 0,
        amount_paid: 0,
        weight_in_gram: 0,
        gst_3_percent: 0,
      });
      setInputText({ rate: '', weight: '', amount: '' });
    }
  }, [open, asset, defaultType, defaultDate, form]);

  // Rate changes: keep weight, recalculate GST and amount
  const handleRateChange = (newRateStr: string) => {
    const rate = parseFloat(newRateStr);
    form.setValue('rate_per_gram', Number.isFinite(rate) ? rate : 0, { shouldValidate: true });
    setInputText((prev) => ({ ...prev, rate: newRateStr }));

    const weight = Number(form.getValues('weight_in_gram')) || 0;
    if (Number.isFinite(rate) && rate > 0 && weight > 0) {
      const base = weight * rate;
      const gst = roundMoney(base * 0.03);
      const amount = roundMoney(base + gst);
      form.setValue('gst_3_percent', gst);
      form.setValue('amount_paid', amount, { shouldValidate: true });
      setInputText((prev) => ({ ...prev, amount: toInputText(amount) }));
    }
  };

  // Bidirectional link: When weight changes, update amount paid and GST
  const handleWeightChange = (newWeightStr: string) => {
    const weight = parseFloat(newWeightStr);
    form.setValue('weight_in_gram', Number.isFinite(weight) ? weight : 0, {
      shouldValidate: true,
    });
    setInputText((prev) => ({ ...prev, weight: newWeightStr }));

    const rate = Number(form.getValues('rate_per_gram')) || 0;
    if (Number.isFinite(weight) && weight > 0 && rate > 0) {
      const base = weight * rate;
      const gst = roundMoney(base * 0.03);
      const amount = roundMoney(base + gst);
      form.setValue('gst_3_percent', gst);
      form.setValue('amount_paid', amount, { shouldValidate: true });
      setInputText((prev) => ({ ...prev, amount: toInputText(amount) }));
    }
  };

  // Bidirectional link: When amount changes, update weight and GST
  const handleAmountChange = (newAmountStr: string) => {
    const amount = parseFloat(newAmountStr);
    form.setValue('amount_paid', Number.isFinite(amount) ? amount : 0, { shouldValidate: true });
    setInputText((prev) => ({ ...prev, amount: newAmountStr }));

    const rate = Number(form.getValues('rate_per_gram')) || 0;
    if (Number.isFinite(amount) && amount > 0 && rate > 0) {
      const base = amount / 1.03;
      const gst = roundMoney(amount - base);
      const calculatedWeight = Number((base / rate).toFixed(3));
      form.setValue('gst_3_percent', gst);
      form.setValue('weight_in_gram', calculatedWeight, { shouldValidate: true });
      setInputText((prev) => ({ ...prev, weight: toInputText(calculatedWeight) }));
    }
  };

  // Metal type toggle only changes the type; the user's entered values are kept
  const handleTypeSelect = (type: DigitalAssetType) => {
    form.setValue('type', type, { shouldValidate: true });
  };

  const computedBaseCost = roundMoney((Number(watchWeight) || 0) * (Number(watchRate) || 0));
  const computedGst = Number(watchGst) || roundMoney(computedBaseCost * 0.03);

  const onSubmit = async (data: CreateDigitalAssetInput) => {
    const payload: CreateDigitalAssetDto = {
      type: data.type,
      date: data.date,
      platform: data.platform,
      rate_per_gram: Number(data.rate_per_gram),
      amount_paid: Number(data.amount_paid),
      gst_3_percent: Number(data.gst_3_percent ?? computedGst),
      weight_in_gram: Number(data.weight_in_gram),
      asset_value: roundMoney(Number(data.weight_in_gram) * Number(data.rate_per_gram)),
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
      title={isEdit ? 'Edit Precious Metal Holding' : 'Log Bullion Purchase'}
      description="Record physical or digital gold and silver bullion with automated tax and weight math."
      icon={Coins}
      tone="accent"
      submitLabel={isEdit ? 'Save Changes' : 'Record Purchase'}
      size="xl"
    >
      <div className="space-y-4 text-text-primary">
        {/* Metal Choice Selector */}
        <div className="space-y-1.5">
          <span id="metal-type-label" className="text-sm font-medium text-text-secondary">
            Metal Type
          </span>
          <div
            role="radiogroup"
            aria-labelledby="metal-type-label"
            className="grid grid-cols-2 gap-3 mt-3"
          >
            <button
              type="button"
              role="radio"
              aria-checked={selectedType === 'gold'}
              onClick={() => handleTypeSelect('gold')}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl border p-3 text-left text-body-sm font-medium transition-all cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                selectedType === 'gold'
                  ? 'border-amber-500/80 bg-amber-500/10 text-text-primary shadow-xs ring-1 ring-amber-500/30'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-raised'
              )}
            >
              <Coins
                className={cn(
                  'h-5 w-5 transition-colors',
                  selectedType === 'gold' ? 'text-amber-500' : 'text-text-muted'
                )}
              />
              Gold
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={selectedType === 'silver'}
              onClick={() => handleTypeSelect('silver')}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl border p-3 text-left text-body-sm font-medium transition-all cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                selectedType === 'silver'
                  ? 'border-slate-400 bg-slate-400/10 text-text-primary shadow-xs ring-1 ring-slate-400/30'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-raised'
              )}
            >
              <Coins
                className={cn(
                  'h-5 w-5 transition-colors',
                  selectedType === 'silver' ? 'text-slate-400' : 'text-text-muted'
                )}
              />
              Silver
            </button>
          </div>
        </div>

        {/* Purchase Date & Platform */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Purchase Date" required error={form.formState.errors.date?.message}>
            <DatePicker
              date={form.watch('date') ? new Date(form.watch('date')) : undefined}
              onDateChange={(d: Date | undefined) =>
                form.setValue('date', d ? d.toISOString().slice(0, 10) : defaultDate, {
                  shouldValidate: true,
                })
              }
              placeholder="Select date"
            />
          </Field>

          <Input
            label="Platform/Provider"
            placeholder="e.g., MMTC-PAMP, SafeGold"
            leadingIcon={<Landmark size={16} />}
            required
            autoComplete="off"
            value={form.watch('platform')}
            onChange={(e) => form.setValue('platform', e.target.value, { shouldValidate: true })}
            errorMessage={form.formState.errors.platform?.message}
          />
        </div>

        {/* Rate Per Gram */}
        <Input
          label="Rate/Gram"
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          placeholder="0.00"
          required
          leadingIcon={<IndianRupee size={16} />}
          suffixText="/g"
          helperText="Price per gram before GST"
          className={NUMBER_INPUT_CLASS}
          value={inputText.rate}
          onChange={(e) => handleRateChange(e.target.value)}
          errorMessage={form.formState.errors.rate_per_gram?.message}
        />

        {/* Weight & Total Amount (Bidirectional Link) */}
        <div className="space-y-2">
          <p className="text-caption text-text-muted">
            Enter the weight or the amount paid. The other value is calculated from the rate.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Weight Acquired (Grams)"
              placeholder="0.00"
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              leadingIcon={<Scale size={16} />}
              suffixText="g"
              className={NUMBER_INPUT_CLASS}
              value={inputText.weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              errorMessage={form.formState.errors.weight_in_gram?.message}
            />

            <Input
              label="Amount Paid"
              helperText="Includes 3% GST"
              placeholder="0.00"
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              leadingIcon={<Coins size={16} />}
              className={NUMBER_INPUT_CLASS}
              value={inputText.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              errorMessage={form.formState.errors.amount_paid?.message}
            />
          </div>
        </div>

        {/* GST 3% Breakdown */}
        <Card variant="outlined" className="space-y-2 p-3">
          <p className="text-caption font-medium text-text-secondary">Purchase Summary</p>
          <ComputedValue label="Base Bullion Value" value={formatInr(computedBaseCost)} />
          <ComputedValue label="GST (3% on Bullion)" value={`+ ${formatInr(computedGst)}`} />
          <ComputedValue
            tone="primary"
            label="Net Invoice Total"
            value={formatInr(Number(watchAmount) || 0)}
          />
        </Card>
      </div>
    </FinanceFormModal>
  );
}
