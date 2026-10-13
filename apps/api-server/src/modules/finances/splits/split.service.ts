import {
  alert,
  and,
  category,
  desc,
  eq,
  expense,
  isNull,
  ne,
  or,
  schema,
  splitContactMember,
  splitExpense,
  splitInvitation,
} from '@kalya/db';
import {
  CreateSplitContactMemberDto,
  LinkSplitContactDto,
  RespondSplitInvitationDto,
  SettleSplitExpenseDto,
  SplitContactSuggestion,
  UpdateSplitContactMemberDto,
} from '@kalya/types';
import { BaseFinanceService } from '../common';
import { roundMoney } from '@kalya/utils';
import { BadRequestError, NotFoundError } from '@/errors';
import type { JobQueueService } from '../../jobs/job-queue.service';

export class SplitService extends BaseFinanceService {
  constructor(
    db: any,
    private readonly jobQueue?: JobQueueService
  ) {
    super(db);
  }

  /**
   * Retrieves user's split contacts, automatically syncing profile details from linked users.
   */
  async listContacts(userId: string) {
    const contacts = await this.db.query.splitContactMember.findMany({
      where: eq(splitContactMember.userId, userId),
      with: {
        linkedUser: true,
      },
    });

    return contacts.map((c) => {
      if (c.isLinked && c.linkedUser && c.autoSyncProfile) {
        return {
          ...c,
          image: c.linkedUser.image !== undefined ? c.linkedUser.image : c.image,
          name: c.linkedUser.name || c.name,
          email: c.linkedUser.email || c.email,
          phone: c.linkedUser.phone || c.phone,
        };
      }
      return c;
    });
  }

  /**
   * Creates a new split contact member, resolving details from a linked user if provided.
   */
  async createContact(userId: string, dto: CreateSplitContactMemberDto) {
    let resolvedImage = dto.image;
    let resolvedName = dto.name;
    let resolvedEmail = dto.email;
    let resolvedPhone = dto.phone;

    if (dto.linked_user_id) {
      if (dto.linked_user_id === userId) {
        throw new BadRequestError('Cannot add your own account as a split contact');
      }

      const [targetUser] = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, dto.linked_user_id))
        .limit(1);

      if (targetUser) {
        resolvedImage = targetUser.image || resolvedImage;
        resolvedName = resolvedName || targetUser.name;
        resolvedEmail = resolvedEmail || targetUser.email;
        resolvedPhone = resolvedPhone || targetUser.phone;
      }
    }

    const [created] = await this.db
      .insert(splitContactMember)
      .values({
        userId,
        linkedUserId: dto.linked_user_id || null,
        name: resolvedName,
        phone: resolvedPhone,
        email: resolvedEmail,
        image: resolvedImage,
        isLinked: Boolean(dto.is_linked || dto.linked_user_id),
        autoSyncProfile: dto.auto_sync_profile ?? true,
      })
      .returning();

    return created;
  }

  /**
   * Updates an existing contact's details and settings.
   */
  async updateContact(userId: string, id: string, dto: UpdateSplitContactMemberDto) {
    let resolvedImage = dto.image;
    if (dto.linked_user_id) {
      if (dto.linked_user_id === userId) {
        throw new BadRequestError('Cannot link contact to your own account');
      }
      const [targetUser] = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, dto.linked_user_id))
        .limit(1);
      if (targetUser && targetUser.image) {
        resolvedImage = targetUser.image;
      }
    }

    const [updated] = await this.db
      .update(splitContactMember)
      .set({
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(resolvedImage !== undefined ? { image: resolvedImage } : {}),
        ...(dto.is_linked !== undefined ? { isLinked: dto.is_linked } : {}),
        ...(dto.linked_user_id !== undefined
          ? {
              linkedUserId: dto.linked_user_id || null,
              isLinked: Boolean(dto.linked_user_id),
            }
          : {}),
        ...(dto.auto_sync_profile !== undefined ? { autoSyncProfile: dto.auto_sync_profile } : {}),
      })
      .where(and(eq(splitContactMember.id, id), eq(splitContactMember.userId, userId)))
      .returning();

    return updated;
  }

  /**
   * Links an unlinked manual contact to a registered Kalya platform user.
   */
  async linkContact(userId: string, contactId: string, dto: LinkSplitContactDto) {
    if (dto.linked_user_id === userId) {
      throw new BadRequestError('Cannot link contact to your own account');
    }

    const contact = await this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(splitContactMember)
        .where(and(eq(splitContactMember.id, contactId), eq(splitContactMember.userId, userId)))
        .limit(1);
      return row;
    }, 'Split Contact');

    const [targetUser] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, dto.linked_user_id))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundError('Target Kalya user not found');
    }

    const [updated] = await this.db
      .update(splitContactMember)
      .set({
        linkedUserId: targetUser.id,
        isLinked: true,
        name: targetUser.name || contact.name,
        email: targetUser.email || contact.email,
        phone: targetUser.phone || contact.phone,
        image: targetUser.image || contact.image,
        autoSyncProfile: dto.auto_sync_profile ?? true,
      })
      .where(eq(splitContactMember.id, contactId))
      .returning();

    return updated;
  }

  /**
   * Unlinks a split contact, reverting to standalone local contact mode.
   */
  async unlinkContact(userId: string, contactId: string) {
    await this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(splitContactMember)
        .where(and(eq(splitContactMember.id, contactId), eq(splitContactMember.userId, userId)))
        .limit(1);
      return row;
    }, 'Split Contact');

    const [updated] = await this.db
      .update(splitContactMember)
      .set({
        linkedUserId: null,
        isLinked: false,
      })
      .where(and(eq(splitContactMember.id, contactId), eq(splitContactMember.userId, userId)))
      .returning();

    return updated;
  }

  /**
   * Identifies unlinked contacts whose email or phone matches a registered Kalya user.
   */
  async getContactSuggestions(userId: string): Promise<SplitContactSuggestion[]> {
    const unlinked = await this.db
      .select()
      .from(splitContactMember)
      .where(and(eq(splitContactMember.userId, userId), eq(splitContactMember.isLinked, false)));

    const suggestions: SplitContactSuggestion[] = [];

    for (const contact of unlinked) {
      const conditions = [];
      if (contact.email && contact.email.trim()) {
        conditions.push(eq(schema.user.email, contact.email.trim().toLowerCase()));
      }
      if (contact.phone && contact.phone.trim()) {
        conditions.push(eq(schema.user.phone, contact.phone.trim()));
      }

      if (conditions.length === 0) continue;

      const [matched] = await this.db
        .select()
        .from(schema.user)
        .where(and(or(...conditions), ne(schema.user.id, userId)))
        .limit(1);

      if (matched) {
        suggestions.push({
          contact_id: contact.id,
          contact_name: contact.name || matched.name,
          matched_user: {
            id: matched.id,
            name: matched.name,
            username: matched.username,
            email: matched.email,
            phone: matched.phone,
            image: matched.image,
          },
          match_reason:
            contact.email && matched.email === contact.email.toLowerCase() ? 'email' : 'phone',
        });
      }
    }

    return suggestions;
  }

  /**
   * Lists pending split invitations for the current user (by receiver ID or matched email/phone).
   */
  async listInvitations(userId: string) {
    const [currentUser] = await this.db
      .select({ email: schema.user.email, phone: schema.user.phone })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    const conditions = [eq(splitInvitation.receiverUserId, userId)];
    if (currentUser?.email) {
      conditions.push(
        and(
          eq(splitInvitation.status, 'pending'),
          eq(splitInvitation.inviteeEmail, currentUser.email.toLowerCase())
        ) as any
      );
    }
    if (currentUser?.phone) {
      conditions.push(
        and(
          eq(splitInvitation.status, 'pending'),
          eq(splitInvitation.inviteePhone, currentUser.phone)
        ) as any
      );
    }

    return this.db.query.splitInvitation.findMany({
      where: and(or(...conditions), eq(splitInvitation.status, 'pending')),
      with: {
        sender: true,
        expense: true,
      },
      orderBy: [desc(splitInvitation.createdAt)],
    });
  }

  /**
   * Accepts or declines an incoming split invitation, orchestrating dual-sided ledger synchronization.
   */
  async respondInvitation(userId: string, invitationId: string, dto: RespondSplitInvitationDto) {
    const [currentUser] = await this.db
      .select({ email: schema.user.email, phone: schema.user.phone })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    const conditions = [eq(splitInvitation.receiverUserId, userId)];
    if (currentUser?.email) {
      conditions.push(eq(splitInvitation.inviteeEmail, currentUser.email.toLowerCase()) as any);
    }
    if (currentUser?.phone) {
      conditions.push(eq(splitInvitation.inviteePhone, currentUser.phone) as any);
    }

    const [invitation] = await this.db
      .select()
      .from(splitInvitation)
      .where(and(eq(splitInvitation.id, invitationId), or(...conditions)))
      .limit(1);

    if (!invitation) {
      throw new NotFoundError('Split invitation not found');
    }

    // Idempotency: If already accepted or declined, return immediately with 200 OK
    if (invitation.status === 'accepted' || invitation.status === 'declined') {
      return invitation;
    }

    if (dto.action === 'decline') {
      const [declined] = await this.db
        .update(splitInvitation)
        .set({
          status: 'declined',
          responseNote: dto.note || null,
          respondedAt: new Date().toISOString(),
        })
        .where(eq(splitInvitation.id, invitation.id))
        .returning();

      // Update sender's split line
      await this.db
        .update(splitExpense)
        .set({ syncStatus: 'declined' })
        .where(eq(splitExpense.id, invitation.splitExpenseId));

      return declined;
    }

    // Action: Accept -> Create reciprocal mirror expense in receiver's ledger
    // better-sqlite3 transactions are strictly SYNCHRONOUS: no async/await inside callback.
    const accepted = this.db.transaction((tx) => {
      // 1. Mark invitation accepted
      const acceptedInvitation = tx
        .update(splitInvitation)
        .set({
          status: 'accepted',
          receiverUserId: userId,
          respondedAt: new Date().toISOString(),
        })
        .where(eq(splitInvitation.id, invitation.id))
        .returning()
        .get();

      // 2. Fetch sender profile and original expense
      const senderUser = tx
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, invitation.senderUserId))
        .get();

      if (!senderUser) {
        throw new NotFoundError('Sender user not found');
      }

      const origExpense = tx
        .select()
        .from(expense)
        .where(eq(expense.id, invitation.expenseId))
        .get();

      if (!origExpense) {
        throw new NotFoundError('Original expense not found');
      }

      // 3. Ensure receiver has a split contact for sender
      let senderContact = tx
        .select()
        .from(splitContactMember)
        .where(
          and(
            eq(splitContactMember.userId, userId),
            eq(splitContactMember.linkedUserId, senderUser.id)
          )
        )
        .get();

      if (!senderContact) {
        senderContact = tx
          .insert(splitContactMember)
          .values({
            userId,
            linkedUserId: senderUser.id,
            name: senderUser.name,
            email: senderUser.email,
            phone: senderUser.phone,
            image: senderUser.image,
            isLinked: true,
            autoSyncProfile: true,
          })
          .returning()
          .get();
      }

      // 4. Resolve a category in receiver's ledger (Smart Category Resolution & Auto-Cloning)
      let targetCategoryId = origExpense.categoryId;
      const origCategory = tx
        .select()
        .from(category)
        .where(eq(category.id, origExpense.categoryId))
        .get();

      if (origCategory) {
        // Find if receiver already has matching category by key or case-insensitive label
        const receiverCategories = tx
          .select()
          .from(category)
          .where(eq(category.userId, userId))
          .all();

        const matchedCategory = receiverCategories.find(
          (c) =>
            c.key === origCategory.key ||
            c.label.trim().toLowerCase() === origCategory.label.trim().toLowerCase()
        );

        if (matchedCategory) {
          targetCategoryId = matchedCategory.id;
        } else {
          // Receiver doesn't have this category -> auto-clone it into receiver's ledger
          const origBucket = tx
            .select()
            .from(schema.bucket)
            .where(eq(schema.bucket.id, origCategory.bucketId))
            .get();

          const receiverBuckets = tx
            .select()
            .from(schema.bucket)
            .where(eq(schema.bucket.userId, userId))
            .all();

          let targetBucket = origBucket
            ? receiverBuckets.find((b) => b.key === origBucket.key)
            : undefined;

          if (!targetBucket) {
            targetBucket =
              receiverBuckets.find((b) => b.key === 'wants') ||
              receiverBuckets.find((b) => b.key === 'needs') ||
              receiverBuckets[0];
          }

          if (!targetBucket) {
            targetBucket = tx
              .insert(schema.bucket)
              .values({
                userId,
                key: 'wants',
                label: 'Wants',
                origin: 'built-in',
                targetPercent: 30,
                color: '#EC4899',
                icon: 'shopping-bag',
              })
              .returning()
              .get();
          }

          let candidateKey = origCategory.key || 'custom_split';
          if (receiverCategories.some((c) => c.key === candidateKey)) {
            candidateKey = `${candidateKey}_${Date.now()}`;
          }

          const clonedCategory = tx
            .insert(category)
            .values({
              userId,
              bucketId: targetBucket.id,
              key: candidateKey,
              label: origCategory.label,
              origin: 'custom',
              color: origCategory.color || '#6366F1',
              icon: origCategory.icon || 'receipt',
            })
            .returning()
            .get();

          targetCategoryId = clonedCategory.id;
        }
      } else {
        const fallbackCategory = tx
          .select()
          .from(category)
          .where(eq(category.userId, userId))
          .get();
        targetCategoryId = fallbackCategory?.id || origExpense.categoryId;
      }

      // 5. Create mirror expense in receiver's ledger
      const mirrorExpense = tx
        .insert(expense)
        .values({
          userId,
          date: origExpense.date,
          categoryId: targetCategoryId,
          description: `${origExpense.description} (Split by ${senderUser.name})`,
          amount: origExpense.amount,
          paymentMethod: origExpense.paymentMethod,
          isSplit: true,
          paidBy: senderContact.id, // Sender paid upfront
          yourShare: invitation.shareAmount, // Receiver owes their share
          splitType: origExpense.splitType,
        })
        .returning()
        .get();

      // 6. Create mirror splitExpense line in receiver's ledger
      const mirrorSplitExpense = tx
        .insert(splitExpense)
        .values({
          userId,
          expenseId: mirrorExpense.id,
          splitMemberId: senderContact.id,
          amount: invitation.shareAmount,
          settledAmount: 0,
          settled: false,
          peerSplitExpenseId: invitation.splitExpenseId,
          syncStatus: 'synced',
          invitationId: invitation.id,
          creatorUserId: invitation.senderUserId,
        })
        .returning()
        .get();

      // 7. Update sender's splitExpense with peer link and synced state
      tx.update(splitExpense)
        .set({
          peerSplitExpenseId: mirrorSplitExpense.id,
          syncStatus: 'synced',
        })
        .where(eq(splitExpense.id, invitation.splitExpenseId))
        .run();

      // 7.1 Auto-deduct / mutual debt netting between sender and receiver
      // Check if receiver (User B) already holds unsettled split debts where sender (User A) is debtor
      // i.e. receiver paid upfront (isNull(expense.paidBy)) and splitMemberId is senderContact.id
      const opposingShares = tx
        .select({
          id: splitExpense.id,
          amount: splitExpense.amount,
          settledAmount: splitExpense.settledAmount,
          peerSplitExpenseId: splitExpense.peerSplitExpenseId,
        })
        .from(splitExpense)
        .innerJoin(expense, eq(splitExpense.expenseId, expense.id))
        .where(
          and(
            eq(splitExpense.userId, userId),
            eq(splitExpense.splitMemberId, senderContact.id),
            eq(splitExpense.settled, false),
            isNull(expense.paidBy),
            ne(splitExpense.id, mirrorSplitExpense.id)
          )
        )
        .all();

      let remainingToDeduct = roundMoney(Number(invitation.shareAmount));
      let newMirrorSettled = 0;

      for (const opp of opposingShares) {
        if (remainingToDeduct <= 0) break;
        const oppOwed = Number(opp.amount ?? 0);
        const oppSettled = Number(opp.settledAmount ?? 0);
        const oppRemaining = roundMoney(Math.max(0, oppOwed - oppSettled));

        if (oppRemaining <= 0) continue;

        const offset = roundMoney(Math.min(remainingToDeduct, oppRemaining));
        if (offset > 0) {
          const newOppSettled = roundMoney(oppSettled + offset);
          const oppFullySettled = newOppSettled >= oppOwed;
          const nowIso = new Date().toISOString();

          // Settle or partially deduct opposing share in receiver's ledger
          tx.update(splitExpense)
            .set({
              settledAmount: newOppSettled,
              settled: oppFullySettled,
              settledVia: 'netting',
              settledAt: nowIso,
            })
            .where(eq(splitExpense.id, opp.id))
            .run();

          // Sync peer share in sender's ledger
          if (opp.peerSplitExpenseId) {
            tx.update(splitExpense)
              .set({
                settledAmount: newOppSettled,
                settled: oppFullySettled,
                settledVia: 'netting',
                settledAt: nowIso,
              })
              .where(eq(splitExpense.id, opp.peerSplitExpenseId))
              .run();
          }

          remainingToDeduct = roundMoney(remainingToDeduct - offset);
          newMirrorSettled = roundMoney(newMirrorSettled + offset);
        }
      }

      // If any mutual debt was offset, update mirror share and sender's share
      if (newMirrorSettled > 0) {
        const mirrorFullySettled = newMirrorSettled >= Number(invitation.shareAmount);
        const nowIso = new Date().toISOString();

        tx.update(splitExpense)
          .set({
            settledAmount: newMirrorSettled,
            settled: mirrorFullySettled,
            settledVia: 'netting',
            settledAt: nowIso,
          })
          .where(eq(splitExpense.id, mirrorSplitExpense.id))
          .run();

        tx.update(splitExpense)
          .set({
            settledAmount: newMirrorSettled,
            settled: mirrorFullySettled,
            settledVia: 'netting',
            settledAt: nowIso,
          })
          .where(eq(splitExpense.id, invitation.splitExpenseId))
          .run();
      }

      // 8. Create in-app alert for sender
      const receiverUser = tx.select().from(schema.user).where(eq(schema.user.id, userId)).get();

      tx.insert(alert)
        .values({
          userId: invitation.senderUserId,
          type: 'split_update',
          title: 'Split Invitation Accepted',
          message: `${receiverUser?.name || 'Your friend'} accepted the split for "${origExpense.description}". Both accounts are now synced.`,
          isRead: false,
          referenceType: 'split_expense',
          referenceId: invitation.splitExpenseId,
          metadata: {
            expenseId: invitation.expenseId,
            invitationId: invitation.id,
          },
        })
        .run();

      return acceptedInvitation;
    });

    // Mark any invitation alert for this receiver as read
    try {
      await this.db
        .update(alert)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(alert.userId, userId), eq(alert.referenceId, invitationId)))
        .run();
    } catch {
      // Non-critical cleanup
    }

    // Trigger instant push notification to sender that their split was accepted
    if (this.jobQueue && accepted) {
      try {
        const origExpense = await this.db.query.expense.findFirst({
          where: eq(expense.id, accepted.expenseId),
        });
        const receiverUser = await this.db.query.user.findFirst({
          where: eq(schema.user.id, userId),
        });

        await this.jobQueue.enqueue(
          'notification',
          'DISPATCH_PUSH',
          {
            userId: accepted.senderUserId,
            title: 'Split Accepted',
            body: `${receiverUser?.name || 'Your friend'} accepted the split for "${origExpense?.description || 'expense'}".`,
            url: '/dashboard/splits',
            data: {
              splitExpenseId: accepted.splitExpenseId,
              invitationId: accepted.id,
            },
          },
          { priority: 1 }
        );
      } catch {
        // Non-blocking background notification
      }
    }

    return accepted;
  }

  /**
   * Retrieves unsettled split shares for the user.
   */
  async listPendingShares(userId: string) {
    const shares = await this.db.query.splitExpense.findMany({
      where: and(eq(splitExpense.userId, userId), eq(splitExpense.settled, false)),
      with: {
        expense: true,
        member: {
          with: {
            linkedUser: true,
          },
        },
      },
    });

    return shares.map((s) => {
      if (s.member && s.member.isLinked && s.member.linkedUser && s.member.autoSyncProfile) {
        return {
          ...s,
          member: {
            ...s.member,
            image:
              s.member.linkedUser.image !== undefined ? s.member.linkedUser.image : s.member.image,
            name: s.member.linkedUser.name || s.member.name,
            email: s.member.linkedUser.email || s.member.email,
            phone: s.member.linkedUser.phone || s.member.phone,
          },
        };
      }
      return s;
    });
  }

  /**
   * Records a settlement payment, automatically updating mirror peer records if synced.
   */
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
    const settlementDate = dto.settled_at ?? new Date().toISOString();

    const [updated] = await this.db
      .update(splitExpense)
      .set({
        settledAmount: totalSettled,
        settled: isFullySettled,
        settledVia: dto.settled_via,
        settledAt: settlementDate,
      })
      .where(eq(splitExpense.id, shareId))
      .returning();

    // If linked to a peer mirror record, keep peer synchronized in the same phase
    if (share.peerSplitExpenseId) {
      await this.db
        .update(splitExpense)
        .set({
          settledAmount: totalSettled,
          settled: isFullySettled,
          settledVia: dto.settled_via,
          settledAt: settlementDate,
        })
        .where(eq(splitExpense.id, share.peerSplitExpenseId));
    }

    if (isFullySettled) {
      try {
        const relevantIds = [shareId, share.peerSplitExpenseId].filter(Boolean) as string[];
        for (const refId of relevantIds) {
          await this.db
            .update(alert)
            .set({ isRead: true, readAt: new Date() })
            .where(eq(alert.referenceId, refId))
            .run();
        }
      } catch {
        // Non-blocking cleanup
      }
    }

    return updated;
  }

  /**
   * Deletes a split contact.
   */
  async deleteContact(userId: string, id: string) {
    await this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(splitContactMember)
        .where(and(eq(splitContactMember.id, id), eq(splitContactMember.userId, userId)))
        .limit(1);
      return row;
    }, 'Split Contact');

    const [deleted] = await this.db
      .delete(splitContactMember)
      .where(and(eq(splitContactMember.id, id), eq(splitContactMember.userId, userId)))
      .returning();

    return deleted;
  }
}
