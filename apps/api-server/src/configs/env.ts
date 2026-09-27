import dotenv from 'dotenv';
import path from 'node:path';
import { envSchema, RawEnv } from '@kalya/validations';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Validates process.env variables against the Zod schema from @kalya/validations.
 *
 * @description Parses and validates environment variables against envSchema.
 * If validation fails, formats and logs each issue to stderr and terminates
 * the process with exit code 1 to prevent booting with invalid configuration.
 *
 * @returns {RawEnv} The parsed, coerced, and validated environment configuration object.
 */
function validateEnv(): RawEnv {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n [Config] Invalid Environment Variables:\n');

    for (const issue of result.error.issues) {
      const key = issue.path.join('.');
      console.error(`${key}: ${issue.message}`);
    }

    console.error('\n Please check your .env file aganist .env.example');
    process.exit(1);
  }
  return result.data;
}

/**
 * Validated and coerced environment variables loaded from process.env.
 */
export const rawEnv: RawEnv = validateEnv();
