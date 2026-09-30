import { CronExpressionParser } from 'cron-parser';

/**
 * Validates a standard 5-part cron syntax string (e.g. '0 9 * * 1-5') using cron-parser.
 */
export function isValidCron(expression: string): boolean {
  if (!expression || typeof expression !== 'string') return false;

  try {
    CronExpressionParser.parse(expression.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Computes the next scheduled execution Date for a given cron expression.
 */
export function getNextCronRunDate(expression: string, fromDate?: Date): Date | null {
  try {
    const interval = CronExpressionParser.parse(expression.trim(), {
      currentDate: fromDate ?? new Date(),
    });
    return interval.next().toDate();
  } catch {
    return null;
  }
}

/**
 * Computes the next N scheduled execution Dates for a given cron expression.
 */
export function getNextCronRunDates(
  expression: string,
  count: number = 5,
  fromDate?: Date
): Date[] {
  try {
    const interval = CronExpressionParser.parse(expression.trim(), {
      currentDate: fromDate ?? new Date(),
    });
    const results: Date[] = [];
    for (let i = 0; i < count; i++) {
      results.push(interval.next().toDate());
    }
    return results;
  } catch {
    return [];
  }
}
