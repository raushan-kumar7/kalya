import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { env } from '@kalya/env';

// Sub-services and controllers
import { BucketService } from './buckets/bucket.service';
import { BucketController } from './buckets/bucket.controller';
import { createBucketRoutes } from './buckets/bucket.routes';

import { CategoryService } from './categories/category.service';
import { CategoryController } from './categories/category.controller';
import { createCategoryRoutes } from './categories/category.routes';

import { IncomeService } from './income/income.service';
import { IncomeController } from './income/income.controller';
import { createIncomeRoutes } from './income/income.routes';

import { BudgetService } from './budgets/budget.service';
import { BudgetController } from './budgets/budget.controller';
import { createBudgetRoutes } from './budgets/budget.routes';

import { ExpenseService } from './expenses/expense.service';
import { ExpenseController } from './expenses/expense.controller';
import { createExpenseRoutes } from './expenses/expense.routes';

import { SplitService } from './splits/split.service';
import { SplitController } from './splits/split.controller';
import { createSplitRoutes } from './splits/split.routes';

import { GoalService } from './goals/goal.service';
import { GoalController } from './goals/goal.controller';
import { createGoalRoutes } from './goals/goal.routes';

import { AssetService } from './assets/asset.service';
import { AssetController } from './assets/asset.controller';
import { createAssetRoutes } from './assets/asset.routes';

import { SummaryService } from './summaries/summary.service';
import { SummaryController } from './summaries/summary.controller';
import { createSummaryRoutes } from './summaries/summary.routes';

export const financesPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    const db = fastify.db;
    const basePrefix = `/api/${env.app.apiVersion}/finances`;

    // 1. Buckets
    const bucketService = new BucketService(db);
    const bucketController = new BucketController(bucketService);
    await fastify.register(createBucketRoutes(bucketController), {
      prefix: `${basePrefix}/buckets`,
    });

    // 2. Categories
    const categoryService = new CategoryService(db);
    const categoryController = new CategoryController(categoryService);
    await fastify.register(createCategoryRoutes(categoryController), {
      prefix: `${basePrefix}/categories`,
    });

    // 3. Income
    const incomeService = new IncomeService(db);
    const incomeController = new IncomeController(incomeService);
    await fastify.register(createIncomeRoutes(incomeController), {
      prefix: `${basePrefix}/income`,
    });

    // 4. Budgets
    const budgetService = new BudgetService(db);
    const budgetController = new BudgetController(budgetService);
    await fastify.register(createBudgetRoutes(budgetController), {
      prefix: `${basePrefix}/budgets`,
    });

    // 5. Expenses
    const expenseService = new ExpenseService(db);
    const expenseController = new ExpenseController(expenseService);
    await fastify.register(createExpenseRoutes(expenseController), {
      prefix: `${basePrefix}/expenses`,
    });

    // 6. Splits
    const splitService = new SplitService(db);
    const splitController = new SplitController(splitService);
    await fastify.register(createSplitRoutes(splitController), { prefix: `${basePrefix}/splits` });

    // 7. Goals
    const goalService = new GoalService(db);
    const goalController = new GoalController(goalService);
    await fastify.register(createGoalRoutes(goalController), { prefix: `${basePrefix}/goals` });

    // 8. Assets
    const assetService = new AssetService(db);
    const assetController = new AssetController(assetService);
    await fastify.register(createAssetRoutes(assetController), { prefix: `${basePrefix}/assets` });

    // 9. Summaries
    const summaryService = new SummaryService(db);
    const summaryController = new SummaryController(summaryService);
    await fastify.register(createSummaryRoutes(summaryController), {
      prefix: `${basePrefix}/summaries`,
    });
  },
  {
    name: 'finances-plugin',
    dependencies: ['db-plugin', 'auth-plugin'],
  }
);
