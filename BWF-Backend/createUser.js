const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User'); // adjust if needed

async function createUser() {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = new User({
  name: 'Warden User',
  auth_id: 'Warden@bwf.com',
  password: hashedPassword,
  role: 'warden'
});

  await user.save();

  console.log("✅ User created");
  process.exit();
}

createUser();