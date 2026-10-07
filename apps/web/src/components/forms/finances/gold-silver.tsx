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
import {
  Calendar,
  CheckCircle2,
  Coins,
  Compass,
  CreditCard,
  HelpCircle,
  IndianRupee,
  Layers,
  Scale,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { FinanceFormModal } from './modal';
import { cn } from '@/libs/utils';
import { DEFAULT_MARKET_RATES } from '@/hooks/finances/use-gold-silver';

export interface GoldSilverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: DigitalAsset | null;
  onSave: (payload: CreateDigitalAssetDto | UpdateDigitalAssetDto) => Promise<void>;
  defaultType?: DigitalAssetType;
}

const POPULAR_PLATFORMS = [
  'MMTC-PAMP',
  'Jar',
  'Tanishq Digital',
  'Safegold',
  'Augmont',
  'Groww',
  'Zerodha Coin',
  'Paytm Gold',
  'Jeweller (Physical)',
];

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
      rate_per_gram: Number(
        asset?.rate_per_gram ||
          (defaultType === 'gold' ? DEFAULT_MARKET_RATES.gold : DEFAULT_MARKET_RATES.silver)
      ),
      amount_paid: Number(asset?.amount_paid || (defaultType === 'gold' ? 7880 : 4870)),
      weight_in_gram: Number(asset?.weight_in_gram || (defaultType === 'gold' ? 1 : 50)),
      gst_3_percent: Number(asset?.gst_3_percent || 0),
    },
  });

  const selectedType = useWatch({ control: form.control, name: 'type' });
  const watchRate = useWatch({ control: form.control, name: 'rate_per_gram' });
  const watchAmount = useWatch({ control: form.control, name: 'amount_paid' });
  const watchWeight = useWatch({ control: form.control, name: 'weight_in_gram' });
  const watchGst = useWatch({ control: form.control, name: 'gst_3_percent' });

  // Custom platform state if user picks "Other"
  const [customPlatform, setCustomPlatform] = useState('');
  const [isCustomPlatform, setIsCustomPlatform] = useState(false);

  // Sync form default values when asset or defaultType changes
  useEffect(() => {
    if (asset) {
      form.reset({
        type: asset.type as DigitalAssetType,
        date: String(asset.date).slice(0, 10),
        platform: asset.platform,
        rate_per_gram: Number(asset.rate_per_gram),
        amount_paid: Number(asset.amount_paid),
        weight_in_gram: Number(asset.weight_in_gram),
        gst_3_percent: Number(asset.gst_3_percent),
      });
      setIsCustomPlatform(!POPULAR_PLATFORMS.includes(asset.platform));
    } else {
      const type = defaultType;
      const initialRate = type === 'gold' ? DEFAULT_MARKET_RATES.gold : DEFAULT_MARKET_RATES.silver;
      const initialWeight = type === 'gold' ? 1 : 50;
      const baseCost = initialWeight * initialRate;
      const gst = roundMoney(baseCost * 0.03);
      form.reset({
        type,
        date: defaultDate,
        platform: 'Jar',
        rate_per_gram: initialRate,
        weight_in_gram: initialWeight,
        amount_paid: roundMoney(baseCost + gst),
        gst_3_percent: gst,
      });
      setIsCustomPlatform(false);
    }
  }, [asset, defaultType, defaultDate, form]);

  // Quick action: use benchmark market rate
  const handleUseMarketRate = () => {
    const rate = selectedType === 'gold' ? DEFAULT_MARKET_RATES.gold : DEFAULT_MARKET_RATES.silver;
    form.setValue('rate_per_gram', rate, { shouldValidate: true });
    // Recalculate amount from existing weight
    const weight = Number(form.getValues('weight_in_gram')) || 0;
    if (weight > 0) {
      const base = weight * rate;
      const gst = roundMoney(base * 0.03);
      form.setValue('gst_3_percent', gst);
      form.setValue('amount_paid', roundMoney(base + gst), { shouldValidate: true });
    }
  };

  // Bidirectional link: When weight changes, update amount paid and GST
  const handleWeightChange = (newWeightStr: string) => {
    const weight = parseFloat(newWeightStr);
    const rate = Number(form.getValues('rate_per_gram')) || 0;
    if (Number.isFinite(weight) && weight > 0 && rate > 0) {
      const base = weight * rate;
      const gst = roundMoney(base * 0.03);
      form.setValue('gst_3_percent', gst);
      form.setValue('amount_paid', roundMoney(base + gst), { shouldValidate: true });
    }
  };

  // Bidirectional link: When amount changes, update weight
  const handleAmountChange = (newAmountStr: string) => {
    const amount = parseFloat(newAmountStr);
    const rate = Number(form.getValues('rate_per_gram')) || 0;
    if (Number.isFinite(amount) && amount > 0 && rate > 0) {
      const base = amount / 1.03;
      const gst = roundMoney(amount - base);
      const calculatedWeight = roundMoney(base / rate);
      form.setValue('gst_3_percent', gst);
      form.setValue('weight_in_gram', calculatedWeight, { shouldValidate: true });
    }
  };

  // When metal type toggles, suggest appropriate rate
  const handleTypeSelect = (type: DigitalAssetType) => {
    form.setValue('type', type);
    const newRate = type === 'gold' ? DEFAULT_MARKET_RATES.gold : DEFAULT_MARKET_RATES.silver;
    form.setValue('rate_per_gram', newRate);
    const newWeight = type === 'gold' ? 1 : 50;
    form.setValue('weight_in_gram', newWeight);
    const base = newWeight * newRate;
    const gst = roundMoney(base * 0.03);
    form.setValue('gst_3_percent', gst);
    form.setValue('amount_paid', roundMoney(base + gst));
  };

  const currentMarketRate =
    selectedType === 'gold' ? DEFAULT_MARKET_RATES.gold : DEFAULT_MARKET_RATES.silver;
  const computedBaseCost = roundMoney((Number(watchWeight) || 0) * (Number(watchRate) || 0));
  const computedGst = Number(watchGst) || roundMoney(computedBaseCost * 0.03);
  const estimatedMarketValue = roundMoney((Number(watchWeight) || 0) * currentMarketRate);
  const estimatedDiff = roundMoney(estimatedMarketValue - (Number(watchAmount) || 0));

  const onSubmit = async (data: CreateDigitalAssetInput) => {
    const finalPlatform =
      isCustomPlatform && customPlatform.trim() ? customPlatform.trim() : data.platform;
    const payload: CreateDigitalAssetDto = {
      type: data.type,
      date: data.date,
      platform: finalPlatform,
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
          <label className="text-caption font-medium text-text-secondary">Metal Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeSelect('gold')}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer',
                selectedType === 'gold'
                  ? 'border-amber-500/80 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/30'
                  : 'border-border bg-surface hover:bg-surface-raised'
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 shadow-inner">
                <Coins className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-body-sm font-semibold text-text-primary">
                  Gold (24K 99.9%)
                </div>
                <div className="text-caption text-text-muted">
                  ₹{formatInr(DEFAULT_MARKET_RATES.gold)}/g live
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTypeSelect('silver')}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer',
                selectedType === 'silver'
                  ? 'border-slate-400 bg-slate-400/10 shadow-xs ring-1 ring-slate-400/30'
                  : 'border-border bg-surface hover:bg-surface-raised'
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-400/20 text-slate-300 shadow-inner">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-body-sm font-semibold text-text-primary">
                  Silver (999 Fine)
                </div>
                <div className="text-caption text-text-muted">
                  ₹{DEFAULT_MARKET_RATES.silver.toFixed(2)}/g live
                </div>
              </div>
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

          <Field label="Platform / Vault" required error={form.formState.errors.platform?.message}>
            {!isCustomPlatform ? (
              <Select
                value={form.watch('platform')}
                onValueChange={(val) => {
                  if (val === 'OTHER') {
                    setIsCustomPlatform(true);
                  } else {
                    form.setValue('platform', val, { shouldValidate: true });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                  <SelectItem value="OTHER">Custom / Local Jeweller</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-1.5">
                <Input
                  placeholder="Enter provider name"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomPlatform(false)}
                >
                  List
                </Button>
              </div>
            )}
          </Field>
        </div>

        {/* Rate Per Gram with Quick-fill helper */}
        <Field
          label={
            <div className="flex items-center justify-between w-full">
              <span>Rate Per Gram (₹/g)</span>
              <button
                type="button"
                onClick={handleUseMarketRate}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
              >
                <TrendingUp className="h-3 w-3" />
                Today&apos;s Rate (₹
                {selectedType === 'gold' ? DEFAULT_MARKET_RATES.gold : DEFAULT_MARKET_RATES.silver})
              </button>
            </div>
          }
          required
          error={form.formState.errors.rate_per_gram?.message}
        >
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              ₹
            </span>
            <Input
              type="number"
              step="any"
              className="pl-7 font-numeric"
              placeholder="0.00"
              {...form.register('rate_per_gram', {
                valueAsNumber: true,
                onChange: (e) => {
                  const r = parseFloat(e.target.value);
                  const w = Number(form.getValues('weight_in_gram')) || 0;
                  if (r > 0 && w > 0) {
                    const base = r * w;
                    const gst = roundMoney(base * 0.03);
                    form.setValue('gst_3_percent', gst);
                    form.setValue('amount_paid', roundMoney(base + gst));
                  }
                },
              })}
            />
          </div>
        </Field>

        {/* Weight & Total Amount (Bidirectional Link) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Weight Acquired (Grams)"
            required
            error={form.formState.errors.weight_in_gram?.message}
            description="Auto-fills Amount Paid"
          >
            <div className="relative">
              <Input
                type="number"
                step="any"
                className="font-numeric pr-10"
                placeholder="0.00"
                {...form.register('weight_in_gram', {
                  valueAsNumber: true,
                  onChange: (e) => handleWeightChange(e.target.value),
                })}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-caption font-medium text-text-muted">
                grams
              </span>
            </div>
          </Field>

          <Field
            label="Total Amount Paid (₹)"
            required
            error={form.formState.errors.amount_paid?.message}
            description="Includes 3% GST"
          >
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                ₹
              </span>
              <Input
                type="number"
                step="any"
                className="pl-7 font-numeric"
                placeholder="0.00"
                {...form.register('amount_paid', {
                  valueAsNumber: true,
                  onChange: (e) => handleAmountChange(e.target.value),
                })}
              />
            </div>
          </Field>
        </div>

        {/* GST 3% Breakdown / Editable */}
        <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-3">
          <div className="flex items-center justify-between text-body-xs">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <Scale className="h-3.5 w-3.5 text-text-muted" />
              Base Bullion Value
            </span>
            <span className="font-numeric font-medium text-text-primary">
              ₹{formatInr(computedBaseCost)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-body-xs">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <CreditCard className="h-3.5 w-3.5 text-text-muted" />
              GST (3% on Bullion)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-numeric font-medium text-text-primary">
                + ₹{formatInr(computedGst)}
              </span>
            </div>
          </div>

          <div className="my-2 border-t border-border/60" />

          <div className="flex items-center justify-between text-body-sm font-semibold">
            <span className="text-text-primary">Net Invoice Total</span>
            <span className="font-numeric text-primary">
              ₹{formatInr(Number(watchAmount) || 0)}
            </span>
          </div>

          {/* Current Valuation Comparison */}
          {Number(watchWeight) > 0 && (
            <div className="mt-2.5 rounded-lg bg-surface p-2 text-caption flex items-center justify-between border border-border/60">
              <span className="text-text-muted">Current Valuation @ ₹{currentMarketRate}/g:</span>
              <span
                className={cn(
                  'font-numeric font-semibold',
                  estimatedDiff >= 0 ? 'text-success' : 'text-danger'
                )}
              >
                ₹{formatInr(estimatedMarketValue)} ({estimatedDiff >= 0 ? '+' : ''}
                {formatInr(estimatedDiff)})
              </span>
            </div>
          )}
        </div>
      </div>
    </FinanceFormModal>
  );
}
