import {
  CreateExpenseDto,
  Expense,
  ExpenseFilterQueryDto,
  SplitExpense,
  UpdateExpenseDto,
} from '@kalya/types';
import { buildQueryString } from './helper';
import { ENDPOINTS, http } from '@/api';

export class ExpenseService {
  static async list(query?: ExpenseFilterQueryDto): Promise<Expense[]> {
    const qs = buildQueryString(query as Record<string, unknown>);
    return http.get<Expense[]>(`${ENDPOINTS.FINANCES.EXPENSES.LIST}${qs}`);
  }

  static async getById(id: string): Promise<Expense & { splits: SplitExpense[] }> {
    return http.get<Expense & { splits: SplitExpense[] }>(ENDPOINTS.FINANCES.EXPENSES.DETAIL(id));
  }

  static async create(dto: CreateExpenseDto): Promise<Expense> {
    return http.post<Expense>(ENDPOINTS.FINANCES.EXPENSES.CREATE, dto);
  }

  static async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    return http.patch<Expense>(ENDPOINTS.FINANCES.EXPENSES.UPDATE(id), dto);
  }

  static async delete(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.FINANCES.EXPENSES.DELETE(id));
  }
}
