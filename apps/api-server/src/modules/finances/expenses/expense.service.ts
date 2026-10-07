// import { and, desc, eq, expense, splitExpense, category, gte, lte } from '@kalya/db';
// import { CreateExpenseDto, ExpenseFilterQueryDto, UpdateExpenseDto } from '@kalya/types';
// import { BaseFinanceService } from '../common';
// import { calculateSplitShares, roundMoney } from '@kalya/utils';

// export class ExpenseService extends BaseFinanceService {
//   async listExpenses(userId: string, query: ExpenseFilterQueryDto) {
//     const conditions = [eq(expense.userId, userId)];

//     if (query.category_id) conditions.push(eq(expense.categoryId, query.category_id));
//     if (query.from) conditions.push(gte(expense.date, query.from));
//     if (query.to) conditions.push(lte(expense.date, query.to));
//     if (query.is_split !== undefined) conditions.push(eq(expense.isSplit, query.is_split));
//     if (query.payment_method)
//       conditions.push(eq(expense.paymentMethod, query.payment_method as any));

//     const limit = query.limit ?? 20;
//     const offset = query.offset ?? 0;

//     return this.db
//       .select()
//       .from(expense)
//       .where(and(...conditions))
//       .orderBy(desc(expense.date), desc(expense.createdAt))
//       .limit(limit)
//       .offset(offset);
//   }

//   async getExpenseById(userId: string, id: string) {
//     const expenseRecord = await this.assertEntityOwnership(async () => {
//       const [row] = await this.db
//         .select()
//         .from(expense)
//         .where(and(eq(expense.id, id), eq(expense.userId, userId)))
//         .limit(1);
//       return row;
//     }, 'Expense');

//     let splits: any[] = [];
//     if (expenseRecord.isSplit) {
//       splits = await this.db.select().from(splitExpense).where(eq(splitExpense.expenseId, id));
//     }

//     return { ...expenseRecord, splits };
//   }

//   async createExpense(userId: string, dto: CreateExpenseDto) {
//     await this.verifyParentExists(category, dto.category_id, userId, 'Category');

//     const totalAmount = roundMoney(dto.amount);
//     const isSplit = Boolean(dto.is_split);
//     const splitType = dto.split_type ?? 'equal';
//     const yourShare = roundMoney(dto.your_share ?? (isSplit ? 0 : totalAmount));

//     return this.db.transaction(async (tx) => {
//       const [newExpense] = await tx
//         .insert(expense)
//         .values({
//           userId,
//           date: dto.date,
//           categoryId: dto.category_id,
//           description: dto.description,
//           amount: totalAmount,
//           paymentMethod: (dto.payment_method ?? 'upi') as any,
//           isSplit,
//           paidBy: dto.paid_by,
//           yourShare,
//           splitType: splitType as any,
//         })
//         .returning();

//       if (isSplit && dto.splits && dto.splits.length > 0) {
//         const allHaveAmount = dto.splits.every(
//           (s) => typeof s.amount === 'number' && !isNaN(s.amount)
//         );
//         const splitShares = allHaveAmount
//           ? dto.splits.map((s) => ({ memberId: s.split_member_id, amount: roundMoney(s.amount!) }))
//           : calculateSplitShares(
//               totalAmount,
//               splitType,
//               dto.splits.map((s) => ({ memberId: s.split_member_id, share: s.amount }))
//             );

//         for (const share of splitShares) {
//           await tx.insert(splitExpense).values({
//             userId,
//             expenseId: newExpense.id,
//             splitMemberId: share.memberId,
//             amount: share.amount,
//             settledAmount: 0,
//             settled: false,
//           });
//         }
//       }

//       return newExpense;
//     });
//   }

//   async updateExpense(userId: string, id: string, dto: UpdateExpenseDto) {
//     await this.getExpenseById(userId, id);

//     if (dto.category_id) {
//       await this.verifyParentExists(category, dto.category_id, userId, 'Category');
//     }

//     const [updated] = await this.db
//       .update(expense)
//       .set({
//         ...(dto.date ? { date: dto.date } : {}),
//         ...(dto.category_id ? { categoryId: dto.category_id } : {}),
//         ...(dto.description ? { description: dto.description } : {}),
//         ...(dto.amount !== undefined ? { amount: roundMoney(dto.amount) } : {}),
//         ...(dto.payment_method !== undefined ? { paymentMethod: dto.payment_method as any } : {}),
//         ...(dto.is_split !== undefined ? { isSplit: dto.is_split } : {}),
//         ...(dto.paid_by !== undefined ? { paidBy: dto.paid_by } : {}),
//         ...(dto.your_share !== undefined ? { yourShare: roundMoney(dto.your_share) } : {}),
//         ...(dto.split_type ? { splitType: dto.split_type as any } : {}),
//       })
//       .where(and(eq(expense.id, id), eq(expense.userId, userId)))
//       .returning();

//     return updated;
//   }

//   async deleteExpense(userId: string, id: string) {
//     await this.getExpenseById(userId, id);
//     return this.db.transaction(async (tx) => {
//       await tx.delete(splitExpense).where(eq(splitExpense.expenseId, id));
//       await tx.delete(expense).where(and(eq(expense.id, id), eq(expense.userId, userId)));
//       return { success: true };
//     });
//   }
// }

import { and, desc, eq, expense, splitExpense, category, gte, lte } from '@kalya/db';
import { CreateExpenseDto, ExpenseFilterQueryDto, UpdateExpenseDto } from '@kalya/types';
import { BaseFinanceService } from '../common';
import { calculateSplitShares, roundMoney } from '@kalya/utils';

export class ExpenseService extends BaseFinanceService {
  async listExpenses(userId: string, query: ExpenseFilterQueryDto) {
    const conditions = [eq(expense.userId, userId)];

    if (query.category_id) conditions.push(eq(expense.categoryId, query.category_id));
    if (query.from) conditions.push(gte(expense.date, query.from));
    if (query.to) conditions.push(lte(expense.date, query.to));
    if (query.is_split !== undefined) conditions.push(eq(expense.isSplit, query.is_split));
    if (query.payment_method)
      conditions.push(eq(expense.paymentMethod, query.payment_method as any));

    // Transactions page loads everything unfiltered, so don't silently cut at 20 rows.
    const limit = query.limit ?? 1000;
    const offset = query.offset ?? 0;

    return this.db
      .select()
      .from(expense)
      .where(and(...conditions))
      .orderBy(desc(expense.date), desc(expense.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getExpenseById(userId: string, id: string) {
    const expenseRecord = await this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(expense)
        .where(and(eq(expense.id, id), eq(expense.userId, userId)))
        .limit(1);
      return row;
    }, 'Expense');

    let splits: any[] = [];
    if (expenseRecord.isSplit) {
      splits = await this.db.select().from(splitExpense).where(eq(splitExpense.expenseId, id));
    }

    return { ...expenseRecord, splits };
  }

  async createExpense(userId: string, dto: CreateExpenseDto) {
    await this.verifyParentExists(category, dto.category_id, userId, 'Category');

    const totalAmount = roundMoney(dto.amount);
    const isSplit = Boolean(dto.is_split);
    const splitType = dto.split_type ?? 'equal';
    const yourShare = roundMoney(dto.your_share ?? (isSplit ? 0 : totalAmount));

    // better-sqlite3 transactions are SYNCHRONOUS: no async/await inside the callback.
    return this.db.transaction((tx) => {
      const newExpense = tx
        .insert(expense)
        .values({
          userId,
          date: dto.date,
          categoryId: dto.category_id,
          description: dto.description,
          amount: totalAmount,
          paymentMethod: (dto.payment_method ?? 'upi') as any,
          isSplit,
          paidBy: dto.paid_by,
          yourShare,
          splitType: splitType as any,
        })
        .returning()
        .get();

      if (isSplit && dto.splits && dto.splits.length > 0) {
        const allHaveAmount = dto.splits.every(
          (s) => typeof s.amount === 'number' && !isNaN(s.amount)
        );
        const splitShares = allHaveAmount
          ? dto.splits.map((s) => ({ memberId: s.split_member_id, amount: roundMoney(s.amount!) }))
          : calculateSplitShares(
              totalAmount,
              splitType,
              dto.splits.map((s) => ({ memberId: s.split_member_id, share: s.amount }))
            );

        for (const share of splitShares) {
          tx.insert(splitExpense)
            .values({
              userId,
              expenseId: newExpense.id,
              splitMemberId: share.memberId,
              amount: share.amount,
              settledAmount: 0,
              settled: false,
            })
            .run();
        }
      }

      return newExpense;
    });
  }

  async updateExpense(userId: string, id: string, dto: UpdateExpenseDto) {
    await this.getExpenseById(userId, id);

    if (dto.category_id) {
      await this.verifyParentExists(category, dto.category_id, userId, 'Category');
    }

    const [updated] = await this.db
      .update(expense)
      .set({
        ...(dto.date ? { date: dto.date } : {}),
        ...(dto.category_id ? { categoryId: dto.category_id } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.amount !== undefined ? { amount: roundMoney(dto.amount) } : {}),
        ...(dto.payment_method !== undefined ? { paymentMethod: dto.payment_method as any } : {}),
        ...(dto.is_split !== undefined ? { isSplit: dto.is_split } : {}),
        ...(dto.paid_by !== undefined ? { paidBy: dto.paid_by } : {}),
        ...(dto.your_share !== undefined ? { yourShare: roundMoney(dto.your_share) } : {}),
        ...(dto.split_type ? { splitType: dto.split_type as any } : {}),
      })
      .where(and(eq(expense.id, id), eq(expense.userId, userId)))
      .returning();

    return updated;
  }

  async deleteExpense(userId: string, id: string) {
    await this.getExpenseById(userId, id);
    return this.db.transaction((tx) => {
      tx.delete(splitExpense).where(eq(splitExpense.expenseId, id)).run();
      tx.delete(expense)
        .where(and(eq(expense.id, id), eq(expense.userId, userId)))
        .run();
      return { success: true };
    });
  }
}
