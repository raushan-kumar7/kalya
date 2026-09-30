import { FastifyReply, FastifyRequest } from 'fastify';
import { BucketService } from './bucket.service';
import { ApiResponse } from '@/responses';
import { CreateBucketDto, UpdateBucketDto } from '@kalya/types';

export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const items = await this.bucketService.listBuckets(userId);
    return ApiResponse.ok(reply, items, 'Buckets retrieved successfully');
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const item = await this.bucketService.getBucketById(userId, request.params.id);
    return ApiResponse.ok(reply, item, 'Bucket retrieved successfully');
  };

  create = async (request: FastifyRequest<{ Body: CreateBucketDto }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const created = await this.bucketService.createBucket(userId, request.body);
    return ApiResponse.created(reply, created, 'Bucket created successfully');
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateBucketDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.bucketService.updateBucket(userId, request.params.id, request.body);
    return ApiResponse.ok(reply, updated, 'Bucket updated successfully');
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    await this.bucketService.deleteBucket(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Bucket deleted successfully');
  };
}
