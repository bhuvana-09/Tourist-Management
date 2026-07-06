/**
 * Sprint 2 Data Migration Seed Script:
 * 
 * 1. Upsert Strategy:
 *    To ensure idempotency, this script uses findOneAndUpdate with upsert: true. 
 *    - Destinations are upserted based on their unique `name`.
 *    - Packages are upserted based on their unique `packageName`.
 *    - Itineraries are upserted based on the composite unique signature `{ destinationId, day, activity, time }`.
 *    - Bookings are upserted based on the composite unique signature `{ packageId, name, email, phone, travelers, date }`.
 *    This ensures that subsequent executions of this seed script do not result in duplicate records.
 * 
 * 2. Name-Based Matching Choice:
 *    In version 1, itineraries and bookings reference Destinations and Packages by name strings (known technical debt).
 *    During this migration, we resolve these name-string references to their MongoDB ObjectIds.
 *    - We load all Destinations and Packages and cache their ObjectIds using their names as keys.
 *    - For each Itinerary and Booking, we perform a lookup against these caches.
 *    - Mismatches or broken references (e.g. references to items not defined in the source data) are reported as warnings 
 *      and skipped gracefully so the script completes without crashing.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Import environment variables first
const { MONGODB_URI } = require('../src/config/env');

const Destination = require('../src/models/Destination');
const Package = require('../src/models/Package');
const Itinerary = require('../src/models/Itinerary');
const Booking = require('../src/models/Booking');

const seed = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected successfully.');

    // 1. Check for duplicate names in Destinations before migrating to avoid crashing on unique index creation
    console.log('Checking for duplicate destination names in MongoDB...');
    const duplicateDestinations = await Destination.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateDestinations.length > 0) {
      console.error('\nCRITICAL ERROR: Duplicate destination names found in MongoDB:');
      duplicateDestinations.forEach((dup) => {
        console.error(`- "${dup._id}" has ${dup.count} entries`);
      });
      console.error('Please resolve these duplicates manually in Atlas before running the seed script.\n');
      process.exit(1);
    }
    console.log('No duplicate destination names found. Proceeding with migration...');

    // 2. Read db.json
    const dbPath = path.resolve(__dirname, '../../db.json');
    if (!fs.existsSync(dbPath)) {
      throw new Error(`db.json not found at ${dbPath}`);
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const summary = {
      destinations: { inserted: 0, updated: 0, skipped: 0 },
      packages: { inserted: 0, updated: 0, skipped: 0 },
      itineraries: { inserted: 0, updated: 0, skipped: 0 },
      bookings: { inserted: 0, updated: 0, skipped: 0 }
    };

    // 3. Migrate Destinations
    console.log('\n--- Seeding Destinations ---');
    const destLookup = {}; // To store name -> id mapping

    if (dbData.destinations && Array.isArray(dbData.destinations)) {
      for (const dest of dbData.destinations) {
        if (!dest.name) {
          console.warn(`[WARNING] Skipping destination ID ${dest.id} - missing name.`);
          summary.destinations.skipped++;
          continue;
        }

        const existing = await Destination.findOne({ name: dest.name });
        const updatedDoc = await Destination.findOneAndUpdate(
          { name: dest.name },
          {
            name: dest.name,
            location: dest.location || '',
            description: dest.description || '',
            image: dest.image || ''
          },
          { new: true, upsert: true }
        );

        destLookup[dest.name.toLowerCase().trim()] = updatedDoc._id;

        if (existing) {
          summary.destinations.updated++;
        } else {
          summary.destinations.inserted++;
        }
      }
    }

    // Cache any existing database destinations not in db.json to destLookup
    const allDbDestinations = await Destination.find({});
    allDbDestinations.forEach((d) => {
      destLookup[d.name.toLowerCase().trim()] = d._id;
    });

    // 4. Migrate Packages
    console.log('\n--- Seeding Packages ---');
    const pkgLookup = {}; // To store packageName -> id mapping

    if (dbData.packages && Array.isArray(dbData.packages)) {
      for (const pkg of dbData.packages) {
        if (!pkg.packageName) {
          console.warn(`[WARNING] Skipping package ID ${pkg.id} - missing packageName.`);
          summary.packages.skipped++;
          continue;
        }

        const existing = await Package.findOne({ packageName: pkg.packageName });
        const updatedDoc = await Package.findOneAndUpdate(
          { packageName: pkg.packageName },
          {
            packageName: pkg.packageName,
            price: Number(pkg.price) || 0,
            duration: pkg.duration || '',
            description: pkg.description || '',
            image: pkg.image || '',
            destinationName: pkg.destinationName || ''
          },
          { new: true, upsert: true }
        );

        pkgLookup[pkg.packageName.toLowerCase().trim()] = updatedDoc._id;

        if (existing) {
          summary.packages.updated++;
        } else {
          summary.packages.inserted++;
        }
      }
    }

    // Cache any existing database packages in case
    const allDbPackages = await Package.find({});
    allDbPackages.forEach((p) => {
      pkgLookup[p.packageName.toLowerCase().trim()] = p._id;
    });

    // 5. Migrate Itineraries
    console.log('\n--- Seeding Itineraries ---');
    if (dbData.itineraries && Array.isArray(dbData.itineraries)) {
      for (const itin of dbData.itineraries) {
        const destKey = (itin.destinationName || '').toLowerCase().trim();
        const destinationId = destLookup[destKey];

        if (!destinationId) {
          console.warn(`[WARNING] Skipping itinerary ID ${itin.id} - no matching destination named "${itin.destinationName}"`);
          summary.itineraries.skipped++;
          continue;
        }

        const existing = await Itinerary.findOne({
          destinationId,
          day: Number(itin.day),
          activity: itin.activity,
          time: itin.time
        });

        await Itinerary.findOneAndUpdate(
          {
            destinationId,
            day: Number(itin.day),
            activity: itin.activity,
            time: itin.time
          },
          {
            destinationId,
            day: Number(itin.day),
            activity: itin.activity,
            time: itin.time
          },
          { new: true, upsert: true }
        );

        if (existing) {
          summary.itineraries.updated++;
        } else {
          summary.itineraries.inserted++;
        }
      }
    }

    // 6. Migrate Bookings
    console.log('\n--- Seeding Bookings ---');
    if (dbData.bookings && Array.isArray(dbData.bookings)) {
      for (const booking of dbData.bookings) {
        const pkgKey = (booking.packageName || '').toLowerCase().trim();
        const packageId = pkgLookup[pkgKey];

        if (!packageId) {
          console.warn(`[WARNING] Skipping booking ID ${booking.id} - no matching package named "${booking.packageName}"`);
          summary.bookings.skipped++;
          continue;
        }

        const existing = await Booking.findOne({
          packageId,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          travelers: Number(booking.travelers),
          date: booking.date
        });

        await Booking.findOneAndUpdate(
          {
            packageId,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            travelers: Number(booking.travelers),
            date: booking.date
          },
          {
            packageId,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            travelers: Number(booking.travelers),
            date: booking.date
          },
          { new: true, upsert: true }
        );

        if (existing) {
          summary.bookings.updated++;
        } else {
          summary.bookings.inserted++;
        }
      }
    }

    // 7. Log Summary
    console.log('\n=========================================');
    console.log('            MIGRATION SUMMARY            ');
    console.log('=========================================');
    console.log('Collection   | Inserted | Updated | Skipped');
    console.log('-------------|----------|---------|--------');
    console.log(`Destinations | ${summary.destinations.inserted.toString().padEnd(8)} | ${summary.destinations.updated.toString().padEnd(7)} | ${summary.destinations.skipped}`);
    console.log(`Packages     | ${summary.packages.inserted.toString().padEnd(8)} | ${summary.packages.updated.toString().padEnd(7)} | ${summary.packages.skipped}`);
    console.log(`Itineraries  | ${summary.itineraries.inserted.toString().padEnd(8)} | ${summary.itineraries.updated.toString().padEnd(7)} | ${summary.itineraries.skipped}`);
    console.log(`Bookings     | ${summary.bookings.inserted.toString().padEnd(8)} | ${summary.bookings.updated.toString().padEnd(7)} | ${summary.bookings.skipped}`);
    console.log('=========================================');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed. Seeding completed.');
  } catch (error) {
    console.error('\nSeed error:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seed();
