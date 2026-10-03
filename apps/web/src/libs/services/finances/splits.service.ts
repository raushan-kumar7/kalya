import { ENDPOINTS, http } from '@/api';
import {
  CreateSplitContactMemberDto,
  Expense,
  SettleSplitExpenseDto,
  SplitContactMember,
  SplitExpense,
  UpdateSplitContactMemberDto,
} from '@kalya/types';

export class SplitService {
  static async listContacts(): Promise<SplitContactMember[]> {
    return http.get<SplitContactMember[]>(ENDPOINTS.FINANCES.SPLITS.CONTACTS);
  }

  static async createContact(dto: CreateSplitContactMemberDto): Promise<SplitContactMember> {
    return http.post<SplitContactMember>(ENDPOINTS.FINANCES.SPLITS.CONTACTS, dto);
  }

  static async updateContact(
    id: string,
    dto: UpdateSplitContactMemberDto
  ): Promise<SplitContactMember> {
    return http.patch<SplitContactMember>(ENDPOINTS.FINANCES.SPLITS.CONTACT_DETAIL(id), dto);
  }

  static async deleteContact(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.FINANCES.SPLITS.CONTACT_DETAIL(id));
  }

  static async listPending(): Promise<
    (SplitExpense & { expense: Expense; member: SplitContactMember })[]
  > {
    return http.get<(SplitExpense & { expense: Expense; member: SplitContactMember })[]>(
      ENDPOINTS.FINANCES.SPLITS.SHARES_PENDING
    );
  }

  static async settleShare(id: string, dto: SettleSplitExpenseDto): Promise<SplitExpense> {
    return http.post<SplitExpense>(ENDPOINTS.FINANCES.SPLITS.SETTLE_SHARE(id), dto);
  }
}
