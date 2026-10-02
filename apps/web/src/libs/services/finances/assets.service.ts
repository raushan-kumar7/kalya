import {
  CreateDigitalAssetDto,
  CreateEquityAssetDto,
  DigitalAsset,
  DigitalAssetFilterQueryDto,
  EquityAsset,
  EquityAssetFilterQueryDto,
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

  static async listEquities(query?: EquityAssetFilterQueryDto): Promise<EquityAsset[]> {
    const qs = buildQueryString(query as Record<string, unknown>);
    return http.get<EquityAsset[]>(`${ENDPOINTS.FINANCES.ASSETS.EQUITIES}${qs}`);
  }

  static async createEquity(dto: CreateEquityAssetDto): Promise<EquityAsset> {
    return http.post<EquityAsset>(ENDPOINTS.FINANCES.ASSETS.EQUITIES, dto);
  }

  static async getPortfolioSummary(): Promise<PortfolioSummaryResponse> {
    return http.get<PortfolioSummaryResponse>(ENDPOINTS.FINANCES.ASSETS.SUMMARY);
  }
}
