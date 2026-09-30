import { DatabaseClient, and, eq, category, bucket } from '@kalya/db';
import { CreateCategoryDto, UpdateCategoryDto } from '@kalya/types';
import { BaseFinanceService } from '../common/base-finance.service';
import { ConflictError } from '@/errors';

export class CategoryService extends BaseFinanceService {
  async listCategories(userId: string, bucketId?: string) {
    const conditions = [eq(category.userId, userId)];
    if (bucketId) {
      conditions.push(eq(category.bucketId, bucketId));
    }
    return this.db
      .select()
      .from(category)
      .where(and(...conditions));
  }

  async getCategoryById(userId: string, id: string) {
    return this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(category)
        .where(and(eq(category.id, id), eq(category.userId, userId)))
        .limit(1);
      return row;
    }, 'Category');
  }

  async createCategory(userId: string, dto: CreateCategoryDto) {
    await this.verifyParentExists(bucket, dto.bucket_id, userId, 'Bucket');

    const [existing] = await this.db
      .select({ id: category.id })
      .from(category)
      .where(and(eq(category.userId, userId), eq(category.key, dto.key)))
      .limit(1);

    if (existing) {
      throw new ConflictError(`Category with key '${dto.key}' already exists`);
    }

    const [created] = await this.db
      .insert(category)
      .values({
        userId,
        bucketId: dto.bucket_id,
        key: dto.key,
        label: dto.label,
        origin: (dto.origin ?? 'custom') as 'built-in' | 'custom',
        color: dto.color ?? '#6B7280',
        icon: dto.icon ?? 'tag',
      })
      .returning();

    return created;
  }

  async updateCategory(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.getCategoryById(userId, id);

    if (dto.bucket_id) {
      await this.verifyParentExists(bucket, dto.bucket_id, userId, 'Bucket');
    }

    const [updated] = await this.db
      .update(category)
      .set({
        ...(dto.bucket_id ? { bucketId: dto.bucket_id } : {}),
        ...(dto.key ? { key: dto.key } : {}),
        ...(dto.label ? { label: dto.label } : {}),
        ...(dto.origin ? { origin: dto.origin as 'built-in' | 'custom' } : {}),
        ...(dto.color ? { color: dto.color } : {}),
        ...(dto.icon ? { icon: dto.icon } : {}),
      })
      .where(and(eq(category.id, id), eq(category.userId, userId)))
      .returning();

    return updated;
  }

  async deleteCategory(userId: string, id: string) {
    await this.getCategoryById(userId, id);
    await this.db.delete(category).where(and(eq(category.id, id), eq(category.userId, userId)));
    return { success: true };
  }
}
