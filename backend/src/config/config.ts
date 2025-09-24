import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default('postgresql://user:password@localhost:5432/quotes_db'),
  JWT_SECRET: z.string().default('your-super-secret-jwt-key-change-in-production'),
  QUOTE_API_URL: z.string().default('https://dummyjson.com/quotes'),
});

export const config = configSchema.parse(process.env);
