'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { formatInr, roundMoney } from '@kalya/utils';
import { PieChart } from 'lucide-react';
import {
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { FinanceFormModal } from './modal';
import { cn } from '@/libs/utils';
import { MutualFundHolding } from '@/hooks/finances/use-equities';

export interface MutualFundFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding?: MutualFundHolding | null;
  onSave: (
    payload: Omit<
      MutualFundHolding,
      'id' | 'current_value' | 'gain_loss' | 'gain_loss_pct' | 'is_profit'
    >
  ) => void;
}

const CATEGORIES = [
  'Flexi Cap',
  'Large Cap',
  'Mid Cap',
  'Small Cap',
  'Index Fund',
  'ELSS',
  'Debt / Hybrid',
] as const;

const POPULAR_SCHEMES = [
  { name: 'Parag Parikh Flexi Cap Fund - Direct Growth', category: 'Flexi Cap', nav: 84.15 },
  { name: 'UTI Nifty 50 Index Fund - Direct Growth', category: 'Index Fund', nav: 182.6 },
  { name: 'Mirae Asset Large Cap Fund - Direct Growth', category: 'Large Cap', nav: 118.9 },
  { name: 'Quant Small Cap Fund - Direct Growth', category: 'Small Cap', nav: 278.4 },
  { name: 'HDFC Mid-Cap Opportunities Fund - Direct Growth', category: 'Mid Cap', nav: 194.2 },
];

export function MutualFundForm({ open, onOpenChange, holding, onSave }: MutualFundFormProps) {
  const isEdit = Boolean(holding);
  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const form = useForm({
    defaultValues: {
      scheme_name: holding?.scheme_name || 'Parag Parikh Flexi Cap Fund - Direct Growth',
      category: holding?.category || 'Flexi Cap',
      folio_number: holding?.folio_number || '',
      purchase_date: holding?.purchase_date
        ? String(holding.purchase_date).slice(0, 10)
        : defaultDate,
      units: holding?.units || 100,
      avg_nav: holding?.avg_nav || 75.0,
      current_nav: holding?.current_nav || 84.15,
      invested_amount: holding?.invested_amount || 7500,
      is_sip: holding?.is_sip ?? true,
      sip_amount: holding?.sip_amount || 5000,
      returns_xirr: holding?.returns_xirr || 18.5,
      day_change_pct: holding?.day_change_pct || 0.5,
    },
  });

  const watchScheme = useWatch({ control: form.control, name: 'scheme_name' });
  const watchUnits = useWatch({ control: form.control, name: 'units' });
  const watchAvgNav = useWatch({ control: form.control, name: 'avg_nav' });
  const watchCurrentNav = useWatch({ control: form.control, name: 'current_nav' });
  const watchIsSip = useWatch({ control: form.control, name: 'is_sip' });

  useEffect(() => {
    if (holding) {
      form.reset({
        scheme_name: holding.scheme_name,
        category: holding.category,
        folio_number: holding.folio_number || '',
        purchase_date: String(holding.purchase_date).slice(0, 10),
        units: holding.units,
        avg_nav: holding.avg_nav,
        current_nav: holding.current_nav,
        invested_amount: holding.invested_amount,
        is_sip: holding.is_sip,
        sip_amount: holding.sip_amount || 5000,
        returns_xirr: holding.returns_xirr || 18.5,
        day_change_pct: holding.day_change_pct || 0.5,
      });
    } else {
      form.reset({
        scheme_name: 'Parag Parikh Flexi Cap Fund - Direct Growth',
        category: 'Flexi Cap',
        folio_number: '',
        purchase_date: defaultDate,
        units: 100,
        avg_nav: 75.0,
        current_nav: 84.15,
        invested_amount: 7500,
        is_sip: true,
        sip_amount: 5000,
        returns_xirr: 18.5,
        day_change_pct: 0.5,
      });
    }
  }, [holding, defaultDate, form]);

  const handleSelectQuickScheme = (scheme: (typeof POPULAR_SCHEMES)[0]) => {
    form.setValue('scheme_name', scheme.name);
    form.setValue('category', scheme.category as any);
    form.setValue('current_nav', scheme.nav);
    form.setValue('avg_nav', roundMoney(scheme.nav * 0.9));
    const units = Number(form.getValues('units')) || 100;
    form.setValue('invested_amount', roundMoney(units * scheme.nav * 0.9));
  };

  const computedInvested = roundMoney((Number(watchUnits) || 0) * (Number(watchAvgNav) || 0));
  const computedCurrentValue = roundMoney(
    (Number(watchUnits) || 0) * (Number(watchCurrentNav) || 0)
  );
  const computedGain = roundMoney(computedCurrentValue - computedInvested);
  const computedGainPct =
    computedInvested > 0 ? roundMoney((computedGain / computedInvested) * 100) : 0;

  const onSubmit = (data: any) => {
    onSave({
      scheme_name: data.scheme_name.trim(),
      category: data.category,
      folio_number: data.folio_number?.trim() || undefined,
      purchase_date: data.purchase_date,
      units: Number(data.units),
      avg_nav: Number(data.avg_nav),
      current_nav: Number(data.current_nav),
      invested_amount: roundMoney(Number(data.units) * Number(data.avg_nav)),
      is_sip: Boolean(data.is_sip),
      sip_amount: data.is_sip ? Number(data.sip_amount) || undefined : undefined,
      returns_xirr: Number(data.returns_xirr) || 15.0,
      day_change_pct: Number(data.day_change_pct) || 0.4,
    });
    onOpenChange(false);
  };

  return (
    <FinanceFormModal
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      onSubmit={onSubmit}
      title={isEdit ? 'Edit Mutual Fund Holding' : 'Add Mutual Fund Holding'}
      description="Track equity mutual fund schemes, SIP flows, unit allocations, and current NAVs."
      icon={PieChart}
      tone="accent"
      submitLabel={isEdit ? 'Save Holding' : 'Add Mutual Fund'}
      size="md"
    >
      <div className="space-y-4 text-text-primary">
        {/* Scheme Name */}
        <Field label="Fund / Scheme Name" required>
          <Input
            placeholder="E.g., Parag Parikh Flexi Cap Fund"
            {...form.register('scheme_name', { required: true })}
          />
        </Field>

        {/* Quick Suggestion Chips */}
        {!isEdit && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Popular Direct Plans
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.name}
                  type="button"
                  onClick={() => handleSelectQuickScheme(scheme)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer',
                    watchScheme === scheme.name
                      ? 'border-primary bg-primary text-text-inverse font-semibold'
                      : 'border-border bg-surface-raised hover:bg-surface text-text-secondary hover:text-text-primary'
                  )}
                >
                  {scheme.name.split(' - ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category & Folio */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Scheme Category" required>
            <Select
              value={form.watch('category')}
              onValueChange={(val) => form.setValue('category', val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Folio Number (Optional)">
            <Input placeholder="E.g., 12948201/01" {...form.register('folio_number')} />
          </Field>
        </div>

        {/* Units & Purchase NAV */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Units Held" required>
            <Input
              type="number"
              step="any"
              className="font-numeric"
              placeholder="0.000"
              {...form.register('units', {
                valueAsNumber: true,
                onChange: (e) => {
                  const u = parseFloat(e.target.value);
                  const nav = Number(form.getValues('avg_nav')) || 0;
                  if (u > 0 && nav > 0) {
                    form.setValue('invested_amount', roundMoney(u * nav));
                  }
                },
              })}
            />
          </Field>

          <Field label="Avg Purchase NAV (₹)" required>
            <Input
              type="number"
              step="any"
              className="font-numeric"
              placeholder="0.00"
              {...form.register('avg_nav', {
                valueAsNumber: true,
                onChange: (e) => {
                  const nav = parseFloat(e.target.value);
                  const u = Number(form.getValues('units')) || 0;
                  if (u > 0 && nav > 0) {
                    form.setValue('invested_amount', roundMoney(u * nav));
                  }
                },
              })}
            />
          </Field>

          <Field label="Current NAV (₹)" required>
            <Input
              type="number"
              step="any"
              className="font-numeric"
              placeholder="0.00"
              {...form.register('current_nav', { valueAsNumber: true })}
            />
          </Field>
        </div>

        {/* SIP Switch & Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="First Investment Date" required>
            <DatePicker
              date={form.watch('purchase_date') ? new Date(form.watch('purchase_date')) : undefined}
              onDateChange={(d: Date | undefined) =>
                form.setValue('purchase_date', d ? d.toISOString().slice(0, 10) : defaultDate)
              }
              placeholder="Select date"
            />
          </Field>

          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised/40 p-3">
              <div>
                <div className="text-body-xs font-semibold text-text-primary">
                  Monthly SIP Active
                </div>
                <div className="text-caption text-text-muted">Auto recurring deduction</div>
              </div>
              <Switch
                checked={watchIsSip}
                onCheckedChange={(checked) => form.setValue('is_sip', checked)}
              />
            </div>
          </div>
        </div>

        {watchIsSip && (
          <Field label="Monthly SIP Amount (₹)">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                ₹
              </span>
              <Input
                type="number"
                step="100"
                className="pl-7 font-numeric"
                placeholder="5000"
                {...form.register('sip_amount', { valueAsNumber: true })}
              />
            </div>
          </Field>
        )}

        {/* Valuation Summary Banner */}
        <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-3">
          <div className="flex items-center justify-between text-body-xs text-text-secondary">
            <span>Total Invested</span>
            <span className="font-numeric font-medium text-text-primary">
              ₹{formatInr(computedInvested)}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-body-xs text-text-secondary">
            <span>Current Value</span>
            <span className="font-numeric font-medium text-text-primary">
              ₹{formatInr(computedCurrentValue)}
            </span>
          </div>

          <div className="my-2 border-t border-border/60" />

          <div className="flex items-center justify-between text-body-sm font-semibold">
            <span>Unrealized Gain / Return</span>
            <span
              className={cn('font-numeric', computedGain >= 0 ? 'text-success' : 'text-danger')}
            >
              {computedGain >= 0 ? '+' : ''}₹{formatInr(computedGain)} ({computedGainPct}%)
            </span>
          </div>
        </div>
      </div>
    </FinanceFormModal>
  );
}
