import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
const dotenvResult = dotenv.config({
  path: path.join(__dirname, '../../.env'),
});

console.log(
  '🔍 [Startup Diagnostic] dotenv load result:',
  dotenvResult.error
    ? `Failed (${dotenvResult.error.message})`
    : 'Success'
);

console.log(
  '🔍 [Startup Diagnostic] DATABASE_URL env exists:',
  !!process.env.DATABASE_URL
);

console.log(
  '🔍 [Startup Diagnostic] NODE_ENV VALUE =',
  process.env.NODE_ENV
);

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, {
    message: 'Database URL is required.',
  }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment configuration error:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;