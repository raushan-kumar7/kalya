import { Category, CreateCategoryDto, UpdateCategoryDto } from '@kalya/types';
import { buildQueryString } from './helper';
import { ENDPOINTS, http } from '@/api';

export class CategoryService {
  static async list(bucketId?: string): Promise<Category[]> {
    const qs = buildQueryString({ bucket_id: bucketId });
    return http.get<Category[]>(`${ENDPOINTS.FINANCES.CATEGORIES.LIST}${qs}`);
  }

  static async seedDefaults(): Promise<Category[]> {
    return http.post<Category[]>(ENDPOINTS.FINANCES.CATEGORIES.SEED_DEFAULTS);
  }

  static async getById(id: string): Promise<Category> {
    return http.get<Category>(ENDPOINTS.FINANCES.CATEGORIES.DETAIL(id));
  }

  static async create(dto: CreateCategoryDto): Promise<Category> {
    return http.post<Category>(ENDPOINTS.FINANCES.CATEGORIES.CREATE, dto);
  }

  static async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    return http.patch<Category>(ENDPOINTS.FINANCES.CATEGORIES.UPDATE(id), dto);
  }

  static async delete(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.FINANCES.CATEGORIES.DELETE(id));
  }
}
