const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist-management';
const Destination = require('../src/models/Destination');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Querying destinations...');

    const destinations = await Destination.find({});
    console.log(`Found ${destinations.length} destinations to check.`);

    let migratedCount = 0;

    for (const dest of destinations) {
      // Access the raw document object to check for legacy 'image' field
      const rawDoc = dest.toObject({ virtuals: false });
      
      // If legacy 'image' exists as a field (string)
      if ('image' in rawDoc && typeof rawDoc.image === 'string') {
        const legacyImageUrl = rawDoc.image.trim();
        
        console.log(`Migrating destination "${dest.name}": legacy image="${legacyImageUrl}"`);

        // Map to images array
        if (legacyImageUrl !== '') {
          dest.images = [{ url: legacyImageUrl, publicId: null }];
        } else {
          dest.images = [];
        }

        // Unset legacy image field
        dest.set('image', undefined);
        await dest.save();
        migratedCount++;
      } else if (!dest.images || dest.images.length === 0) {
        // If no images array exists, initialize to empty
        dest.images = [];
        await dest.save();
        migratedCount++;
      }
    }

    console.log(`Migration complete! Successfully processed ${migratedCount} destinations.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
