import { FastifyReply, FastifyRequest } from 'fastify';
import { BudgetService } from './budget.service';
import { ApiResponse } from '@/responses';
import { BudgetFilterQueryDto, CreateBudgetDto, UpdateBudgetDto } from '@kalya/types';

export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  list = async (
    request: FastifyRequest<{ Querystring: BudgetFilterQueryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.budgetService.listBudgets(userId, request.query);
    return ApiResponse.ok(reply, items, 'Budgets retrieved successfully');
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const item = await this.budgetService.getBudgetById(userId, request.params.id);
    return ApiResponse.ok(reply, item, 'Budget retrieved successfully');
  };

  getHealth = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const health = await this.budgetService.recomputeBudgetHealth(userId, request.params.id);
    return ApiResponse.ok(reply, health, 'Budget health evaluated successfully');
  };

  create = async (request: FastifyRequest<{ Body: CreateBudgetDto }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const created = await this.budgetService.createBudget(userId, request.body);
    return ApiResponse.created(reply, created, 'Budget plan created successfully');
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBudgetDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.budgetService.updateBudget(userId, request.params.id, request.body);
    return ApiResponse.ok(reply, updated, 'Budget updated successfully');
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    await this.budgetService.deleteBudget(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Budget deleted successfully');
  };
}
