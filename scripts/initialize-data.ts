import { storage } from '../server/storage';

async function initializeData() {
  try {
    console.log('Starting data initialization...');
    
    // Initialize sample data
    await storage.initializeSampleData();
    
    console.log('Data initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
}

initializeData();