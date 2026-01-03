import { seedPowerCategories } from './01-power-categories';
import { seedStateRequirements } from './02-state-requirements';
import { seedStatutoryForms } from './03-statutory-forms';
import { seedNotaryTemplates } from './04-notary-templates';
import { seedIncapacityDefinitions } from './05-incapacity-definitions';
import { seedHealthcarePOAStateForms } from './06-healthcare-state-forms';

export async function seedPOA() {
  console.log('📋 Seeding POA data...\n');
  
  try {
    // Seed in order - some seeds may depend on previous ones
    await seedPowerCategories();
    await seedStateRequirements();
    await seedStatutoryForms();
    await seedNotaryTemplates();
    await seedIncapacityDefinitions();
    await seedHealthcarePOAStateForms();
    
    console.log('\n✅ POA seed complete');
  } catch (error) {
    console.error('❌ Error seeding POA data:', error);
    throw error;
  }
}
