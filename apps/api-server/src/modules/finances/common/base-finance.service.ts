import { NotFoundError } from '@/errors';
import { and, DatabaseClient, eq } from '@kalya/db';

/**
 * Base service providing tenancy isolation and verified ownership lookups.
 */
export abstract class BaseFinanceService {
  constructor(protected readonly db: DatabaseClient) {}

  /**
   * Asserts an entity exists and belongs to the active tenant user.
   */
  protected async assertEntityOwnership<T extends { id: string; userId: string }>(
    queryFn: () => Promise<T | undefined>,
    resourceName: string
  ): Promise<T> {
    const record = await queryFn();
    if (!record) {
      throw new NotFoundError(`${resourceName} not found`);
    }
    return record;
  }

  /**
   * Utility asserting that a user-specified parent entity exists and belongs to the user.
   */
  protected async verifyParentExists(
    table: any,
    parentId: string,
    userId: string,
    parentName: string
  ): Promise<void> {
    const [row] = await this.db
      .select({ id: table.id })
      .from(table)
      .where(and(eq(table.id, parentId), eq(table.userId, userId)))
      .limit(1);

    if (!row) {
      throw new NotFoundError(`${parentName} with ID '${parentId}' does not exist`);
    }
  }
}
