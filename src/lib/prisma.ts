import { PrismaClient } from '@prisma/client';

// Check if we're running on the browser
const isBrowser = typeof window !== 'undefined';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

// Create a singleton Prisma client instance - only on server environment
let prisma: PrismaClient;

if (isBrowser) {
  // If running in browser, provide a mock or error
  console.warn('Prisma client should not be used directly in browser. Please use API routes instead.');
  prisma = {} as PrismaClient;
} else {
  // In Node.js environment
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    // In development, use a global variable to preserve the value across module reloads
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    prisma = globalForPrisma.prisma;
  }
}

export { prisma };