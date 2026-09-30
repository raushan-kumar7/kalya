import { and, eq, digitalAsset, equityAsset } from '@kalya/db';
import {
  CreateDigitalAssetDto,
  CreateEquityAssetDto,
  DigitalAssetFilterQueryDto,
  EquityAssetFilterQueryDto,
  UpdateDigitalAssetDto,
  UpdateEquityAssetDto,
} from '@kalya/types';
import { BaseFinanceService } from '../common';
import { calculateDigitalAssetValuation, calculateEquityValuation, roundMoney } from '@kalya/utils';

export class AssetService extends BaseFinanceService {
  // Digital Commodity Assets
  async listDigitalAssets(userId: string, query: DigitalAssetFilterQueryDto) {
    const conditions = [eq(digitalAsset.userId, userId)];
    if (query.type) conditions.push(eq(digitalAsset.type, query.type as any));
    if (query.platform) conditions.push(eq(digitalAsset.platform, query.platform));

    return this.db
      .select()
      .from(digitalAsset)
      .where(and(...conditions));
  }

  async createDigitalAsset(userId: string, dto: CreateDigitalAssetDto) {
    const rate = roundMoney(dto.rate_per_gram);
    const weight = dto.weight_in_gram;
    const paid = roundMoney(dto.amount_paid);
    const gst =
      dto.gst_3_percent !== undefined ? roundMoney(dto.gst_3_percent) : roundMoney(paid * 0.03);
    const value =
      dto.asset_value !== undefined
        ? roundMoney(dto.asset_value)
        : calculateDigitalAssetValuation(weight, rate);

    const [created] = await this.db
      .insert(digitalAsset)
      .values({
        userId,
        type: (dto.type ?? 'gold') as any,
        date: dto.date,
        platform: dto.platform,
        ratePerGram: rate,
        amountPaid: paid,
        gst3Percent: gst,
        weightInGram: weight,
        assetValue: value,
      })
      .returning();

    return created;
  }

  // Equity Shares
  async listEquityAssets(userId: string, query: EquityAssetFilterQueryDto) {
    const conditions = [eq(equityAsset.userId, userId)];
    if (query.exchange_type)
      conditions.push(eq(equityAsset.exchangeType, query.exchange_type as any));
    if (query.company) conditions.push(eq(equityAsset.company, query.company));

    return this.db
      .select()
      .from(equityAsset)
      .where(and(...conditions));
  }

  async createEquityAsset(userId: string, dto: CreateEquityAssetDto) {
    const price = roundMoney(dto.price_per_share);
    const shares = Math.max(1, Math.floor(dto.total_shared));
    const totalAmount =
      dto.total_amount !== undefined
        ? roundMoney(dto.total_amount)
        : calculateEquityValuation(shares, price);

    const [created] = await this.db
      .insert(equityAsset)
      .values({
        userId,
        exchangeType: (dto.exchange_type ?? 'BSE') as any,
        date: dto.date,
        company: dto.company,
        pricePerShare: price,
        totalShared: shares,
        totalAmount,
      })
      .returning();

    return created;
  }

  async getPortfolioSummary(userId: string) {
    const commodities = await this.db
      .select()
      .from(digitalAsset)
      .where(eq(digitalAsset.userId, userId));
    const equities = await this.db.select().from(equityAsset).where(eq(equityAsset.userId, userId));

    const totalCommodities = commodities.reduce((acc, c) => acc + Number(c.assetValue ?? 0), 0);
    const totalEquities = equities.reduce((acc, e) => acc + Number(e.totalAmount ?? 0), 0);

    return {
      total_commodities_value: roundMoney(totalCommodities),
      total_equities_value: roundMoney(totalEquities),
      total_portfolio_net_worth: roundMoney(totalCommodities + totalEquities),
    };
  }
}
