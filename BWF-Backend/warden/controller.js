const User = require('../models/User');
const bcrypt = require('bcrypt');

async function createStudent(req, res) {
  try {
    const { name, auth_id, password } = req.body;

    // Basic validation
    if (!name || !auth_id || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ auth_id });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = new User({
      name,
      auth_id,
      password: hashedPassword,
      role: 'student'
    });

    await student.save();

    return res.status(201).json({
      message: "Student created successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createStudent
};