// const Schedule = require('../models/Schedule');
// const Assignment = require('../models/Assignment');
// const MentorNote = require('../models/MentorNote');
// const Inspiration = require('../models/Inspiration');

// // Returns "YYYY-MM-DD" for today in local server time.
// // Used consistently across dashboard queries so everything is date-aligned.
// function getTodayString() {
//   return new Date().toISOString().split('T')[0];
// }

// // Today's schedule sorted by start time.
// // Limited to 10 — the dashboard card doesn't paginate.
// async function getTodaySchedule(auth_id) {
//   const today = getTodayString();
//   return Schedule.find({ auth_id, date: today })
//     .sort({ startTime: 1 })
//     .limit(10)
//     .lean();
// }

// // Recent assignments — up to 5, sorted by due date ascending so most urgent is first.
// // The dashboard only shows 2, but sending 5 gives the frontend flexibility.
// async function getRecentAssignments(auth_id) {
//   return Assignment.find({ auth_id })
//     .sort({ dueDate: 1 })
//     .limit(5)
//     .lean();
// }

// // Most recent mentor note for this student.
// async function getLatestMentorNote(auth_id) {
//   return MentorNote.findOne({ auth_id })
//     .sort({ createdAt: -1 })
//     .lean();
// }

// // Deterministic daily inspiration — no per-student state, offline-safe.
// // Rotates through the active quote pool using day-of-year.
// async function getDailyInspiration() {
//   const quotes = await Inspiration.find({ isActive: true }).lean();
//   if (!quotes.length) return null;

//   const dayOfYear = Math.floor(
//     (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
//   );
//   return quotes[dayOfYear % quotes.length];
// }

// module.exports = {
//   getTodaySchedule,
//   getRecentAssignments,
//   getLatestMentorNote,
//   getDailyInspiration,
//   getTodayString
// };