import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load server .env, fallback to root .env
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().default('development-hod-jwt-secret-key-2026-secure-token'),
  PORT: z.string().default('3001').transform((val) => parseInt(val, 10)),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FIREBASE_PROJECT_ID: z.string().optional().default('lms-college-5975a'),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('[Config Error] Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables configuration');
}

export const env = _env.data;
