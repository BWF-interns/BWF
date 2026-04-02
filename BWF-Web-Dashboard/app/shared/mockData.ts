export const STUDENT_DASHBOARD_DATA = {
  schedule: [
    { id: 1, time: "10:00 AM", title: "Math", actionText: "Join session" },
    { id: 2, time: "11:30 AM", title: "Vocational Training", actionText: "View details" },
    { id: 3, time: "2:00 PM", title: "Life Skills Workshop", actionText: "Join session" },
  ],
  assignments: [
    { id: 1, title: "Science Project", due: "Due tomorrow", status: "urgent" },
    { id: 2, title: "English Essay", due: "Due in 3 days", status: "normal" },
  ],
  mentor: {
    name: "Ms. Dana",
    role: "Your Mentor",
    dateLabel: "Today",
    avatarUrl: "https://ui-avatars.com/api/?name=Dana+Elomo&background=fce7f3&color=db2777&rounded=true",
    message:
      "Hi Aisha! Your group presentation for the Science module was excellent yesterday. Keep up the great momentum, and let me know if you need any resources for your upcoming assignments.",
  },
  inspiration: {
    quote: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    footer: "Take a deep breath and drop your shoulders before you begin.",
  },
};

export const WARDEN_DASHBOARD_DATA = {
  summary: {
    totalStudents: 3,
    pendingActivities: 2,
    pendingPosts: 1,
    monthlyExpenses: 1700,
    openComplaints: 2,
    inactiveStudents: 1,
  },
  feed: [
    { type: "complaint", message: "Arjun Kumar raised a complaint", status: "OPEN" },
    { type: "complaint", message: "Anonymous complaint raised", status: "OPEN" },
    { type: "expense", message: "Expense added for Meera Patel: ₹1200 (Education)" },
    { type: "expense", message: "Expense added for Arjun Kumar: ₹500 (Food)" },
  ],
  students: [
    { name: "Arjun Kumar", age: 16, education: "Class 10" },
    { name: "Meera Patel", age: 14, education: "Class 8" },
    { name: "Ravi Singh", age: 17, education: "Class 11" },
  ],
};
