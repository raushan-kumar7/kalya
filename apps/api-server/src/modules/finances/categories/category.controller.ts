import { FastifyReply, FastifyRequest } from 'fastify';
import { CategoryService } from './category.service';
import { ApiResponse } from '@/responses';
import { CreateCategoryDto, UpdateCategoryDto } from '@kalya/types';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  list = async (
    request: FastifyRequest<{ Querystring: { bucket_id?: string } }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.categoryService.listCategories(userId, request.query.bucket_id);
    return ApiResponse.ok(reply, items, 'Categories retrieved successfully');
  };

  getById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const item = await this.categoryService.getCategoryById(userId, request.params.id);
    return ApiResponse.ok(reply, item, 'Category retrieved successfully');
  };

  create = async (request: FastifyRequest<{ Body: CreateCategoryDto }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const created = await this.categoryService.createCategory(userId, request.body);
    return ApiResponse.created(reply, created, 'Category created successfully');
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCategoryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.categoryService.updateCategory(
      userId,
      request.params.id,
      request.body
    );
    return ApiResponse.ok(reply, updated, 'Category updated successfully');
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    await this.categoryService.deleteCategory(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Category deleted successfully');
  };
}
