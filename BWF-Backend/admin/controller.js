// admin/controller.js
// Full CRUD for students, staff, expenses, posts, finance KPIs, and audit logs.
// Every mutation auto-creates an AuditLog entry.

const Student    = require('../student/models/student');
const StaffMember = require('../models/StaffMember');
const Expense    = require('../models/Expense');
const Post       = require('../models/Post');
const FinanceKPI = require('../models/FinanceKPI');
const AuditLog   = require('../models/AuditLog');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function adminInfo(req) {
  return { adminId: req.user.sub, adminName: req.user.auth_id };
}

async function log(req, action, targetType, targetId, targetName, before, after) {
  try {
    await AuditLog.create({
      ...adminInfo(req), action, targetType,
      targetId: String(targetId), targetName, before, after
    });
  } catch { /* audit log failure must not break the main operation */ }
}

// ─── Overview ─────────────────────────────────────────────────────────────────

exports.getOverview = async (req, res) => {
  try {
    const [
      totalStudents, activeStaff, pendingExpenses,
      pendingPosts, staffAll, staffLeft12mo
    ] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      StaffMember.countDocuments({ status: 'active' }),
      Expense.countDocuments({ status: 'pending' }),
      Post.countDocuments({ status: 'pending' }),
      StaffMember.countDocuments(),
      StaffMember.countDocuments({
        leftOn: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const avgHeadcount = staffAll || 1;
    const volunteerTurnoverRatio = +(((staffLeft12mo / avgHeadcount) * 100).toFixed(1));

    // Certs expiring within 30 days
    const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const certAlerts = await StaffMember.countDocuments({
      'certifications.expiresOn': { $lte: in30days, $gte: new Date() }
    });

    // Home distribution
    const homeDist = await Student.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$home', count: { $sum: 1 } } }
    ]);

    // Latest expenses for the month (total)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const expensesThisMonth = await Expense.aggregate([
      { $match: { date: { $gte: monthStart }, status: { $in: ['approved', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalStudents, activeStaff, pendingExpenses, pendingPosts,
      volunteerTurnoverRatio, certAlerts,
      expensesThisMonth: expensesThisMonth[0]?.total || 0,
      homeDistribution: homeDist.map(h => ({ home: h._id, count: h.count }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Students ─────────────────────────────────────────────────────────────────

exports.listStudents = async (req, res) => {
  try {
    const { home, status, search } = req.query;
    const filter = {};
    if (home)   filter.home = home;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { studentId: new RegExp(search, 'i') }
    ];
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addStudent = async (req, res) => {
  try {
    const student = await Student.create({ ...req.body, verifiedBy: req.user.auth_id });
    await log(req, 'ADD_STUDENT', 'student', student._id, student.name, null, student.toObject());
    res.status(201).json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try {
    const before = await Student.findById(req.params.id).lean();
    if (!before) return res.status(404).json({ message: 'Student not found' });
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await log(req, 'EDIT_STUDENT', 'student', updated._id, updated.name, before, updated.toObject());
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deactivateStudent = async (req, res) => {
  try {
    const before = await Student.findById(req.params.id).lean();
    if (!before) return res.status(404).json({ message: 'Student not found' });
    const updated = await Student.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    await log(req, 'DEACTIVATE_STUDENT', 'student', updated._id, updated.name, before, { status: 'inactive' });
    res.json({ message: 'Student deactivated', student: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Staff ────────────────────────────────────────────────────────────────────

exports.listStaff = async (req, res) => {
  try {
    const { house, status, role } = req.query;
    const filter = {};
    if (house)  filter.house = house;
    if (status) filter.status = status;
    if (role)   filter.role = role;
    const staff = await StaffMember.find(filter).sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addStaff = async (req, res) => {
  try {
    const staff = await StaffMember.create(req.body);
    await log(req, 'ADD_STAFF', 'staff', staff._id, staff.name, null, staff.toObject());
    res.status(201).json(staff);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateStaff = async (req, res) => {
  try {
    const before = await StaffMember.findById(req.params.id).lean();
    if (!before) return res.status(404).json({ message: 'Staff not found' });
    const updated = await StaffMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await log(req, 'EDIT_STAFF', 'staff', updated._id, updated.name, before, updated.toObject());
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deactivateStaff = async (req, res) => {
  try {
    const before = await StaffMember.findById(req.params.id).lean();
    if (!before) return res.status(404).json({ message: 'Staff not found' });
    const updated = await StaffMember.findByIdAndUpdate(
      req.params.id, { status: 'inactive', leftOn: new Date() }, { new: true }
    );
    await log(req, 'DEACTIVATE_STAFF', 'staff', updated._id, updated.name, before, { status: 'inactive' });
    res.json({ message: 'Staff deactivated', staff: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Expenses ─────────────────────────────────────────────────────────────────

exports.listExpenses = async (req, res) => {
  try {
    const { home, status, category } = req.query;
    const filter = {};
    if (home)     filter.home = home;
    if (status)   filter.status = status;
    if (category) filter.category = category;
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, submittedBy: req.user.auth_id });
    await log(req, 'ADD_EXPENSE', 'expense', expense._id, expense.title, null, expense.toObject());
    res.status(201).json(expense);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateExpense = async (req, res) => {
  try {
    const before = await Expense.findById(req.params.id).lean();
    if (!before) return res.status(404).json({ message: 'Expense not found' });

    const updates = { ...req.body };
    // Track who approved/rejected
    if (updates.status === 'approved') updates.approvedBy = req.user.auth_id;
    if (updates.status === 'rejected') updates.rejectedBy = req.user.auth_id;

    const updated = await Expense.findByIdAndUpdate(req.params.id, updates, { new: true });
    const action = updates.status ? `${updates.status.toUpperCase()}_EXPENSE` : 'EDIT_EXPENSE';
    await log(req, action, 'expense', updated._id, updated.title, before, updated.toObject());
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await log(req, 'DELETE_EXPENSE', 'expense', expense._id, expense.title, expense.toObject(), null);
    res.json({ message: 'Expense deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Finance KPIs ─────────────────────────────────────────────────────────────

exports.getFinanceKPIs = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const kpis = await FinanceKPI.find({ year: Number(year) }).sort({ month: 1 });

    // Compute derived metrics per record
    const enriched = kpis.map(k => {
      const variance = k.actualExpenses - k.budget;
      const fundraisingROI = k.fundraisingCost > 0
        ? +(((k.donations - k.fundraisingCost) / k.fundraisingCost) * 100).toFixed(1) : null;
      const impactPerDollar = k.donations > 0
        ? +(k.beneficiariesServed / k.donations).toFixed(4) : null;
      return { ...k.toObject(), variance, fundraisingROI, impactPerDollar };
    });
    res.json(enriched);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.upsertFinanceKPI = async (req, res) => {
  try {
    const { year, month, home } = req.body;
    const before = await FinanceKPI.findOne({ year, month, home }).lean();
    const kpi = await FinanceKPI.findOneAndUpdate(
      { year, month, home }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await log(req, before ? 'EDIT_KPI' : 'ADD_KPI', 'kpi', kpi._id, `${home} ${month}/${year}`, before, kpi.toObject());
    res.json(kpi);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ─── Posts ────────────────────────────────────────────────────────────────────

exports.listPosts = async (req, res) => {
  try {
    const { status, home } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (home)   filter.home = home;
    const posts = await Post.find(filter).sort({ submittedOn: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addPost = async (req, res) => {
  try {
    const post = await Post.create(req.body);
    await log(req, 'ADD_POST', 'post', post._id, post.studentName, null, post.toObject());
    res.status(201).json(post);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.reviewPost = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const before = await Post.findById(req.params.id).lean();
    if (!before) return res.status(404).json({ message: 'Post not found' });
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: rejectionReason || '', reviewedBy: req.user.auth_id, reviewedOn: new Date() },
      { new: true }
    );
    await log(req, `${status.toUpperCase()}_POST`, 'post', updated._id, updated.studentName, before, updated.toObject());
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await log(req, 'DELETE_POST', 'post', post._id, post.studentName, post.toObject(), null);
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

exports.getAuditLogs = async (req, res) => {
  try {
    const { action, targetType, adminId, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (action)     filter.action = new RegExp(action, 'i');
    if (targetType) filter.targetType = targetType;
    if (adminId)    filter.adminId = adminId;
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(filter)
    ]);
    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
