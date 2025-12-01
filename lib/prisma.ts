import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// NOTE: To use this in your API routes:
// import { prisma } from '@/lib/prisma';
//
// Then you can use it like:
// const user = await prisma.user.findUnique({ where: { clerkId: 'xxx' } });
