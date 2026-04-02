// admin/routes.js
// All admin API endpoints. Protected by JWT auth + admin role check.

const express    = require('express');
const router     = express.Router();
const ctrl       = require('./controller');
const { authenticateToken } = require('../auth/middleware');

// Middleware: require valid JWT AND admin role
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

router.use(authenticateToken, requireAdmin);

// Overview
router.get('/overview', ctrl.getOverview);

// Students
router.get   ('/students',     ctrl.listStudents);
router.post  ('/students',     ctrl.addStudent);
router.put   ('/students/:id', ctrl.updateStudent);
router.delete('/students/:id', ctrl.deactivateStudent);

// Staff
router.get   ('/staff',     ctrl.listStaff);
router.post  ('/staff',     ctrl.addStaff);
router.put   ('/staff/:id', ctrl.updateStaff);
router.delete('/staff/:id', ctrl.deactivateStaff);

// Expenses
router.get   ('/expenses',     ctrl.listExpenses);
router.post  ('/expenses',     ctrl.addExpense);
router.put   ('/expenses/:id', ctrl.updateExpense);
router.delete('/expenses/:id', ctrl.deleteExpense);

// Finance KPIs
router.get ('/finance/kpis', ctrl.getFinanceKPIs);
router.post('/finance/kpis', ctrl.upsertFinanceKPI);

// Posts (social media / community)
router.get   ('/posts',     ctrl.listPosts);
router.post  ('/posts',     ctrl.addPost);
router.put   ('/posts/:id', ctrl.reviewPost);
router.delete('/posts/:id', ctrl.deletePost);

// Audit Logs (read-only)
router.get('/audit-logs', ctrl.getAuditLogs);

module.exports = router;
