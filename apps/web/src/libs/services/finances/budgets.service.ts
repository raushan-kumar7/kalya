import { Budget, BudgetFilterQueryDto, CreateBudgetDto, UpdateBudgetDto } from '@kalya/types';
import { BudgetHealthEvaluation, buildQueryString } from './helper';
import { ENDPOINTS, http } from '@/api';

export class BudgetService {
  static async list(query?: BudgetFilterQueryDto): Promise<Budget[]> {
    const qs = buildQueryString(query as Record<string, unknown>);
    return http.get<Budget[]>(`${ENDPOINTS.FINANCES.BUDGETS.LIST}${qs}`);
  }

  static async getById(id: string): Promise<Budget> {
    return http.get<Budget>(ENDPOINTS.FINANCES.BUDGETS.DETAIL(id));
  }

  static async getHealth(id: string): Promise<BudgetHealthEvaluation> {
    return http.get<BudgetHealthEvaluation>(ENDPOINTS.FINANCES.BUDGETS.HEALTH(id));
  }

  static async create(dto: CreateBudgetDto): Promise<Budget> {
    return http.post<Budget>(ENDPOINTS.FINANCES.BUDGETS.CREATE, dto);
  }

  static async update(id: string, dto: UpdateBudgetDto): Promise<Budget> {
    return http.patch<Budget>(ENDPOINTS.FINANCES.BUDGETS.UPDATE(id), dto);
  }

  static async delete(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.FINANCES.BUDGETS.DELETE(id));
  }
}
