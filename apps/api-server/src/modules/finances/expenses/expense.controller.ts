import { FastifyReply, FastifyRequest } from 'fastify';
import { ExpenseService } from './expense.service';
import { ApiResponse } from '@/responses';
import { CreateExpenseDto, ExpenseFilterQueryDto, UpdateExpenseDto } from '@kalya/types';

export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  list = async (
    request: FastifyRequest<{ Querystring: ExpenseFilterQueryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.expenseService.listExpenses(userId, request.query);
    return ApiResponse.ok(reply, items, 'Expenses retrieved successfully');
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const item = await this.expenseService.getExpenseById(userId, request.params.id);
    return ApiResponse.ok(reply, item, 'Expense retrieved successfully');
  };

  create = async (request: FastifyRequest<{ Body: CreateExpenseDto }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const created = await this.expenseService.createExpense(userId, request.body);
    return ApiResponse.created(reply, created, 'Expense recorded successfully');
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateExpenseDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.expenseService.updateExpense(
      userId,
      request.params.id,
      request.body
    );
    return ApiResponse.ok(reply, updated, 'Expense updated successfully');
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    await this.expenseService.deleteExpense(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Expense deleted successfully');
  };
}
