import { CreateIncomeDto, Income, IncomeFilterQueryDto, UpdateIncomeDto } from '@kalya/types';
import { buildQueryString } from './helper';
import { ENDPOINTS, http } from '@/api';

export class IncomeService {
  static async list(query?: IncomeFilterQueryDto): Promise<Income[]> {
    const qs = buildQueryString(query as Record<string, unknown>);
    return http.get<Income[]>(`${ENDPOINTS.FINANCES.INCOME.LIST}${qs}`);
  }

  static async getById(id: string): Promise<Income> {
    return http.get<Income>(ENDPOINTS.FINANCES.INCOME.DETAIL(id));
  }

  static async create(dto: CreateIncomeDto): Promise<Income> {
    return http.post<Income>(ENDPOINTS.FINANCES.INCOME.CREATE, dto);
  }

  static async update(id: string, dto: UpdateIncomeDto): Promise<Income> {
    return http.patch<Income>(ENDPOINTS.FINANCES.INCOME.UPDATE(id), dto);
  }

  static async delete(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.FINANCES.INCOME.DELETE(id));
  }
}
