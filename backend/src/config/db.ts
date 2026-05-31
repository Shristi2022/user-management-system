import { PrismaClient } from '@prisma/client';

// Instantiate PrismaClient with proper configuration
export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

/**
 * Initializes and tests the MySQL connection via Prisma Client.
 */
export const connectDB = async (): Promise<void> => {
  try {
    console.log('🔍 [Startup Diagnostic] Attempting to connect to MySQL database via Prisma...');
    // Responsible line: Line 15
    await prisma.$connect();
    console.log('📡 MySQL Database Connected Successfully via Prisma');
  } catch (error) {
    console.error('❌ MySQL Database Connection Failed');
    console.error('📂 Error source file: backend/src/config/db.ts');
    console.error('📍 Error source line: prisma.$connect() (Line 15)');
    console.error('Database connection error details:', error);
    process.exit(1);
  }
};
