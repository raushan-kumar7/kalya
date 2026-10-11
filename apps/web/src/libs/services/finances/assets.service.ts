import {
  CreateDigitalAssetDto,
  CreateEquityAssetDto,
  DigitalAsset,
  DigitalAssetFilterQueryDto,
  EquityAsset,
  EquityAssetFilterQueryDto,
  UpdateDigitalAssetDto,
  UpdateEquityAssetDto,
} from '@kalya/types';
import { buildQueryString, PortfolioSummaryResponse } from './helper';
import { ENDPOINTS, http } from '@/api';

export class AssetService {
  static async listDigital(query?: DigitalAssetFilterQueryDto): Promise<DigitalAsset[]> {
    const qs = buildQueryString(query as Record<string, unknown>);
    return http.get<DigitalAsset[]>(`${ENDPOINTS.FINANCES.ASSETS.DIGITAL}${qs}`);
  }

  static async createDigital(dto: CreateDigitalAssetDto): Promise<DigitalAsset> {
    return http.post<DigitalAsset>(ENDPOINTS.FINANCES.ASSETS.DIGITAL, dto);
  }

  static async updateDigital(id: string, dto: UpdateDigitalAssetDto): Promise<DigitalAsset> {
    return http.patch<DigitalAsset>(`${ENDPOINTS.FINANCES.ASSETS.DIGITAL}/${id}`, dto);
  }

  static async deleteDigital(id: string): Promise<{ success: boolean; id?: string }> {
    return http.delete<{ success: boolean; id?: string }>(
      `${ENDPOINTS.FINANCES.ASSETS.DIGITAL}/${id}`
    );
  }

  static async listEquities(query?: EquityAssetFilterQueryDto): Promise<EquityAsset[]> {
    const qs = buildQueryString(query as Record<string, unknown>);
    return http.get<EquityAsset[]>(`${ENDPOINTS.FINANCES.ASSETS.EQUITIES}${qs}`);
  }

  static async createEquity(dto: CreateEquityAssetDto): Promise<EquityAsset> {
    return http.post<EquityAsset>(ENDPOINTS.FINANCES.ASSETS.EQUITIES, dto);
  }

  static async updateEquity(id: string, dto: UpdateEquityAssetDto): Promise<EquityAsset> {
    return http.patch<EquityAsset>(`${ENDPOINTS.FINANCES.ASSETS.EQUITIES}/${id}`, dto);
  }

  static async deleteEquity(id: string): Promise<{ success: boolean; id?: string }> {
    return http.delete<{ success: boolean; id?: string }>(
      `${ENDPOINTS.FINANCES.ASSETS.EQUITIES}/${id}`
    );
  }

  static async getPortfolioSummary(): Promise<PortfolioSummaryResponse> {
    return http.get<PortfolioSummaryResponse>(ENDPOINTS.FINANCES.ASSETS.SUMMARY);
  }
}
