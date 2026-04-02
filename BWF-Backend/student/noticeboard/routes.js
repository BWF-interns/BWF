// const express = require('express');
// const router = express.Router();
// const {
//   getNotices,
//   markRead,
//   markAllRead,
//   dismissNotice,
//   getUnreadBadge
// } = require('./controller');
// const { authenticateToken, authorizeRoles, authorizeSelfOrAdmin } = require("../../auth/middleware");

// // All routes require auth. Students only see their own notice state.

// router.get(
//   '/:auth_id',
//   authenticateToken,
//   authorizeRoles('student', 'admin'),
//   authorizeSelfOrAdmin,
//   getNotices
// );

// router.get(
//   '/:auth_id/unread-count',
//   authenticateToken,
//   authorizeRoles('student', 'admin'),
//   authorizeSelfOrAdmin,
//   getUnreadBadge
// );

// router.post(
//   '/:auth_id/notices/:noticeId/read',
//   authenticateToken,
//   authorizeRoles('student'),
//   authorizeSelfOrAdmin,
//   markRead
// );

// router.post(
//   '/:auth_id/read-all',
//   authenticateToken,
//   authorizeRoles('student'),
//   authorizeSelfOrAdmin,
//   markAllRead
// );

// // DELETE maps to the X button — dismisses a notice from the student's view
// router.delete(
//   '/:auth_id/notices/:noticeId',
//   authenticateToken,
//   authorizeRoles('student'),
//   authorizeSelfOrAdmin,
//   dismissNotice
// );

// module.exports = router;