'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateEquityAssetDto,
  EquityAsset,
  ExchangeType,
  UpdateEquityAssetDto,
} from '@kalya/types';
import { CreateEquityAssetInput, CreateEquityAssetSchema } from '@kalya/validations';
import { formatInr, roundMoney } from '@kalya/utils';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Hash,
  IndianRupee,
  Layers,
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
import { STOCK_MARKET_DATA } from '@/hooks/finances/use-equities';

export interface EquityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: EquityAsset | null;
  onSave: (payload: CreateEquityAssetDto | UpdateEquityAssetDto) => Promise<void>;
  defaultExchange?: ExchangeType;
  defaultCompany?: string;
}

const POPULAR_STOCKS = [
  { name: 'Reliance Industries', symbol: 'RELIANCE', price: 1285.5 },
  { name: 'Tata Consultancy Services', symbol: 'TCS', price: 4210.0 },
  { name: 'HDFC Bank', symbol: 'HDFCBANK', price: 1675.25 },
  { name: 'Infosys', symbol: 'INFY', price: 1890.75 },
  { name: 'Tata Motors', symbol: 'TATAMOTORS', price: 945.0 },
  { name: 'Larsen & Toubro', symbol: 'LT', price: 3580.0 },
  { name: 'ITC', symbol: 'ITC', price: 512.4 },
  { name: 'ICICI Bank', symbol: 'ICICIBANK', price: 1240.0 },
];

export function EquityForm({
  open,
  onOpenChange,
  asset,
  onSave,
  defaultExchange = 'NSE',
  defaultCompany,
}: EquityFormProps) {
  const isEdit = Boolean(asset);

  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const form = useForm<CreateEquityAssetInput>({
    resolver: zodResolver(CreateEquityAssetSchema as any),
    defaultValues: {
      exchange_type: (asset?.exchange_type as ExchangeType) || defaultExchange,
      date: asset?.date ? String(asset.date).slice(0, 10) : defaultDate,
      company: asset?.company || defaultCompany || 'Reliance Industries',
      price_per_share: Number(asset?.price_per_share || 1285.5),
      total_shared: Number(asset?.total_shared || 10),
      total_amount: Number(asset?.total_amount || 12855.0),
    },
  });

  const watchCompany = useWatch({ control: form.control, name: 'company' });
  const watchPrice = useWatch({ control: form.control, name: 'price_per_share' });
  const watchShares = useWatch({ control: form.control, name: 'total_shared' });
  const watchExchange = useWatch({ control: form.control, name: 'exchange_type' });

  // Sync form defaults when asset or defaultCompany changes
  useEffect(() => {
    if (asset) {
      form.reset({
        exchange_type: asset.exchange_type as ExchangeType,
        date: String(asset.date).slice(0, 10),
        company: asset.company,
        price_per_share: Number(asset.price_per_share),
        total_shared: Number(asset.total_shared),
        total_amount: Number(asset.total_amount),
      });
    } else {
      const company = defaultCompany || 'Reliance Industries';
      const quote = STOCK_MARKET_DATA[company];
      const price = quote?.currentPrice || 1285.5;
      const shares = 10;
      form.reset({
        exchange_type: defaultExchange,
        date: defaultDate,
        company,
        price_per_share: price,
        total_shared: shares,
        total_amount: roundMoney(price * shares),
      });
    }
  }, [asset, defaultExchange, defaultCompany, defaultDate, form]);

  // Quick chip click: selects company & autofills benchmark price
  const handleSelectQuickStock = (stock: (typeof POPULAR_STOCKS)[0]) => {
    form.setValue('company', stock.name, { shouldValidate: true });
    form.setValue('price_per_share', stock.price, { shouldValidate: true });
    const shares = Number(form.getValues('total_shared')) || 10;
    form.setValue('total_amount', roundMoney(stock.price * shares));
  };

  const computedTotal = roundMoney((Number(watchPrice) || 0) * (Number(watchShares) || 0));

  const onSubmit = async (data: CreateEquityAssetInput) => {
    const payload: CreateEquityAssetDto = {
      exchange_type: data.exchange_type,
      date: data.date,
      company: data.company.trim(),
      price_per_share: Number(data.price_per_share),
      total_shared: Number(data.total_shared),
      total_amount: roundMoney(Number(data.price_per_share) * Number(data.total_shared)),
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
      title={isEdit ? 'Edit Stock Lot' : 'Add Stock Holding / Lot'}
      description="Record listed public equities on NSE or BSE with automated purchase lot tracking."
      icon={TrendingUp}
      tone="accent"
      submitLabel={isEdit ? 'Save Lot' : 'Add Stock Lot'}
      size="xl"
    >
      <div className="space-y-4 text-text-primary">
        {/* Exchange Selector */}
        <div className="space-y-1.5">
          <label className="text-caption font-medium text-text-secondary">Stock Exchange</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => form.setValue('exchange_type', 'NSE')}
              className={cn(
                'group flex items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer',
                watchExchange === 'NSE'
                  ? 'border-primary bg-primary-subtle shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface hover:bg-surface-raised'
              )}
            >
              <div>
                <div className="font-display text-body-sm font-semibold text-text-primary">
                  NSE (National)
                </div>
                <div className="text-caption text-text-muted">NIFTY 50 Benchmark</div>
              </div>
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  watchExchange === 'NSE' ? 'bg-primary' : 'bg-border'
                )}
              />
            </button>

            <button
              type="button"
              onClick={() => form.setValue('exchange_type', 'BSE')}
              className={cn(
                'group flex items-center justify-between rounded-xl border p-3 text-left transition-all cursor-pointer',
                watchExchange === 'BSE'
                  ? 'border-primary bg-primary-subtle shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface hover:bg-surface-raised'
              )}
            >
              <div>
                <div className="font-display text-body-sm font-semibold text-text-primary">
                  BSE (Bombay)
                </div>
                <div className="text-caption text-text-muted">SENSEX Benchmark</div>
              </div>
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  watchExchange === 'BSE' ? 'bg-primary' : 'bg-border'
                )}
              />
            </button>
          </div>
        </div>

        {/* Company Name / Ticker */}
        <Field
          label="Company Name or Symbol"
          required
          error={form.formState.errors.company?.message}
          description="E.g., Reliance Industries, TCS, HDFC Bank"
        >
          <Input placeholder="Search or enter company name" {...form.register('company')} />
        </Field>

        {/* Quick Suggestion Chips */}
        {!isEdit && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Popular Stocks
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_STOCKS.slice(0, 6).map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => handleSelectQuickStock(stock)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-caption font-medium transition-colors cursor-pointer',
                    watchCompany === stock.name
                      ? 'border-primary bg-primary text-text-inverse font-semibold'
                      : 'border-border bg-surface-raised hover:bg-surface text-text-secondary hover:text-text-primary'
                  )}
                >
                  {stock.symbol}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Purchase Date */}
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

        {/* Price Per Share and Number of Shares */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Buy Price per Share (₹)"
            required
            error={form.formState.errors.price_per_share?.message}
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
                {...form.register('price_per_share', {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const p = parseFloat(e.target.value);
                    const s = Number(form.getValues('total_shared')) || 0;
                    if (p > 0 && s > 0) {
                      form.setValue('total_amount', roundMoney(p * s));
                    }
                  },
                })}
              />
            </div>
          </Field>

          <Field
            label="Number of Shares"
            required
            error={form.formState.errors.total_shared?.message}
          >
            <div className="relative">
              <Input
                type="number"
                step="1"
                min="1"
                className="font-numeric pr-12"
                placeholder="1"
                {...form.register('total_shared', {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const s = parseInt(e.target.value, 10);
                    const p = Number(form.getValues('price_per_share')) || 0;
                    if (s > 0 && p > 0) {
                      form.setValue('total_amount', roundMoney(p * s));
                    }
                  },
                })}
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-caption font-medium text-text-muted">
                qty
              </span>
            </div>
          </Field>
        </div>

        {/* Auto Calculated Total Amount Summary */}
        <div className="rounded-xl border border-border/80 bg-surface-raised/40 p-3">
          <div className="flex items-center justify-between text-body-xs text-text-secondary">
            <span>Holding Summary</span>
            <span className="font-numeric">
              {Number(watchShares) || 0} shares @ ₹{Number(watchPrice) || 0}
            </span>
          </div>

          <div className="my-2 border-t border-border/60" />

          <div className="flex items-center justify-between text-body-sm font-semibold">
            <span className="text-text-primary">Total Investment Value</span>
            <span className="font-numeric text-primary text-body-md">
              ₹{formatInr(computedTotal)}
            </span>
          </div>
        </div>
      </div>
    </FinanceFormModal>
  );
}
