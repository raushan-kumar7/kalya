import { and, eq, category, bucket } from '@kalya/db';
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

  async seedDefaultCategories(userId: string) {
    // 1. Resolve user's allocation buckets
    const userBuckets = await this.db
      .select({ id: bucket.id, key: bucket.key })
      .from(bucket)
      .where(eq(bucket.userId, userId));

    const bucketMap = new Map<string, string>();
    for (const b of userBuckets) {
      bucketMap.set(b.key, b.id);
    }

    // 2. Ensure default buckets exist if not already present
    const defaultBuckets = [
      {
        key: 'needs',
        label: 'Needs',
        origin: 'built-in' as const,
        targetPercent: 50,
        color: '#3B82F6',
        icon: 'home',
      },
      {
        key: 'wants',
        label: 'Wants',
        origin: 'built-in' as const,
        targetPercent: 30,
        color: '#EC4899',
        icon: 'shopping-bag',
      },
      {
        key: 'savings',
        label: 'Savings & Investments',
        origin: 'built-in' as const,
        targetPercent: 20,
        color: '#10B981',
        icon: 'piggy-bank',
      },
    ];

    for (const def of defaultBuckets) {
      if (!bucketMap.has(def.key)) {
        const [created] = await this.db
          .insert(bucket)
          .values({ userId, ...def })
          .returning({ id: bucket.id });
        if (created) {
          bucketMap.set(def.key, created.id);
        }
      }
    }

    // 3. Define curated default categories for each bucket
    const defaultCategories: Array<{
      bucketKey: 'needs' | 'wants' | 'savings';
      key: string;
      label: string;
      origin: 'built-in';
      color: string;
      icon: string;
    }> = [
      // Needs (Essentials)
      {
        bucketKey: 'needs',
        key: 'groceries',
        label: 'Groceries & Household',
        origin: 'built-in',
        color: '#10B981',
        icon: 'shopping-cart',
      },
      {
        bucketKey: 'needs',
        key: 'rent_housing',
        label: 'Rent & Housing',
        origin: 'built-in',
        color: '#3B82F6',
        icon: 'home',
      },
      {
        bucketKey: 'needs',
        key: 'utilities',
        label: 'Utilities & Bills',
        origin: 'built-in',
        color: '#F59E0B',
        icon: 'zap',
      },
      {
        bucketKey: 'needs',
        key: 'transportation',
        label: 'Transportation & Fuel',
        origin: 'built-in',
        color: '#6366F1',
        icon: 'truck',
      },
      {
        bucketKey: 'needs',
        key: 'healthcare',
        label: 'Healthcare & Medical',
        origin: 'built-in',
        color: '#EF4444',
        icon: 'heart-pulse',
      },
      {
        bucketKey: 'needs',
        key: 'insurance',
        label: 'Insurance',
        origin: 'built-in',
        color: '#0EA5E9',
        icon: 'shield',
      },

      // Wants (Lifestyle)
      {
        bucketKey: 'wants',
        key: 'dining_out',
        label: 'Dining & Cafes',
        origin: 'built-in',
        color: '#F97316',
        icon: 'utensils',
      },
      {
        bucketKey: 'wants',
        key: 'entertainment',
        label: 'Entertainment & Leisure',
        origin: 'built-in',
        color: '#8B5CF6',
        icon: 'film',
      },
      {
        bucketKey: 'wants',
        key: 'shopping',
        label: 'Shopping & Apparel',
        origin: 'built-in',
        color: '#EC4899',
        icon: 'shopping-bag',
      },
      {
        bucketKey: 'wants',
        key: 'subscriptions',
        label: 'Subscriptions & Services',
        origin: 'built-in',
        color: '#06B6D4',
        icon: 'tv',
      },
      {
        bucketKey: 'wants',
        key: 'travel',
        label: 'Travel & Vacations',
        origin: 'built-in',
        color: '#14B8A6',
        icon: 'plane',
      },
      {
        bucketKey: 'wants',
        key: 'personal_care',
        label: 'Personal Care & Fitness',
        origin: 'built-in',
        color: '#D946EF',
        icon: 'smile',
      },

      // Savings & Investments
      {
        bucketKey: 'savings',
        key: 'emergency_fund',
        label: 'Emergency Fund',
        origin: 'built-in',
        color: '#10B981',
        icon: 'shield-check',
      },
      {
        bucketKey: 'savings',
        key: 'investments',
        label: 'Stocks & Mutual Funds',
        origin: 'built-in',
        color: '#3B82F6',
        icon: 'trending-up',
      },
      {
        bucketKey: 'savings',
        key: 'retirement',
        label: 'Retirement & Pension',
        origin: 'built-in',
        color: '#8B5CF6',
        icon: 'award',
      },
      {
        bucketKey: 'savings',
        key: 'fixed_deposits',
        label: 'Fixed Deposits & Bonds',
        origin: 'built-in',
        color: '#F59E0B',
        icon: 'landmark',
      },
    ];

    for (const def of defaultCategories) {
      const [exists] = await this.db
        .select({ id: category.id })
        .from(category)
        .where(and(eq(category.userId, userId), eq(category.key, def.key)))
        .limit(1);

      if (!exists) {
        const bucketId = bucketMap.get(def.bucketKey);
        if (bucketId) {
          await this.db.insert(category).values({
            userId,
            bucketId,
            key: def.key,
            label: def.label,
            origin: def.origin,
            color: def.color,
            icon: def.icon,
          });
        }
      }
    }

    return this.listCategories(userId);
  }
}
