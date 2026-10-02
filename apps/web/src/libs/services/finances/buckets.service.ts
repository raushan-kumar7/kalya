import { ENDPOINTS, http } from '@/api';
import { Bucket, CreateBucketDto, UpdateBucketDto } from '@kalya/types';

export class BucketService {
  static async list(): Promise<Bucket[]> {
    return http.get<Bucket[]>(ENDPOINTS.FINANCES.BUCKETS.LIST);
  }

  static async seedDefaults(): Promise<Bucket[]> {
    return http.post<Bucket[]>(ENDPOINTS.FINANCES.BUCKETS.SEED_DEFAULTS);
  }

  static async getById(id: string): Promise<Bucket> {
    return http.get<Bucket>(ENDPOINTS.FINANCES.BUCKETS.DETAIL(id));
  }

  static async create(dto: CreateBucketDto): Promise<Bucket> {
    return http.post<Bucket>(ENDPOINTS.FINANCES.BUCKETS.CREATE, dto);
  }

  static async update(id: string, dto: UpdateBucketDto): Promise<Bucket> {
    return http.patch<Bucket>(ENDPOINTS.FINANCES.BUCKETS.UPDATE(id), dto);
  }

  static async delete(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.FINANCES.BUCKETS.DELETE(id));
  }
}
