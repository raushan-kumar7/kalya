import { FastifyReply, FastifyRequest } from 'fastify';
import { GoalService } from './goal.service';
import { ApiResponse } from '@/responses';
import { CreateGoalDto, GoalFilterQueryDto, UpdateGoalDto } from '@kalya/types';

export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  list = async (
    request: FastifyRequest<{ Querystring: GoalFilterQueryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.goalService.listGoals(userId, request.query);
    return ApiResponse.ok(reply, items, 'Goals retrieved successfully');
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const item = await this.goalService.getGoalById(userId, request.params.id);
    return ApiResponse.ok(reply, item, 'Goal retrieved successfully');
  };

  create = async (request: FastifyRequest<{ Body: CreateGoalDto }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const created = await this.goalService.createGoal(userId, request.body);
    return ApiResponse.created(reply, created, 'Goal created successfully');
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateGoalDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.goalService.updateGoal(userId, request.params.id, request.body);
    return ApiResponse.ok(reply, updated, 'Goal updated successfully');
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    await this.goalService.deleteGoal(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Goal deleted successfully');
  };
}
