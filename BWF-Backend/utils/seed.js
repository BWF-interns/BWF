// utils/seed.js
// Seeds the database with test accounts for admin, warden, and student portals.
// Run with: node utils/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const USERS = [
  { name: 'BWF Admin',      auth_id: 'admin@bwf.org',      password: 'admin123',   role: 'admin'   },
  { name: 'Dr. Fatima',     auth_id: 'warden@bwf.org',     password: 'warden123',  role: 'warden'  },
  { name: 'Aisha Khan',     auth_id: 'BWF-2025-001',       password: 'student123', role: 'student' },
  { name: 'Mariyam Shah',   auth_id: 'BWF-2025-002',       password: 'student123', role: 'student' },
];

async function seed() {
  const uri = process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/bwf_db';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB:', uri);

  let created = 0;
  let skipped = 0;

  for (const u of USERS) {
    const exists = await User.findOne({ auth_id: u.auth_id });
    if (exists) {
      console.log('  SKIP (already exists):', u.auth_id);
      skipped++;
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ name: u.name, auth_id: u.auth_id, password: hashed, role: u.role });
    console.log('  CREATED:', u.auth_id, '|', u.role);
    created++;
  }

  console.log('\nDone. Created:', created, '  Skipped:', skipped);
  console.log('\nTest Accounts:');
  console.log('  Admin   -> admin@bwf.org    / admin123');
  console.log('  Warden  -> warden@bwf.org   / warden123');
  console.log('  Student -> BWF-2025-001     / student123');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
