import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetService } from './asset.service';
import { ApiResponse } from '@/responses';
import {
  CreateDigitalAssetDto,
  CreateEquityAssetDto,
  DigitalAssetFilterQueryDto,
  EquityAssetFilterQueryDto,
} from '@kalya/types';

export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  listDigital = async (
    request: FastifyRequest<{ Querystring: DigitalAssetFilterQueryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.assetService.listDigitalAssets(userId, request.query);
    return ApiResponse.ok(reply, items, 'Digital commodity assets retrieved');
  };

  createDigital = async (
    request: FastifyRequest<{ Body: CreateDigitalAssetDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const created = await this.assetService.createDigitalAsset(userId, request.body);
    return ApiResponse.created(reply, created, 'Digital asset purchase logged');
  };

  listEquities = async (
    request: FastifyRequest<{ Querystring: EquityAssetFilterQueryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.assetService.listEquityAssets(userId, request.query);
    return ApiResponse.ok(reply, items, 'Equities portfolio retrieved');
  };

  createEquity = async (
    request: FastifyRequest<{ Body: CreateEquityAssetDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const created = await this.assetService.createEquityAsset(userId, request.body);
    return ApiResponse.created(reply, created, 'Equity stock purchase recorded');
  };

  getPortfolioSummary = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const summary = await this.assetService.getPortfolioSummary(userId);
    return ApiResponse.ok(reply, summary, 'Portfolio summary evaluated');
  };
}
