import { FastifyReply, FastifyRequest } from 'fastify';
import { SplitService } from './split.service';
import { ApiResponse } from '@/responses';
import {
  CreateSplitContactMemberDto,
  SettleSplitExpenseDto,
  UpdateSplitContactMemberDto,
} from '@kalya/types';

export class SplitController {
  constructor(private readonly splitService: SplitService) {}

  listContacts = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const items = await this.splitService.listContacts(userId);
    return ApiResponse.ok(reply, items, 'Contacts retrieved successfully');
  };

  createContact = async (
    request: FastifyRequest<{ Body: CreateSplitContactMemberDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const created = await this.splitService.createContact(userId, request.body);
    return ApiResponse.created(reply, created, 'Contact added successfully');
  };

  updateContact = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSplitContactMemberDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.splitService.updateContact(userId, request.params.id, request.body);
    return ApiResponse.ok(reply, updated, 'Contact updated successfully');
  };

  listPending = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const items = await this.splitService.listPendingShares(userId);
    return ApiResponse.ok(reply, items, 'Pending split shares retrieved');
  };

  settle = async (
    request: FastifyRequest<{ Params: { id: string }; Body: SettleSplitExpenseDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.splitService.settleShare(userId, request.params.id, request.body);
    return ApiResponse.ok(reply, updated, 'Split expense settled successfully');
  };

  deleteContact = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    await this.splitService.deleteContact(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Contact deleted successfully');
  };
}
