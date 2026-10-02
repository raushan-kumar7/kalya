import { GenerateMonthlySummaryDto, MonthlyFinancialOverview, MonthlySummary } from '@kalya/types';
import { buildQueryString } from './helper';
import { ENDPOINTS, http } from '@/api';

export class SummaryService {
  static async getOverview(month: string): Promise<MonthlyFinancialOverview> {
    const qs = buildQueryString({ month });
    return http.get<MonthlyFinancialOverview>(`${ENDPOINTS.FINANCES.SUMMARIES.OVERVIEW}${qs}`);
  }

  static async generateStatement(dto: GenerateMonthlySummaryDto): Promise<MonthlySummary> {
    return http.post<MonthlySummary>(ENDPOINTS.FINANCES.SUMMARIES.GENERATE_STATEMENT, dto);
  }
}
