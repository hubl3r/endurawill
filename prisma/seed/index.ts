import { PrismaClient } from '@prisma/client';
import { seedPowerCategories } from './power-categories';
import { seedStateRequirements } from './state-requirements';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding POA data...\n');

  try {
    await seedPowerCategories(prisma);
    await seedStateRequirements(prisma);
    console.log('\n✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
