import { and, eq, bucket, category } from '@kalya/db';
import { CreateBucketDto, UpdateBucketDto } from '@kalya/types';
import { BaseFinanceService } from '../common';
import { ConflictError, BadRequestError } from '@/errors';

export class BucketService extends BaseFinanceService {
  async listBuckets(userId: string) {
    return this.db.select().from(bucket).where(eq(bucket.userId, userId));
  }

  async getBucketById(userId: string, id: string) {
    return this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(bucket)
        .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
        .limit(1);
      return row;
    }, 'Bucket');
  }

  async createBucket(userId: string, dto: CreateBucketDto) {
    const [existing] = await this.db
      .select({ id: bucket.id })
      .from(bucket)
      .where(and(eq(bucket.userId, userId), eq(bucket.key, dto.key)))
      .limit(1);

    if (existing) {
      throw new ConflictError(`Bucket with key '${dto.key}' already exists`);
    }

    const [created] = await this.db
      .insert(bucket)
      .values({
        userId,
        key: dto.key,
        label: dto.label,
        origin: (dto.origin ?? 'custom') as 'built-in' | 'custom',
        targetPercent: dto.target_percent,
        color: dto.color,
        icon: dto.icon,
      })
      .returning();

    return created;
  }

  async updateBucket(userId: string, id: string, dto: UpdateBucketDto) {
    await this.getBucketById(userId, id);

    if (dto.key) {
      const [duplicate] = await this.db
        .select({ id: bucket.id })
        .from(bucket)
        .where(and(eq(bucket.userId, userId), eq(bucket.key, dto.key)))
        .limit(1);

      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(`Bucket with key '${dto.key}' already exists`);
      }
    }

    const [updated] = await this.db
      .update(bucket)
      .set({
        ...(dto.key !== undefined ? { key: dto.key } : {}),
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.origin !== undefined ? { origin: dto.origin as any } : {}),
        ...(dto.target_percent !== undefined ? { targetPercent: dto.target_percent } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
      })
      .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
      .returning();

    return updated;
  }

  async deleteBucket(userId: string, id: string) {
    const existing = await this.getBucketById(userId, id);
    if (existing.origin === 'built-in') {
      throw new BadRequestError('Cannot delete system built-in buckets');
    }

    const [linkedCategory] = await this.db
      .select({ id: category.id })
      .from(category)
      .where(and(eq(category.bucketId, id), eq(category.userId, userId)))
      .limit(1);

    if (linkedCategory) {
      throw new BadRequestError('Cannot delete bucket containing active categories');
    }

    await this.db.delete(bucket).where(and(eq(bucket.id, id), eq(bucket.userId, userId)));
    return { success: true };
  }

  async seedDefaultBuckets(userId: string) {
    const defaults = [
      {
        key: 'needs',
        label: 'Needs',
        origin: 'built-in',
        targetPercent: 50,
        color: '#3B82F6',
        icon: 'home',
      },
      {
        key: 'wants',
        label: 'Wants',
        origin: 'built-in',
        targetPercent: 30,
        color: '#EC4899',
        icon: 'shopping-bag',
      },
      {
        key: 'savings',
        label: 'Savings & Investments',
        origin: 'built-in',
        targetPercent: 20,
        color: '#10B981',
        icon: 'piggy-bank',
      },
    ] as const;

    for (const def of defaults) {
      const [exists] = await this.db
        .select({ id: bucket.id })
        .from(bucket)
        .where(and(eq(bucket.userId, userId), eq(bucket.key, def.key)))
        .limit(1);

      if (!exists) {
        await this.db.insert(bucket).values({ userId, ...def });
      }
    }
  }
}
