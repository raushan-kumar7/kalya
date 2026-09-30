import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomeService } from './income.service';
import { ApiResponse } from '@/responses';
import { CreateIncomeDto, IncomeFilterQueryDto, UpdateIncomeDto } from '@kalya/types';

export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  list = async (
    request: FastifyRequest<{ Querystring: IncomeFilterQueryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.incomeService.listIncome(userId, request.query);
    return ApiResponse.ok(reply, items, 'Income records retrieved successfully');
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const item = await this.incomeService.getIncomeById(userId, request.params.id);
    return ApiResponse.ok(reply, item, 'Income retrieved successfully');
  };

  create = async (request: FastifyRequest<{ Body: CreateIncomeDto }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const created = await this.incomeService.createIncome(userId, request.body);
    return ApiResponse.created(reply, created, 'Income registered successfully');
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateIncomeDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.incomeService.updateIncome(userId, request.params.id, request.body);
    return ApiResponse.ok(reply, updated, 'Income updated successfully');
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    await this.incomeService.deleteIncome(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Income deleted successfully');
  };
}
