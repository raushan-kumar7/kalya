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
import { NotFoundError } from '@/errors';
import { calculateDigitalAssetValuation, calculateEquityValuation, roundMoney } from '@kalya/utils';

export class AssetService extends BaseFinanceService {
  private mapDigitalRow(r: typeof digitalAsset.$inferSelect) {
    return {
      ...r,
      user_id: r.userId,
      rate_per_gram: r.ratePerGram,
      amount_paid: r.amountPaid,
      gst_3_percent: r.gst3Percent,
      weight_in_gram: r.weightInGram,
      asset_value: r.assetValue,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    };
  }

  // Digital Commodity Assets
  async listDigitalAssets(userId: string, query: DigitalAssetFilterQueryDto) {
    const conditions = [eq(digitalAsset.userId, userId)];
    if (query.type) conditions.push(eq(digitalAsset.type, query.type as any));
    if (query.platform) conditions.push(eq(digitalAsset.platform, query.platform));

    const rows = await this.db
      .select()
      .from(digitalAsset)
      .where(and(...conditions));

    return rows.map((r) => this.mapDigitalRow(r));
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

    return this.mapDigitalRow(created);
  }

  async updateDigitalAsset(userId: string, id: string, dto: UpdateDigitalAssetDto) {
    const updateData: Record<string, unknown> = {};
    if (dto.type !== undefined) updateData.type = dto.type as any;
    if (dto.date !== undefined) updateData.date = dto.date;
    if (dto.platform !== undefined) updateData.platform = dto.platform;
    if (dto.rate_per_gram !== undefined) updateData.ratePerGram = roundMoney(dto.rate_per_gram);
    if (dto.amount_paid !== undefined) updateData.amountPaid = roundMoney(dto.amount_paid);
    if (dto.gst_3_percent !== undefined) updateData.gst3Percent = roundMoney(dto.gst_3_percent);
    if (dto.weight_in_gram !== undefined) updateData.weightInGram = dto.weight_in_gram;
    if (dto.asset_value !== undefined) updateData.assetValue = roundMoney(dto.asset_value);

    const [updated] = await this.db
      .update(digitalAsset)
      .set(updateData)
      .where(and(eq(digitalAsset.id, id), eq(digitalAsset.userId, userId)))
      .returning();

    if (!updated) {
      throw new NotFoundError('Digital asset record not found');
    }

    return this.mapDigitalRow(updated);
  }

  async deleteDigitalAsset(userId: string, id: string) {
    const [deleted] = await this.db
      .delete(digitalAsset)
      .where(and(eq(digitalAsset.id, id), eq(digitalAsset.userId, userId)))
      .returning();

    if (!deleted) {
      throw new NotFoundError('Digital asset record not found');
    }

    return { success: true, id: deleted.id };
  }

  private mapEquityRow(r: typeof equityAsset.$inferSelect) {
    return {
      ...r,
      user_id: r.userId,
      exchange_type: r.exchangeType,
      price_per_share: r.pricePerShare,
      total_shared: r.totalShared,
      total_amount: r.totalAmount,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    };
  }

  // Equity Shares
  async listEquityAssets(userId: string, query: EquityAssetFilterQueryDto) {
    const conditions = [eq(equityAsset.userId, userId)];
    if (query.exchange_type)
      conditions.push(eq(equityAsset.exchangeType, query.exchange_type as any));
    if (query.company) conditions.push(eq(equityAsset.company, query.company));

    const rows = await this.db
      .select()
      .from(equityAsset)
      .where(and(...conditions));

    return rows.map((r) => this.mapEquityRow(r));
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

    return this.mapEquityRow(created);
  }

  async updateEquityAsset(userId: string, id: string, dto: UpdateEquityAssetDto) {
    const updateData: Record<string, unknown> = {};
    if (dto.exchange_type !== undefined) updateData.exchangeType = dto.exchange_type as any;
    if (dto.date !== undefined) updateData.date = dto.date;
    if (dto.company !== undefined) updateData.company = dto.company;
    if (dto.price_per_share !== undefined)
      updateData.pricePerShare = roundMoney(dto.price_per_share);
    if (dto.total_shared !== undefined)
      updateData.totalShared = Math.max(1, Math.floor(dto.total_shared));
    if (dto.total_amount !== undefined) updateData.totalAmount = roundMoney(dto.total_amount);

    const [updated] = await this.db
      .update(equityAsset)
      .set(updateData)
      .where(and(eq(equityAsset.id, id), eq(equityAsset.userId, userId)))
      .returning();

    if (!updated) {
      throw new NotFoundError('Equity asset record not found');
    }

    return this.mapEquityRow(updated);
  }

  async deleteEquityAsset(userId: string, id: string) {
    const [deleted] = await this.db
      .delete(equityAsset)
      .where(and(eq(equityAsset.id, id), eq(equityAsset.userId, userId)))
      .returning();

    if (!deleted) {
      throw new NotFoundError('Equity asset record not found');
    }

    return { success: true, id: deleted.id };
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
