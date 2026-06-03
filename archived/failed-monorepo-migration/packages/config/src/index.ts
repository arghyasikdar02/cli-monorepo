import { z } from 'zod';
const schema = z.object({
  APP_ENV: z.string().default('local'), APP_URL: z.string().url().default('http://localhost:3000'), DATABASE_URL: z.string().optional(), DIRECT_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(), SUPABASE_ANON_KEY: z.string().optional(), SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STORAGE_PROVIDER: z.enum(['local','supabase','r2']).default('local'), AI_PROVIDER: z.string().default('mock'), EMBEDDING_PROVIDER: z.string().default('mock'),
  CLIADM_API_URL: z.string().url().default('http://localhost:3000'), CLIADM_ADMIN_TOKEN: z.string().optional(), DOCUMENT_PAGE_TOKEN_SECRET: z.string().min(8).default('change-me'),
  LIVE_DEFAULT_JOIN_OPEN_MINUTES: z.coerce.number().default(15), AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(365)
});
export const env = schema.parse(process.env);
export type AppEnv = typeof env;
