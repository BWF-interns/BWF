const express = require("express");
const router = express.Router();

const {
  getStudent,
  updateStudent
} = require("./controller");

const {
  authenticateToken,
  authorizeRoles,
  authorizeSelfOrAdmin
} = require("../../auth/middleware");

router.get(
  "/:auth_id",
  authenticateToken,
  authorizeRoles("student", "admin"),
  authorizeSelfOrAdmin,
  getStudent
);

router.put(
  "/:auth_id",
  authenticateToken,
  authorizeRoles("student"),
  authorizeSelfOrAdmin,
  updateStudent
);

module.exports = router;