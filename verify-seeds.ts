// Run this after seeding to verify all data was created correctly
// Usage: npx ts-node verify-seeds.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeed() {
  console.log('🔍 Verifying seed data...\n');

  try {
    const powerCats = await prisma.pOAPowerCategoryDefinition.count();
    const subPowers = await prisma.pOASubPowerDefinition.count();
    const states = await prisma.stateRequirements.count();
    const forms = await prisma.statutoryPOAForm.count();
    const notaryTemplates = await prisma.notaryBlockTemplate.count();
    const incapacityDefs = await prisma.incapacityDefinition.count();
    const healthcareForms = await prisma.healthcarePOAStateForm.count();

    console.log('📊 Seed Data Counts:\n');
    console.log(`Power Categories:        ${powerCats} / 14 expected ${powerCats === 14 ? '✅' : '❌'}`);
    console.log(`Sub-Powers:              ${subPowers} / 51 expected ${subPowers === 51 ? '✅' : '❌'}`);
    console.log(`State Requirements:      ${states} / 51 expected ${states === 51 ? '✅' : '❌'}`);
    console.log(`Statutory Forms:         ${forms} / 7 expected ${forms === 7 ? '✅' : '❌'}`);
    console.log(`Notary Templates:        ${notaryTemplates} / 5 expected ${notaryTemplates === 5 ? '✅' : '❌'}`);
    console.log(`Incapacity Definitions:  ${incapacityDefs} / 6 expected ${incapacityDefs === 6 ? '✅' : '❌'}`);
    console.log(`Healthcare Forms:        ${healthcareForms} / 7 expected ${healthcareForms === 7 ? '✅' : '❌'}`);

    const total = powerCats + subPowers + states + forms + notaryTemplates + incapacityDefs + healthcareForms;
    console.log(`\n📈 Total Records:         ${total} / 141 expected ${total === 141 ? '✅' : '❌'}\n`);

    // Check for dangerous powers
    const dangerousCats = await prisma.pOAPowerCategoryDefinition.findMany({
      where: { isDangerous: true },
      select: { categoryNumber: true, categoryName: true }
    });

    console.log('⚠️  Dangerous Power Categories:');
    dangerousCats.forEach(cat => {
      console.log(`   ${cat.categoryNumber}. ${cat.categoryName}`);
    });

    // Check for strict states
    console.log('\n🔒 Very Strict States:');
    const strictStates = await prisma.stateRequirements.findMany({
      where: { strictnessLevel: 'very_strict' },
      select: { state: true, stateName: true }
    });
    strictStates.forEach(s => {
      console.log(`   ${s.state} - ${s.stateName}`);
    });

    // Check state that bans springing POAs
    const bansSpringing = await prisma.stateRequirements.findMany({
      where: { allowsSpringing: false },
      select: { state: true, stateName: true, springingBannedReason: true }
    });
    console.log('\n🚫 States Banning Springing POAs:');
    bansSpringing.forEach(s => {
      console.log(`   ${s.state} - ${s.stateName}: ${s.springingBannedReason}`);
    });

    console.log('\n✅ Seed verification complete!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed();
