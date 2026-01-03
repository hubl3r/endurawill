import { PrismaClient } from '@prisma/client';
import { seedPOA } from './poa';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log('============================================\n');
  
  try {
    // Seed POA data
    await seedPOA();
    
    // Future: Add other feature seeds here
    // await seedWills();
    // await seedTrusts();
    
    console.log('\n============================================');
    console.log('✅ All seeds completed successfully!');
    console.log('============================================\n');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
