import { and, eq, splitContactMember, splitExpense } from '@kalya/db';
import {
  CreateSplitContactMemberDto,
  SettleSplitExpenseDto,
  UpdateSplitContactMemberDto,
} from '@kalya/types';
import { BaseFinanceService } from '../common';
import { roundMoney } from '@kalya/utils';
import { BadRequestError } from '@/errors';

export class SplitService extends BaseFinanceService {
  async listContacts(userId: string) {
    return this.db.select().from(splitContactMember).where(eq(splitContactMember.userId, userId));
  }

  async createContact(userId: string, dto: CreateSplitContactMemberDto) {
    const [created] = await this.db
      .insert(splitContactMember)
      .values({
        userId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        image: dto.image,
        isLinked: dto.is_linked ?? false,
      })
      .returning();

    return created;
  }

  async updateContact(userId: string, id: string, dto: UpdateSplitContactMemberDto) {
    const [updated] = await this.db
      .update(splitContactMember)
      .set({
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.image !== undefined ? { image: dto.image } : {}),
        ...(dto.is_linked !== undefined ? { isLinked: dto.is_linked } : {}),
      })
      .where(and(eq(splitContactMember.id, id), eq(splitContactMember.userId, userId)))
      .returning();

    return updated;
  }

  async listPendingShares(userId: string) {
    return this.db
      .select()
      .from(splitExpense)
      .where(and(eq(splitExpense.userId, userId), eq(splitExpense.settled, false)));
  }

  async settleShare(userId: string, shareId: string, dto: SettleSplitExpenseDto) {
    const share = await this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(splitExpense)
        .where(and(eq(splitExpense.id, shareId), eq(splitExpense.userId, userId)))
        .limit(1);
      return row;
    }, 'Split Expense');

    const owed = Number(share.amount ?? 0);
    const existingSettled = Number(share.settledAmount ?? 0);
    const incomingSettlement = roundMoney(dto.settled_amount);
    const totalSettled = roundMoney(existingSettled + incomingSettlement);

    if (totalSettled > owed) {
      throw new BadRequestError(`Settlement amount exceeds total obligation of ${owed}`);
    }

    const isFullySettled = totalSettled >= owed;

    const [updated] = await this.db
      .update(splitExpense)
      .set({
        settledAmount: totalSettled,
        settled: isFullySettled,
        settledVia: dto.settled_via,
        settledAt: dto.settled_at ?? new Date().toISOString(),
      })
      .where(eq(splitExpense.id, shareId))
      .returning();

    return updated;
  }
}
