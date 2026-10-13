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

import {
  alert,
  and,
  category,
  desc,
  eq,
  expense,
  gte,
  lte,
  schema,
  splitContactMember,
  splitExpense,
  splitInvitation,
} from '@kalya/db';
import { CreateExpenseDto, ExpenseFilterQueryDto, UpdateExpenseDto } from '@kalya/types';
import { BaseFinanceService } from '../common';
import { calculateSplitShares, roundMoney } from '@kalya/utils';
import { env } from '@kalya/env';
import { log } from '@/logger';
import { getMailer } from '@/libs/mail';
import { SplitExpenseRequest } from '@kalya/email';
import type { JobQueueService } from '../../jobs/job-queue.service';

export class ExpenseService extends BaseFinanceService {
  constructor(
    db: any,
    private readonly jobQueue?: JobQueueService
  ) {
    super(db);
  }

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

    const emailJobs: {
      to: string;
      recipientName: string;
      payerName: string;
      expenseDescription: string;
      totalBillAmount: string;
      recipientShareAmount: string;
      expenseDate: string;
      splitMethod: string;
      paymentMethod: string;
    }[] = [];

    const pushJobs: {
      userId: string;
      title: string;
      body: string;
      url: string;
      data?: Record<string, unknown>;
    }[] = [];

    // better-sqlite3 transactions are SYNCHRONOUS: no async/await inside the callback.
    const createdExpense = this.db.transaction((tx) => {
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
          const [contactMember] = tx
            .select()
            .from(splitContactMember)
            .where(eq(splitContactMember.id, share.memberId))
            .all();

          // Resolve linked user profile or check matched registered user
          let targetUser = null;
          if (contactMember?.linkedUserId) {
            [targetUser] = tx
              .select()
              .from(schema.user)
              .where(eq(schema.user.id, contactMember.linkedUserId))
              .all();
          } else if (contactMember?.email) {
            [targetUser] = tx
              .select()
              .from(schema.user)
              .where(eq(schema.user.email, contactMember.email.toLowerCase()))
              .all();
          }

          const isMemberLinked = Boolean(targetUser);
          const inviteeEmail = contactMember?.email || targetUser?.email || null;
          const inviteePhone = contactMember?.phone || targetUser?.phone || null;

          const [newSplitShare] = tx
            .insert(splitExpense)
            .values({
              userId,
              expenseId: newExpense.id,
              splitMemberId: share.memberId,
              amount: share.amount,
              settledAmount: 0,
              settled: false,
              syncStatus: isMemberLinked ? 'pending_acceptance' : 'unlinked',
              creatorUserId: userId,
            })
            .returning()
            .all();

          if (targetUser || inviteeEmail || inviteePhone) {
            const [invitation] = tx
              .insert(splitInvitation)
              .values({
                senderUserId: userId,
                receiverUserId: targetUser?.id || null,
                inviteeEmail: inviteeEmail ? inviteeEmail.toLowerCase() : null,
                inviteePhone: inviteePhone || null,
                expenseId: newExpense.id,
                splitExpenseId: newSplitShare.id,
                shareAmount: share.amount,
                status: 'pending',
              })
              .returning()
              .all();

            tx.update(splitExpense)
              .set({ invitationId: invitation.id })
              .where(eq(splitExpense.id, newSplitShare.id))
              .run();

            const [senderUser] = tx
              .select()
              .from(schema.user)
              .where(eq(schema.user.id, userId))
              .all();

            // Create in-app alert for registered users
            if (targetUser) {
              const pushTitle = `Split Request: ${senderUser?.name || 'Someone'}`;
              const pushBody = `${senderUser?.name || 'A contact'} split "${newExpense.description}" with you. Your share is ₹${share.amount}.`;

              tx.insert(alert)
                .values({
                  userId: targetUser.id,
                  type: 'split_update',
                  title: pushTitle,
                  message: pushBody,
                  isRead: false,
                  referenceType: 'split_invitation',
                  referenceId: invitation.id,
                  metadata: {
                    expenseId: newExpense.id,
                    invitationId: invitation.id,
                    amount: share.amount,
                  },
                })
                .run();

              pushJobs.push({
                userId: targetUser.id,
                title: pushTitle,
                body: pushBody,
                url: '/dashboard/splits',
                data: {
                  type: 'split_request',
                  expenseId: newExpense.id,
                  invitationId: invitation.id,
                  amount: share.amount,
                },
              });
            }

            // Queue background email dispatch if recipient email is available
            if (inviteeEmail) {
              emailJobs.push({
                to: inviteeEmail,
                recipientName: contactMember?.name || targetUser?.name || 'Friend',
                payerName: senderUser?.name || 'Someone',
                expenseDescription: newExpense.description,
                totalBillAmount: `₹${newExpense.amount}`,
                recipientShareAmount: `₹${share.amount}`,
                expenseDate: newExpense.date,
                splitMethod: `Split (${splitType})`,
                paymentMethod: newExpense.paymentMethod || 'UPI',
              });
            }
          }
        }
      }

      return newExpense;
    });

    // Background async email dispatch (reliable via persistent jobQueue)
    if (emailJobs.length > 0) {
      if (this.jobQueue) {
        for (const job of emailJobs) {
          await this.jobQueue
            .enqueue('email', 'SEND_EMAIL', {
              to: job.to,
              subject: `${job.payerName} split a bill with you on Kalya (${job.recipientShareAmount})`,
              templateName: 'SplitExpenseRequest',
              props: {
                payerName: job.payerName,
                recipientName: job.recipientName,
                expenseDescription: job.expenseDescription,
                totalBillAmount: job.totalBillAmount,
                recipientShareAmount: job.recipientShareAmount,
                expenseDate: job.expenseDate,
                splitMethod: job.splitMethod,
                paymentMethod: job.paymentMethod,
                settleUrl: `${env.app.clientUrl}/dashboard/splits`,
              },
            })
            .catch(() => {});
        }
      } else {
        (async () => {
          try {
            const mailer = getMailer();
            for (const job of emailJobs) {
              await mailer.sendTemplate({
                to: job.to,
                subject: `${job.payerName} split a bill with you on Kalya (${job.recipientShareAmount})`,
                template: SplitExpenseRequest,
                props: {
                  payerName: job.payerName,
                  recipientName: job.recipientName,
                  expenseDescription: job.expenseDescription,
                  totalBillAmount: job.totalBillAmount,
                  recipientShareAmount: job.recipientShareAmount,
                  expenseDate: job.expenseDate,
                  splitMethod: job.splitMethod,
                  paymentMethod: job.paymentMethod,
                  settleUrl: `${env.app.clientUrl}/dashboard/splits`,
                },
              });
            }
          } catch (mailError) {
            log.warn('Split expense email dispatch skipped', {
              error: mailError instanceof Error ? mailError.message : String(mailError),
            });
          }
        })().catch(() => {});
      }
    }

    // Background async push notification dispatch (instant browser & device push)
    if (this.jobQueue && pushJobs.length > 0) {
      for (const pJob of pushJobs) {
        await this.jobQueue.enqueue('notification', 'DISPATCH_PUSH', pJob).catch(() => {});
      }
    }

    return createdExpense;
  }

  async updateExpense(userId: string, id: string, dto: UpdateExpenseDto) {
    const currentExpense = await this.getExpenseById(userId, id);
    const currentUser = await this.db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (dto.category_id) {
      await this.verifyParentExists(category, dto.category_id, userId, 'Category');
    }

    const pushJobs: Array<{
      userId: string;
      title: string;
      body: string;
      url: string;
      data?: any;
    }> = [];

    const updatedExpense = this.db.transaction((tx) => {
      const existingShares = tx
        .select()
        .from(splitExpense)
        .where(eq(splitExpense.expenseId, id))
        .all();

      const isMirrorExpense = existingShares.some(
        (s) => s.creatorUserId && s.creatorUserId !== userId
      );

      // If user is editing a mirror expense (User B), only allow editing local category or payment method
      if (isMirrorExpense) {
        const [updated] = tx
          .update(expense)
          .set({
            ...(dto.category_id ? { categoryId: dto.category_id } : {}),
            ...(dto.payment_method !== undefined
              ? { paymentMethod: dto.payment_method as any }
              : {}),
          })
          .where(and(eq(expense.id, id), eq(expense.userId, userId)))
          .returning()
          .all();
        return updated;
      }

      // Creator (User A) is updating the master expense
      const newAmount =
        dto.amount !== undefined ? roundMoney(dto.amount) : Number(currentExpense.amount ?? 0);
      const newDescription =
        dto.description !== undefined ? dto.description : currentExpense.description;
      const newDate = dto.date !== undefined ? dto.date : currentExpense.date;
      const newPaymentMethod =
        dto.payment_method !== undefined ? dto.payment_method : currentExpense.paymentMethod;
      const newSplitType = dto.split_type !== undefined ? dto.split_type : currentExpense.splitType;
      const isSplitActive = dto.is_split !== undefined ? dto.is_split : currentExpense.isSplit;

      // Case 1: Switching from split bill to personal bill
      if (currentExpense.isSplit && !isSplitActive) {
        for (const share of existingShares) {
          if (share.peerSplitExpenseId) {
            const peerSplit = tx
              .select()
              .from(splitExpense)
              .where(eq(splitExpense.id, share.peerSplitExpenseId))
              .get();

            if (peerSplit) {
              tx.delete(splitExpense).where(eq(splitExpense.id, peerSplit.id)).run();
              tx.delete(expense).where(eq(expense.id, peerSplit.expenseId)).run();

              const msg = `${currentUser?.name || 'Friend'} changed "${newDescription}" to a personal expense. It was removed from your ledger.`;
              tx.insert(alert)
                .values({
                  userId: peerSplit.userId,
                  type: 'split_update',
                  title: 'Split Removed',
                  message: msg,
                  isRead: false,
                  referenceType: 'expense',
                  referenceId: null,
                  metadata: { originalExpenseId: id },
                })
                .run();

              pushJobs.push({
                userId: peerSplit.userId,
                title: 'Split Removed',
                body: msg,
                url: '/dashboard/splits',
              });
            }
          }

          if (share.invitationId) {
            tx.update(splitInvitation)
              .set({ status: 'cancelled' })
              .where(eq(splitInvitation.id, share.invitationId))
              .run();
          }
        }

        tx.delete(splitExpense).where(eq(splitExpense.expenseId, id)).run();
      }

      // Case 2: Expense remains or becomes a split bill
      else if (isSplitActive) {
        // If explicit splits array provided, synchronize shares
        if (dto.splits && dto.splits.length > 0) {
          const allHaveAmount = dto.splits.every(
            (s) => typeof s.amount === 'number' && !isNaN(s.amount)
          );
          const splitShares = allHaveAmount
            ? dto.splits.map((s) => ({
                memberId: s.split_member_id,
                amount: roundMoney(s.amount!),
              }))
            : calculateSplitShares(
                newAmount,
                newSplitType,
                dto.splits.map((s) => ({
                  memberId: s.split_member_id,
                  share: s.amount ?? undefined,
                }))
              );

          const existingByMember = new Map(existingShares.map((s) => [s.splitMemberId, s]));
          const newMemberIds = new Set(splitShares.map((s) => s.memberId));

          // 2.1 Handle removed members
          for (const exShare of existingShares) {
            if (!newMemberIds.has(exShare.splitMemberId)) {
              if (exShare.peerSplitExpenseId) {
                const peerSplit = tx
                  .select()
                  .from(splitExpense)
                  .where(eq(splitExpense.id, exShare.peerSplitExpenseId))
                  .get();

                if (peerSplit) {
                  tx.delete(splitExpense).where(eq(splitExpense.id, peerSplit.id)).run();
                  tx.delete(expense).where(eq(expense.id, peerSplit.expenseId)).run();

                  const removeMsg = `${currentUser?.name || 'Friend'} removed you from the split for "${newDescription}".`;
                  tx.insert(alert)
                    .values({
                      userId: peerSplit.userId,
                      type: 'split_update',
                      title: 'Removed from Split',
                      message: removeMsg,
                      isRead: false,
                      referenceType: 'expense',
                      referenceId: null,
                      metadata: { originalExpenseId: id },
                    })
                    .run();

                  pushJobs.push({
                    userId: peerSplit.userId,
                    title: 'Removed from Split',
                    body: removeMsg,
                    url: '/dashboard/splits',
                  });
                }
              }

              if (exShare.invitationId) {
                tx.update(splitInvitation)
                  .set({ status: 'cancelled' })
                  .where(eq(splitInvitation.id, exShare.invitationId))
                  .run();
              }

              tx.delete(splitExpense).where(eq(splitExpense.id, exShare.id)).run();
            }
          }

          // 2.2 Handle existing and newly added members
          for (const share of splitShares) {
            if (existingByMember.has(share.memberId)) {
              const exShare = existingByMember.get(share.memberId)!;

              // Update share amount
              tx.update(splitExpense)
                .set({ amount: share.amount })
                .where(eq(splitExpense.id, exShare.id))
                .run();

              // If already accepted/synced with peer (User B):
              if (exShare.peerSplitExpenseId) {
                const peerSplit = tx
                  .select()
                  .from(splitExpense)
                  .where(eq(splitExpense.id, exShare.peerSplitExpenseId))
                  .get();

                if (peerSplit) {
                  // Update peer's split share
                  tx.update(splitExpense)
                    .set({ amount: share.amount })
                    .where(eq(splitExpense.id, peerSplit.id))
                    .run();

                  // Update peer's mirror expense
                  tx.update(expense)
                    .set({
                      date: newDate,
                      amount: newAmount,
                      yourShare: share.amount,
                      description: `${newDescription} (Split by ${currentUser?.name || 'Friend'})`,
                      paymentMethod: newPaymentMethod as any,
                      splitType: newSplitType as any,
                    })
                    .where(eq(expense.id, peerSplit.expenseId))
                    .run();

                  const updateMsg = `${currentUser?.name || 'Friend'} updated "${newDescription}". Your share is now ₹${share.amount}.`;
                  tx.insert(alert)
                    .values({
                      userId: peerSplit.userId,
                      type: 'split_update',
                      title: 'Split Updated',
                      message: updateMsg,
                      isRead: false,
                      referenceType: 'split_expense',
                      referenceId: peerSplit.id,
                      metadata: { expenseId: peerSplit.expenseId, newShareAmount: share.amount },
                    })
                    .run();

                  pushJobs.push({
                    userId: peerSplit.userId,
                    title: 'Split Updated',
                    body: updateMsg,
                    url: '/dashboard/splits',
                  });
                }
              }

              // If pending invitation exists, update share amount
              if (exShare.invitationId) {
                tx.update(splitInvitation)
                  .set({ shareAmount: share.amount })
                  .where(eq(splitInvitation.id, exShare.invitationId))
                  .run();

                const inv = tx
                  .select()
                  .from(splitInvitation)
                  .where(eq(splitInvitation.id, exShare.invitationId))
                  .get();

                if (inv?.receiverUserId) {
                  const invUpdateMsg = `${currentUser?.name || 'Friend'} updated split details for "${newDescription}". Your share is ₹${share.amount}.`;
                  pushJobs.push({
                    userId: inv.receiverUserId,
                    title: 'Split Request Updated',
                    body: invUpdateMsg,
                    url: '/dashboard/splits',
                  });
                }
              }
            } else {
              // Brand new member added during edit
              const [contactMember] = tx
                .select()
                .from(splitContactMember)
                .where(eq(splitContactMember.id, share.memberId))
                .all();

              let targetUser = null;
              if (contactMember?.linkedUserId) {
                [targetUser] = tx
                  .select()
                  .from(schema.user)
                  .where(eq(schema.user.id, contactMember.linkedUserId))
                  .all();
              } else if (contactMember?.email) {
                [targetUser] = tx
                  .select()
                  .from(schema.user)
                  .where(eq(schema.user.email, contactMember.email.toLowerCase()))
                  .all();
              }

              const isMemberLinked = Boolean(targetUser);
              const inviteeEmail = contactMember?.email || targetUser?.email || null;
              const inviteePhone = contactMember?.phone || targetUser?.phone || null;

              const [newSplitShare] = tx
                .insert(splitExpense)
                .values({
                  userId,
                  expenseId: id,
                  splitMemberId: share.memberId,
                  amount: share.amount,
                  settledAmount: 0,
                  settled: false,
                  syncStatus: isMemberLinked ? 'pending_acceptance' : 'unlinked',
                  creatorUserId: userId,
                })
                .returning()
                .all();

              if (targetUser || inviteeEmail || inviteePhone) {
                const [invitation] = tx
                  .insert(splitInvitation)
                  .values({
                    senderUserId: userId,
                    receiverUserId: targetUser?.id || null,
                    inviteeEmail: inviteeEmail ? inviteeEmail.toLowerCase() : null,
                    inviteePhone: inviteePhone || null,
                    expenseId: id,
                    splitExpenseId: newSplitShare.id,
                    shareAmount: share.amount,
                    status: 'pending',
                  })
                  .returning()
                  .all();

                tx.update(splitExpense)
                  .set({ invitationId: invitation.id })
                  .where(eq(splitExpense.id, newSplitShare.id))
                  .run();

                if (targetUser) {
                  const pushTitle = `Split Request: ${currentUser?.name || 'Someone'}`;
                  const pushBody = `${currentUser?.name || 'A contact'} split "${newDescription}" with you. Your share is ₹${share.amount}.`;

                  tx.insert(alert)
                    .values({
                      userId: targetUser.id,
                      type: 'split_update',
                      title: pushTitle,
                      message: pushBody,
                      isRead: false,
                      referenceType: 'split_invitation',
                      referenceId: invitation.id,
                      metadata: {
                        expenseId: id,
                        invitationId: invitation.id,
                      },
                    })
                    .run();

                  pushJobs.push({
                    userId: targetUser.id,
                    title: pushTitle,
                    body: pushBody,
                    url: '/dashboard/splits',
                  });
                }
              }
            }
          }
        } else {
          // No explicit splits array, but description / amount / date updated on master split expense
          for (const exShare of existingShares) {
            if (exShare.peerSplitExpenseId) {
              const peerSplit = tx
                .select()
                .from(splitExpense)
                .where(eq(splitExpense.id, exShare.peerSplitExpenseId))
                .get();

              if (peerSplit) {
                tx.update(expense)
                  .set({
                    date: newDate,
                    amount: newAmount,
                    description: `${newDescription} (Split by ${currentUser?.name || 'Friend'})`,
                    paymentMethod: newPaymentMethod as any,
                  })
                  .where(eq(expense.id, peerSplit.expenseId))
                  .run();

                const updateMsg = `${currentUser?.name || 'Friend'} updated details for "${newDescription}".`;
                tx.insert(alert)
                  .values({
                    userId: peerSplit.userId,
                    type: 'split_update',
                    title: 'Split Updated',
                    message: updateMsg,
                    isRead: false,
                    referenceType: 'split_expense',
                    referenceId: peerSplit.id,
                    metadata: { expenseId: peerSplit.expenseId },
                  })
                  .run();

                pushJobs.push({
                  userId: peerSplit.userId,
                  title: 'Split Updated',
                  body: updateMsg,
                  url: '/dashboard/splits',
                });
              }
            }
          }
        }
      }

      // Update master expense
      const [updated] = tx
        .update(expense)
        .set({
          date: newDate,
          ...(dto.category_id ? { categoryId: dto.category_id } : {}),
          description: newDescription,
          amount: newAmount,
          ...(dto.payment_method !== undefined ? { paymentMethod: dto.payment_method as any } : {}),
          ...(dto.is_split !== undefined ? { isSplit: dto.is_split } : {}),
          ...(dto.paid_by !== undefined ? { paidBy: dto.paid_by } : {}),
          ...(dto.your_share !== undefined && dto.your_share !== null
            ? { yourShare: roundMoney(dto.your_share) }
            : {}),
          ...(dto.split_type ? { splitType: dto.split_type as any } : {}),
        })
        .where(and(eq(expense.id, id), eq(expense.userId, userId)))
        .returning()
        .all();

      return updated;
    });

    // Dispatch background push notifications to affected users
    if (this.jobQueue && pushJobs.length > 0) {
      for (const pJob of pushJobs) {
        this.jobQueue
          .enqueue('notification', 'DISPATCH_PUSH', pJob, { priority: 1 })
          .catch(() => {});
      }
    }

    return updatedExpense;
  }

  async deleteExpense(userId: string, id: string) {
    const expenseRecord = await this.getExpenseById(userId, id);
    const currentUser = await this.db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    const pushJobs: Array<{
      userId: string;
      title: string;
      body: string;
      url: string;
      data?: any;
    }> = [];

    this.db.transaction((tx) => {
      // 1. Fetch all split shares attached to this expense
      const splitShares = tx
        .select()
        .from(splitExpense)
        .where(eq(splitExpense.expenseId, id))
        .all();

      // Check if this expense is a mirror expense in a recipient's ledger (created by a friend)
      const isMirrorExpense = splitShares.some(
        (s) => s.creatorUserId && s.creatorUserId !== userId
      );

      if (isMirrorExpense) {
        // User B is deleting their mirror expense from their personal ledger
        for (const share of splitShares) {
          if (share.peerSplitExpenseId) {
            // Unlink from User A's split row so User A's syncStatus reflects unlinked
            tx.update(splitExpense)
              .set({ peerSplitExpenseId: null, syncStatus: 'unlinked' })
              .where(eq(splitExpense.id, share.peerSplitExpenseId))
              .run();

            const origSplit = tx
              .select()
              .from(splitExpense)
              .where(eq(splitExpense.id, share.peerSplitExpenseId))
              .get();

            if (origSplit && origSplit.userId) {
              const msg = `${currentUser?.name || 'A contact'} removed "${expenseRecord.description}" from their personal ledger.`;
              tx.insert(alert)
                .values({
                  userId: origSplit.userId,
                  type: 'split_update',
                  title: 'Split Unlinked',
                  message: msg,
                  isRead: false,
                  referenceType: 'split_expense',
                  referenceId: origSplit.id,
                  metadata: { expenseId: origSplit.expenseId },
                })
                .run();

              pushJobs.push({
                userId: origSplit.userId,
                title: 'Split Unlinked',
                body: msg,
                url: '/dashboard/splits',
              });
            }
          }
        }
      } else {
        // User A (creator) is deleting the original expense -> propagate to all peers
        for (const share of splitShares) {
          // A. If already synced with a peer (User B):
          if (share.peerSplitExpenseId) {
            const peerSplit = tx
              .select()
              .from(splitExpense)
              .where(eq(splitExpense.id, share.peerSplitExpenseId))
              .get();

            if (peerSplit) {
              // Delete peer's mirror splitExpense row
              tx.delete(splitExpense).where(eq(splitExpense.id, peerSplit.id)).run();

              // Delete peer's mirror expense row
              tx.delete(expense).where(eq(expense.id, peerSplit.expenseId)).run();

              // Mark any alerts for this split as read for peer
              tx.update(alert)
                .set({ isRead: true, readAt: new Date() })
                .where(and(eq(alert.userId, peerSplit.userId), eq(alert.referenceId, peerSplit.id)))
                .run();

              // Notify peer about deletion
              const deleteMsg = `${currentUser?.name || 'Friend'} deleted the shared bill "${expenseRecord.description}". Your ledger has been updated.`;
              tx.insert(alert)
                .values({
                  userId: peerSplit.userId,
                  type: 'split_update',
                  title: 'Shared Bill Deleted',
                  message: deleteMsg,
                  isRead: false,
                  referenceType: 'expense',
                  referenceId: null,
                  metadata: { originalExpenseId: id },
                })
                .run();

              pushJobs.push({
                userId: peerSplit.userId,
                title: 'Shared Bill Deleted',
                body: deleteMsg,
                url: '/dashboard/splits',
              });
            }
          }

          // B. If pending invitation exists, cancel it and dismiss peer alert
          if (share.invitationId) {
            tx.update(splitInvitation)
              .set({ status: 'cancelled' })
              .where(eq(splitInvitation.id, share.invitationId))
              .run();

            const inv = tx
              .select()
              .from(splitInvitation)
              .where(eq(splitInvitation.id, share.invitationId))
              .get();

            if (inv?.receiverUserId) {
              tx.update(alert)
                .set({ isRead: true, readAt: new Date() })
                .where(and(eq(alert.userId, inv.receiverUserId), eq(alert.referenceId, inv.id)))
                .run();
            }
          }
        }
      }

      // 2. Mark any alerts for the current user as read
      tx.update(alert)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(alert.userId, userId), eq(alert.referenceId, id)))
        .run();

      for (const s of splitShares) {
        tx.update(alert)
          .set({ isRead: true, readAt: new Date() })
          .where(and(eq(alert.userId, userId), eq(alert.referenceId, s.id)))
          .run();
      }

      // 3. Delete this expense's splitExpense rows
      tx.delete(splitExpense).where(eq(splitExpense.expenseId, id)).run();

      // 4. Delete the expense record itself
      tx.delete(expense)
        .where(and(eq(expense.id, id), eq(expense.userId, userId)))
        .run();

      return true;
    });

    // 5. Asynchronously dispatch push notifications to affected users
    if (this.jobQueue && pushJobs.length > 0) {
      for (const pJob of pushJobs) {
        this.jobQueue
          .enqueue('notification', 'DISPATCH_PUSH', pJob, { priority: 1 })
          .catch(() => {});
      }
    }

    return { success: true };
  }
}
