const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../auth/middleware');
const { createStudent } = require('./controller');

// Warden creates student
router.post(
  '/create-student',
  authenticateToken,
  authorizeRoles('warden'),
  createStudent
);

module.exports = router;