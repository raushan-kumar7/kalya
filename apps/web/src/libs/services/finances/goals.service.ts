import { CreateGoalDto, Goal, GoalFilterQueryDto, UpdateGoalDto } from '@kalya/types';
import { buildQueryString } from './helper';
import { ENDPOINTS, http } from '@/api';

export class GoalService {
  static async list(query?: GoalFilterQueryDto): Promise<Goal[]> {
    const qs = buildQueryString(query as Record<string, unknown>);
    return http.get<Goal[]>(`${ENDPOINTS.FINANCES.GOALS.LIST}${qs}`);
  }

  static async getById(id: string): Promise<Goal> {
    return http.get<Goal>(ENDPOINTS.FINANCES.GOALS.DETAIL(id));
  }

  static async create(dto: CreateGoalDto): Promise<Goal> {
    return http.post<Goal>(ENDPOINTS.FINANCES.GOALS.CREATE, dto);
  }

  static async update(id: string, dto: UpdateGoalDto): Promise<Goal> {
    return http.patch<Goal>(ENDPOINTS.FINANCES.GOALS.UPDATE(id), dto);
  }

  static async delete(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.FINANCES.GOALS.DELETE(id));
  }
}
