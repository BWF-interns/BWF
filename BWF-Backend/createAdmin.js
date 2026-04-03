// BWF-Backend/createAdmin.js
// Run once to create/reset the admin user:
//   node createAdmin.js
// Or with a custom password:
//   node createAdmin.js myNewPassword

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const User     = require('./models/User');
require('dotenv').config();

const AUTH_ID  = 'admin@bwf.org';
const PASSWORD = process.argv[2] || 'admin123';

mongoose.connect(process.env.MONGO_LOCAL_URI)
  .then(async () => {
    const hash = await bcrypt.hash(PASSWORD, 10);
    const existing = await User.findOne({ auth_id: AUTH_ID });

    if (existing) {
      existing.password = hash;
      existing.role     = 'admin';
      await existing.save();
      console.log('Admin user password reset successfully.');
    } else {
      await User.create({ auth_id: AUTH_ID, password: hash, role: 'admin', name: 'BWF Admin' });
      console.log('Admin user created.');
    }

    console.log(`  ID:       ${AUTH_ID}`);
    console.log(`  Password: ${PASSWORD}`);
    console.log(`  Role:     admin`);
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
