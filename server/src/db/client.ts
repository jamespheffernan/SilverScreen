import type { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (!process.env.POSTGRES_URL) return null;
  if (prismaInstance) return prismaInstance;
  try {
    // Lazy import to avoid requiring prisma when not configured
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    prismaInstance = new PrismaClient();
    return prismaInstance;
  } catch {
    return null;
  }
}


