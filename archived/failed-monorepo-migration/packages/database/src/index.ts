import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: process.env.APP_ENV === 'local' ? ['warn','error'] : ['error'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export async function databaseHealth() { try { await prisma.$queryRaw`select 1`; return { ok: true }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'unknown' }; } }
