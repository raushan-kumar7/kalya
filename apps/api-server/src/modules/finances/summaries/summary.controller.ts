import { FastifyReply, FastifyRequest } from 'fastify';
import { SummaryService } from './summary.service';
import { ApiResponse } from '@/responses';
import { GenerateMonthlySummaryDto } from '@kalya/types';

export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  getOverview = async (
    request: FastifyRequest<{ Querystring: { month: string } }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const overview = await this.summaryService.getDashboardOverview(userId, request.query.month);
    return ApiResponse.ok(reply, overview, 'Dashboard financial overview evaluated');
  };

  generateStatement = async (
    request: FastifyRequest<{ Body: GenerateMonthlySummaryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const statement = await this.summaryService.generateMonthlyStatement(userId, request.body);
    return ApiResponse.created(reply, statement, 'Monthly summary statement generated');
  };
}
