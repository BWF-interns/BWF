const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const StaffProfile = require('../models/StaffProfile');
const Donor = require('../models/Donor');
const Expense = require('../models/Expense');
const Request = require('../models/Request');
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const ADMIN = ['admin', 'founder'];

// ─── MASTER OVERVIEW ─────────────────────────────────────────────────────────
// GET /api/admin/overview
router.get('/overview', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const [
            totalStudents,
            totalStaff,
            activeStaff,
            pendingRequests,
            urgentRequests,
            pendingPosts,
            consentMissing,
            totalExpensesResult,
            totalDonorsResult,
            thisMonthExpenses,
            thisYearDonations,
            pendingExpenses
        ] = await Promise.all([
            Student.countDocuments(),
            User.countDocuments({ role: { $in: ['housemother', 'dean'] } }),
            StaffProfile.countDocuments({ status: 'Active' }),
            Request.countDocuments({ status: { $in: ['pending', 'seen'] } }),
            Request.countDocuments({ urgency: 'urgent', status: { $in: ['pending', 'seen'] } }),
            Post.countDocuments({ status: 'pending_review' }),
            Student.countDocuments({ guardianConsent: false }),
            Expense.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            Donor.aggregate([{ $group: { _id: null, total: { $sum: { $reduce: { input: '$donationHistory', initialValue: 0, in: { $add: ['$$value', '$$this.amount'] } } } } } }]),
            Expense.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            Donor.aggregate([{ $unwind: '$donationHistory' }, { $match: { 'donationHistory.date': { $gte: startOfYear } } }, { $group: { _id: null, total: { $sum: '$donationHistory.amount' } } }]),
            Expense.countDocuments({ status: 'Pending' })
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                totalStaff,
                activeStaff,
                pendingRequests,
                urgentRequests,
                pendingPosts,
                consentMissing,
                totalExpenses: totalExpensesResult[0]?.total || 0,
                totalDonations: totalDonorsResult[0]?.total || 0,
                thisMonthExpenses: thisMonthExpenses[0]?.total || 0,
                thisYearDonations: thisYearDonations[0]?.total || 0,
                pendingExpenses
            }
        });
    } catch (error) { next(error); }
});

// ─── WELFARE ANALYTICS ───────────────────────────────────────────────────────
// GET /api/admin/welfare
router.get('/welfare', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const [
            byProgram,
            byHomeGroup,
            byGender,
            byBackground,
            joinedPerMonth,
            avgXP,
            avgStreak
        ] = await Promise.all([
            Student.aggregate([{ $group: { _id: '$bwfProgram', count: { $sum: 1 } } }]),
            Student.aggregate([{ $group: { _id: '$homeGroup', count: { $sum: 1 } } }]),
            Student.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]),
            Student.aggregate([{ $group: { _id: '$familyDetails.background', count: { $sum: 1 } } }]),
            Student.aggregate([
                { $group: { _id: { year: { $year: '$joinDate' }, month: { $month: '$joinDate' } }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
                { $limit: 12 }
            ]),
            Student.aggregate([{ $group: { _id: null, avg: { $avg: '$totalPoints' } } }]),
            Student.aggregate([{ $group: { _id: null, avg: { $avg: '$streak' } } }])
        ]);

        // Age distribution (groups: Under 10, 10-13, 14-16, 17+)
        const now = new Date();
        const students = await Student.find().select('dateOfBirth');
        const ageDist = { 'Under 10': 0, '10–13': 0, '14–16': 0, '17+': 0 };
        students.forEach(s => {
            if (!s.dateOfBirth) return;
            const age = Math.floor((now - s.dateOfBirth) / (365.25 * 24 * 3600 * 1000));
            if (age < 10) ageDist['Under 10']++;
            else if (age <= 13) ageDist['10–13']++;
            else if (age <= 16) ageDist['14–16']++;
            else ageDist['17+']++;
        });

        res.json({
            success: true,
            data: {
                byProgram,
                byHomeGroup,
                byGender,
                byBackground,
                joinedPerMonth,
                ageDist,
                avgXP: Math.round(avgXP[0]?.avg || 0),
                avgStreak: Math.round(avgStreak[0]?.avg || 0)
            }
        });
    } catch (error) { next(error); }
});

// ─── DPDP COMPLIANCE ─────────────────────────────────────────────────────────
// GET /api/admin/compliance
router.get('/compliance', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const students = await Student.find()
            .populate('user', 'name email')
            .populate('dpdpConsent.verifiedBy', 'name')
            .select('user studentId homeGroup guardianConsent dpdpConsent joinDate bwfProgram');

        const consentMissing = students.filter(s => !s.guardianConsent);
        const dpdpVerified = students.filter(s => s.dpdpConsent?.isVerified);
        const dpdpUnverified = students.filter(s => !s.dpdpConsent?.isVerified);

        // Students joined > 30 days ago with no consent — data retention risk
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
        const retentionRisk = students.filter(s =>
            !s.guardianConsent && s.joinDate < thirtyDaysAgo
        );

        res.json({
            success: true,
            data: {
                total: students.length,
                consentMissing: consentMissing.length,
                dpdpVerified: dpdpVerified.length,
                dpdpUnverified: dpdpUnverified.length,
                retentionRisk: retentionRisk.length,
                students,
                retentionRiskList: retentionRisk
            }
        });
    } catch (error) { next(error); }
});

// PUT /api/admin/compliance/:studentId — record guardian consent
router.put('/compliance/:studentId', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const { verificationMethod, action } = req.body;
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        student.guardianConsent = true;
        student.dpdpConsent.isVerified = true;
        student.dpdpConsent.verifiedBy = req.user._id;
        student.dpdpConsent.verificationMethod = verificationMethod || 'Offline Form';
        student.dpdpConsent.auditTrail.push({
            action: action || 'Consent verified',
            changedBy: req.user._id,
            timestamp: new Date()
        });

        await student.save();
        res.json({ success: true, message: 'Consent recorded', data: student.dpdpConsent });
    } catch (error) { next(error); }
});

// ─── RISK & EARLY WARNINGS ───────────────────────────────────────────────────
// GET /api/admin/risk
router.get('/risk', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000);

        const [
            recentUrgentRequests,
            medicalRequestsThisWeek,
            medicalRequestsLastWeek,
            disengaged,
            urgentByType
        ] = await Promise.all([
            Request.find({ urgency: 'urgent', createdAt: { $gte: sevenDaysAgo } })
                .populate({ path: 'student', populate: { path: 'user', select: 'name' }, select: 'user homeGroup' })
                .sort('-createdAt').limit(20),
            Request.countDocuments({ type: 'medicine', createdAt: { $gte: sevenDaysAgo } }),
            Request.countDocuments({ type: 'medicine', createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
            Student.find({ streak: 0 }).populate('user', 'name').select('user homeGroup totalPoints streak').limit(20),
            Request.aggregate([
                { $match: { urgency: 'urgent', createdAt: { $gte: sevenDaysAgo } } },
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        // Medical spike: >50% increase this week vs last
        const medicalSpike = medicalRequestsLastWeek > 0 &&
            ((medicalRequestsThisWeek - medicalRequestsLastWeek) / medicalRequestsLastWeek) > 0.5;

        // Risk radar scores (0-10)
        const riskRadar = {
            medicalRisk: Math.min(10, medicalRequestsThisWeek),
            engagementRisk: Math.min(10, disengaged.length),
            urgencyRisk: Math.min(10, recentUrgentRequests.length),
            consentRisk: Math.min(10, Math.round(await Student.countDocuments({ guardianConsent: false }) / 2)),
            mediaRisk: Math.min(10, Math.round(await Post.countDocuments({ status: 'pending_review' }) / 2))
        };

        res.json({
            success: true,
            data: {
                medicalSpike,
                medicalRequestsThisWeek,
                medicalRequestsLastWeek,
                disengagedCount: disengaged.length,
                disengaged,
                recentUrgentRequests,
                urgentByType,
                riskRadar
            }
        });
    } catch (error) { next(error); }
});

// ─── FINANCE ─────────────────────────────────────────────────────────────────
// GET /api/admin/finance
router.get('/finance', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);

        const [
            expensesByCategory,
            expensesMonthly,
            donationsMonthly,
            allExpenses,
            totalStudents,
            totalDonorsResult,
            recurringDonors
        ] = await Promise.all([
            Expense.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
            Expense.aggregate([
                { $match: { createdAt: { $gte: startOfYear } } },
                { $group: { _id: { month: { $month: '$createdAt' } }, total: { $sum: '$amount' } } },
                { $sort: { '_id.month': 1 } }
            ]),
            Donor.aggregate([
                { $unwind: '$donationHistory' },
                { $match: { 'donationHistory.date': { $gte: startOfYear } } },
                { $group: { _id: { month: { $month: 'donationHistory.date' } }, total: { $sum: '$donationHistory.amount' } } },
                { $sort: { '_id.month': 1 } }
            ]),
            Expense.find().populate('approvedBy', 'name').populate('loggedBy', 'name').sort('-createdAt').limit(50),
            Student.countDocuments(),
            Donor.aggregate([{ $group: { _id: null, totalDonors: { $sum: 1 }, totalRaised: { $sum: { $reduce: { input: '$donationHistory', initialValue: 0, in: { $add: ['$$value', '$$this.amount'] } } } } } }]),
            Donor.countDocuments({ isRecurring: true })
        ]);

        const totalRaised = totalDonorsResult[0]?.totalRaised || 0;
        const totalDonors = totalDonorsResult[0]?.totalDonors || 0;
        const totalExpensesPaid = expensesByCategory.reduce((s, c) => s + c.total, 0);
        const programExpenses = expensesByCategory.find(c => c._id === 'Program/Mission')?.total || 0;
        const overheadExpenses = expensesByCategory.find(c => c._id === 'Overhead/Admin')?.total || 0;
        const fundraisingInvestment = expensesByCategory.find(c => c._id === 'Fundraising Investment')?.total || 1;

        res.json({
            success: true,
            data: {
                totalRaised,
                totalExpenses: totalExpensesPaid,
                netBalance: totalRaised - totalExpensesPaid,
                programEfficiencyRatio: totalExpensesPaid > 0 ? Math.round((programExpenses / totalExpensesPaid) * 100) : 0,
                overheadRatio: totalExpensesPaid > 0 ? Math.round((overheadExpenses / totalExpensesPaid) * 100) : 0,
                fundraisingROI: Math.round(totalRaised / fundraisingInvestment),
                costPerBeneficiary: totalStudents > 0 ? Math.round(programExpenses / totalStudents) : 0,
                donorRetentionRate: totalDonors > 0 ? Math.round((recurringDonors / totalDonors) * 100) : 0,
                totalDonors,
                recurringDonors,
                expensesByCategory,
                expensesMonthly,
                donationsMonthly,
                recentExpenses: allExpenses
            }
        });
    } catch (error) { next(error); }
});

// POST /api/admin/expenses — log new expense
router.post('/expenses', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const { title, amount, category, associatedHomeGroup, description, date } = req.body;
        const expense = await Expense.create({
            title, amount, category,
            associatedHomeGroup: associatedHomeGroup || '',
            description: description || '',
            date: date ? new Date(date) : new Date(),
            loggedBy: req.user._id
        });
        res.status(201).json({ success: true, data: expense });
    } catch (error) { next(error); }
});

// PUT /api/admin/expenses/:id — approve or mark paid
router.put('/expenses/:id', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const { status } = req.body;
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            { status, approvedBy: req.user._id },
            { new: true }
        );
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.json({ success: true, data: expense });
    } catch (error) { next(error); }
});

// ─── STAFF MANAGEMENT ────────────────────────────────────────────────────────
// GET /api/admin/staff
router.get('/staff', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const staffUsers = await User.find({ role: { $in: ['housemother', 'dean', 'admin'] } });
        const profiles = await StaffProfile.find().populate('user', 'name email role homeGroup');

        // Build augmented list merging user and profile
        const staffMap = new Map(profiles.map(p => [p.user._id.toString(), p]));

        const staffList = staffUsers.map(u => {
            const profile = staffMap.get(u._id.toString());
            return {
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                homeGroup: u.homeGroup,
                staffType: profile?.staffType || 'Paid Employee',
                caseloadSize: profile?.caseloadSize || 0,
                certifications: profile?.certifications || [],
                status: profile?.status || 'Active',
                joiningDate: profile?.joiningDate || u.createdAt
            };
        });

        // Turnover ratio
        const departed = await StaffProfile.countDocuments({ status: 'Departed' });
        const active = await StaffProfile.countDocuments({ status: 'Active' });
        const turnoverRatio = active > 0 ? Math.round((departed / active) * 100) : 0;

        // Expiring certifications (within 30 days)
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const expiringCerts = profiles.flatMap(p =>
            (p.certifications || [])
                .filter(c => c.expiryDate && c.expiryDate <= thirtyDaysFromNow)
                .map(c => ({ staffName: p.user?.name, cert: c.name, expiryDate: c.expiryDate }))
        );

        res.json({ success: true, data: { staffList, turnoverRatio, departed, active, expiringCerts } });
    } catch (error) { next(error); }
});

// ─── DONORS ──────────────────────────────────────────────────────────────────
// GET /api/admin/donors
router.get('/donors', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const donors = await Donor.find().sort('-createdAt');
        const byType = await Donor.aggregate([{ $group: { _id: '$donorType', count: { $sum: 1 } } }]);

        res.json({ success: true, data: { donors, byType } });
    } catch (error) { next(error); }
});

// POST /api/admin/donors
router.post('/donors', protect, authorize(...ADMIN), async (req, res, next) => {
    try {
        const { name, email, phone, donorType, acquisitionCampaign, isRecurring, amount, allocatedTo } = req.body;
        const donor = await Donor.create({
            name, email, phone: phone || '',
            donorType: donorType || 'Individual',
            acquisitionCampaign: acquisitionCampaign || '',
            isRecurring: isRecurring || false,
            donationHistory: amount ? [{ amount: Number(amount), allocatedTo: allocatedTo || 'General Fund' }] : []
        });
        res.status(201).json({ success: true, data: donor });
    } catch (error) { next(error); }
});

module.exports = router;
