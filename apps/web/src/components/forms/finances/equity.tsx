'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { Building2, Hash, IndianRupee, TrendingUp } from 'lucide-react';
import { Card, Field, Input, RadioCard, RadioGroup } from '@/components/ui';
import { DatePicker } from '@/components/ui/forms/date-picker';
import { FinanceFormModal } from './modal';
import { STOCK_MARKET_DATA } from '@/hooks/finances/use-equities';
import { ComputedValue } from '@/components/shared';

const NUMBER_INPUT_CLASS =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

const toInputText = (value: number | string | null | undefined) => {
  const n = Number(value) || 0;
  return n > 0 ? String(n) : '';
};

export interface EquityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: EquityAsset | null;
  onSave: (payload: CreateEquityAssetDto | UpdateEquityAssetDto) => Promise<void>;
  defaultExchange?: ExchangeType;
  defaultCompany?: string;
}

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

  const [watchCompany, watchPrice, watchShares, watchExchange] = useWatch({
    control: form.control,
    name: ['company', 'price_per_share', 'total_shared', 'exchange_type'],
  });

  // Text shown in the number inputs. The form itself only ever stores numbers.
  const [inputText, setInputText] = useState({
    price: toInputText(asset?.price_per_share || 1285.5),
    shares: toInputText(asset?.total_shared || 10),
  });

  // Sync form values when the modal opens or when asset / defaults change
  useEffect(() => {
    if (!open) return;

    if (asset) {
      form.reset({
        exchange_type: asset.exchange_type as ExchangeType,
        date: String(asset.date).slice(0, 10),
        company: asset.company,
        price_per_share: Number(asset.price_per_share),
        total_shared: Number(asset.total_shared),
        total_amount: Number(asset.total_amount),
      });
      setInputText({
        price: toInputText(asset.price_per_share),
        shares: toInputText(asset.total_shared),
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
      setInputText({ price: toInputText(price), shares: toInputText(shares) });
    }
  }, [open, asset, defaultExchange, defaultCompany, defaultDate, form]);

  // Price changes: keep shares, recalculate total
  const handlePriceChange = (newPriceStr: string) => {
    const parsed = parseFloat(newPriceStr);
    const price = Number.isFinite(parsed) ? parsed : 0;
    const shares = Number(form.getValues('total_shared')) || 0;

    form.setValue('price_per_share', price, { shouldValidate: true });
    form.setValue('total_amount', roundMoney(price * shares));
    setInputText((prev) => ({ ...prev, price: newPriceStr }));
  };

  // Shares change: keep price, recalculate total
  const handleSharesChange = (newSharesStr: string) => {
    const parsed = parseInt(newSharesStr, 10);
    const shares = Number.isFinite(parsed) ? parsed : 0;
    const price = Number(form.getValues('price_per_share')) || 0;

    form.setValue('total_shared', shares, { shouldValidate: true });
    form.setValue('total_amount', roundMoney(price * shares));
    setInputText((prev) => ({ ...prev, shares: newSharesStr }));
  };

  const handleExchangeChange = (value: string) => {
    form.setValue('exchange_type', value as ExchangeType, { shouldValidate: true });
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
      title={isEdit ? 'Edit Equity Asset' : 'Add Equity Asset'}
      description="Record listed public equities on NSE or BSE with automated purchase lot tracking."
      icon={TrendingUp}
      tone="accent"
      submitLabel={isEdit ? 'Save Changes' : 'Add Equity Asset'}
      size="md"
    >
      <div className="space-y-4 text-text-primary">
        {/* Exchange Selector */}
        <div className="space-y-1.5">
          <span id="exchange-label" className="text-sm font-medium text-text-secondary">
            Exchange
          </span>
          <RadioGroup
            aria-labelledby="exchange-label"
            value={watchExchange}
            onValueChange={handleExchangeChange}
            className="mt-3 grid-cols-2 gap-2.5 sm:gap-3"
          >
            <RadioCard
              value="NSE"
              label="NSE"
              description="National Stock Exchange"
              wrapperClassName="p-2.5 sm:p-3"
            />
            <RadioCard
              value="BSE"
              label="BSE"
              description="Bombay Stock Exchange"
              wrapperClassName="p-2.5 sm:p-3"
            />
          </RadioGroup>
        </div>

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

        {/* Company Name / Ticker */}
        <Input
          label="Company Name"
          placeholder="e.g., Reliance Industries"
          leadingIcon={<Building2 size={16} />}
          required
          autoComplete="off"
          value={watchCompany ?? ''}
          onChange={(e) => form.setValue('company', e.target.value, { shouldValidate: true })}
          errorMessage={form.formState.errors.company?.message}
        />

        {/* Price Per Share and Number of Shares */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Buy Price per Share (₹)"
            required
            leadingIcon={<IndianRupee size={16} />}
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            className={`${NUMBER_INPUT_CLASS} font-numeric`}
            placeholder="0.00"
            value={inputText.price}
            onChange={(e) => handlePriceChange(e.target.value)}
            errorMessage={form.formState.errors.price_per_share?.message}
          />

          <Input
            label="Number of Shares"
            required
            leadingIcon={<Hash size={16} />}
            type="number"
            inputMode="numeric"
            step={1}
            min={0}
            className={`${NUMBER_INPUT_CLASS} font-numeric`}
            placeholder="1"
            value={inputText.shares}
            onChange={(e) => handleSharesChange(e.target.value)}
            errorMessage={form.formState.errors.total_shared?.message}
          />
        </div>

        {/* Auto Calculated Total Amount Summary */}
        <Card variant="outlined" className="space-y-2 p-3 sm:p-3.5">
          <p className="text-caption font-medium text-text-secondary">Investment Summary</p>
          <ComputedValue
            label={`${Number(watchShares) || 0} shares @ ${formatInr(Number(watchPrice) || 0)}`}
            value={formatInr(computedTotal)}
          />
          <ComputedValue
            tone="primary"
            label="Total Investment Value"
            value={formatInr(computedTotal)}
          />
        </Card>
      </div>
    </FinanceFormModal>
  );
}
