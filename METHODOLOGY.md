# BWF Portal — Software Methodology Document
Version: 1.0 | Date: May 2026 | Internal Reference

---

## 1. Project Overview

Better World Foundation (BWF) manages residential children's homes across J&K.
This portal centralises admin oversight of students, staff, finances, activities,
community content, and grievance resolution across 4 homes:
Jammu | Anantnag | Kupwara | Beerwah

### Roles
| Role    | Access                               |
|---------|--------------------------------------|
| Admin   | Full system — all homes              |
| Warden  | Home-scoped read/write               |
| Student | Self-profile + community feed        |
| Staff   | View + limited edit                  |

---

## 2. Technology Stack

| Layer      | Technology            | Version |
|------------|-----------------------|---------|
| Frontend   | Next.js (App Router)  | 15.x    |
| UI         | React                 | 19.x    |
| Charts     | Recharts              | 2.x     |
| Backend    | Node.js + Express     | 24 / 4  |
| Database   | MongoDB               | 8.x     |
| ODM        | Mongoose              | 8.x     |
| Auth       | JWT (jsonwebtoken)    | —       |
| Passwords  | bcrypt (10 rounds)    | —       |
| Email      | Nodemailer + Gmail    | —       |
| Env        | dotenvx               | —       |

---

## 3. System Architecture

```
Clients (port 3000 / 3001)
        |  HTTPS + JWT
BWF-Backend Express (port 5000)
        |  Mongoose ODM
MongoDB (port 27017) — db: bwf_db
```

### Directory Structure

```
BWF-Backend/
  auth/           JWT login, refresh, logout
  admin/          All admin CRUD + moderation + reports
  student/        Student profile, wellbeing, courses
  warden/         Warden routes + pending approval models
  models/         Shared Mongoose schemas
  utils/          DB config, mailer (Nodemailer)

BWF-Web-Dashboard/app/admin/
  dashboard/      KPI charts (Recharts bar/pie/line)
  students/       Student management
  staff/          Caseload + certifications
  finance/        Expenses + KPIs
  community/      Post moderation + live feed
  activities/     Activity approval + management
  complaints/     Complaint resolution (OPEN/RESOLVED/ESCALATED)
  grievances/     SoS + Help system with email alert
  calendar/       Events + auto birthdays
  reports/        CSV export + summaries
  feedback/       Student/staff star-rated feedback
  audit-logs/     Immutable action history
```

---

## 4. Database Collections & Schemas

### 4.1 Users
```
_id         ObjectId (PK)
auth_id     String  unique  (e.g. admin@bwf.org, BWF-2024-1)
name        String
password    String  (bcrypt hash)
role        Enum: admin | warden | student
refreshToken String
```

### 4.2 Student
```
_id           ObjectId (PK)
userId        ObjectId -> Users
studentId     String unique  BWF-JMU-2026-001 (auto-generated)
name          String
home          Enum: Jammu|Anantnag|Kupwara|Beerwah
status        Enum: active|inactive|graduated
DOB           Date
gender        Enum: male|female|other
className     String
schoolName    String
xp            Number (gamification)
interests     [String]
trustedPerson { name, phone, relation }
```

### 4.3 StaffMember
```
_id           ObjectId (PK)
name          String
email         String
role          Enum: housemother|dean|counsellor|warden|volunteer|admin_staff
house         Enum: Jammu|Anantnag|Kupwara|Beerwah|All
type          Enum: full-time|part-time|volunteer
caseload      Number
status        Enum: active|inactive|on_leave
certifications [{ name, completedOn, expiresOn, status }]
permissions   { viewStudents, editStudents, approveExpenses, manageMedia, viewReports }
joinedOn      Date
```

### 4.4 Expense
```
_id             ObjectId (PK)
title           String
category        Enum: Food|Education|Medical|Cosmetics|Utilities|Maintenance|Events|Other
amount          Number
date            Date
home            Enum: Jammu|Anantnag|Kupwara|Beerwah|All
status          Enum: pending|approved|rejected|paid
submittedBy     String (auth_id)
approvedBy      String (auth_id)
rejectionReason String
```

### 4.5 Grievance (SoS / Help)
```
_id           ObjectId (PK)
submittedBy   String
role          Enum: student|staff|warden
home          String
type          Enum: sos|help
subject       String
message       String
priority      Enum: critical|high|medium|low  (sos always = critical)
status        Enum: open|in_progress|resolved|closed
emailSent     Boolean
resolvedBy    String
resolvedAt    Date
```

### 4.6 PendingPost (Community Moderation)
```
_id             ObjectId (PK)
content         String
type            Enum: text|poll
tags            [String]
pollOptions     [{ text }]
creatorId       ObjectId -> Users
creatorName     String
creatorRole     String
hostelName      String
status          Enum: pending|approved|rejected
reviewedBy      String
rejectionReason String
reviewedAt      Date
```

### 4.7 LivePost (Approved Community Feed)
```
_id              ObjectId (PK)
content          String
type             Enum: text|poll
pollOptions      [{ text, votes }]
voters           [{ userId, optionIndex }]
pinned           Boolean
creatorId        ObjectId -> Users
approvedBy       String
originalPendingId String -> PendingPost._id
```

### 4.8 PendingActivity
```
_id             ObjectId (PK)
title           String
description     String
requestedBy     String
requesterRole   Enum: Student|Staff|Warden
date            Date
time            String
location        String
category        Enum: Cultural|Sports|Technical|Academic|Social|Entertainment
hostelName      String
status          Enum: pending|approved|rejected
rejectionReason String
```

### 4.9 Activity (Approved)
```
_id           ObjectId (PK)
title         String
category      Enum: Cultural|Sports|Technical|Academic|Social|Entertainment
date          Date
hostelName    String
approvedBy    String
status        Enum: upcoming|ongoing|completed|cancelled
```

### 4.10 WardenComplaint
```
_id       ObjectId (PK)
title     String
role      Enum: student|staff
priority  Enum: Low|Medium|High
status    Enum: OPEN|RESOLVED|ESCALATED
reporter  String
timeline  {
  reportedDate, resolvedDate, resolvedReason,
  escalatedDate, escalatedReason
}
```

### 4.11 CalendarEvent
```
_id         ObjectId (PK)
title       String
date        Date
type        Enum: birthday|holiday|ngo|custom|academic
home        String (null = all homes)
linkedId    String -> Student or Staff _id
linkedRole  Enum: student|staff
isRecurring Boolean (yearly for birthdays)
createdBy   String
```

### 4.12 AuditLog
```
_id         ObjectId (PK)
adminId     String
adminName   String
action      String  e.g. ADD_STUDENT, APPROVE_EXPENSE
targetType  String  student|staff|expense|post|activity
targetId    String
before      Mixed (snapshot before change)
after       Mixed (snapshot after change)
timestamp   Date
```

### 4.13 Feedback
```
submittedBy  String
role         String
home         String
category     String
rating       Number (1-5)
message      String
anonymous    Boolean
status       Enum: open|reviewed|closed
```

### 4.14 FinanceKPI
```
home              String
year              Number
month             Number
totalBudget       Number
totalSpent        Number
donationsReceived Number
sponsorships      Number
```

---

## 5. ER Diagram (Text Representation)

```
Users ─────────────────────── Student
  |  1:1 (userId FK)            |
  |                      MoodLog, MentorNote,
  |                      Schedule, Journal (1:N)
  |
  └──── creates ─────── PendingPost ──(approve)──> LivePost
  |
  └──── creates ─────── PendingActivity ──(approve)──> Activity
  |
  └──── submits ─────── Grievance
  |
  └──── submits ─────── WardenComplaint
  |
  └──── logs ────────── Expense ──(approve)──> status:paid
  |
StaffMember  (separate from Users — admin-managed record)
  |
  └──── linked via ──── CalendarEvent (birthday type)

Admin Actions ─────────────── AuditLog (immutable, 1 per mutation)
```

---

## 6. Authentication Flow

```
POST /api/login { id, password }
  → validate ID format
  → User.findOne({ auth_id })
  → bcrypt.compare(password, hash)
  → generateAccessToken()   expiry: 15min
  → generateRefreshToken()  expiry: 7 days
  → save refreshToken to User doc
  → return { role, accessToken }
  → set cookie: refreshToken (httpOnly)

All protected routes:
  → authenticateToken() verifies JWT
  → requireAdmin() checks role === 'admin'
  → controller runs
```

---

## 7. Approval Workflows

### Post Moderation
```
Student submits → PendingPost{status:pending}
Admin reviews   → APPROVE → copy to LivePost (auto)
                → REJECT  → rejectionReason stored
```

### Activity Approval
```
Warden/Student → PendingActivity{pending}
Admin reviews  → APPROVE → Activity{upcoming}
Admin manages  → upcoming → ongoing → completed
```

### Expense Flow
```
Staff logs → Expense{pending}
Admin      → APPROVE → {approved} → {paid}
           → REJECT  → reason stored, audit logged
```

### SoS Alert
```
User submits SoS
  → Grievance{type:sos, priority:critical} saved
  → Nodemailer email → ADMIN_EMAIL (immediate)
  → Sidebar shows 🔴 pulse badge
  → Admin resolves → {resolved}
```

---

## 8. API Quick Reference

### Auth
| Method | Endpoint       | Description         |
|--------|---------------|---------------------|
| POST   | /api/login     | Login, returns JWT  |
| POST   | /api/refresh   | Refresh access token|
| POST   | /api/logout    | Invalidate session  |

### Admin (all require Bearer token + admin role)
| Method        | Endpoint                          | Description           |
|---------------|-----------------------------------|-----------------------|
| GET           | /api/admin/overview               | Dashboard KPIs        |
| GET/POST      | /api/admin/students               | List / Add student    |
| PUT/DELETE    | /api/admin/students/:id           | Edit / Deactivate     |
| GET/POST      | /api/admin/staff                  | List / Add staff      |
| PUT/DELETE    | /api/admin/staff/:id              | Edit / Remove         |
| GET/POST      | /api/admin/expenses               | Expenses              |
| GET/POST      | /api/admin/finance/kpis           | Finance KPIs          |
| GET           | /api/admin/reports/summary        | Reports + CSV         |
| GET/PUT/DELETE| /api/admin/community/pending      | Post moderation       |
| GET/POST      | /api/admin/community/posts        | Live feed             |
| PUT           | /api/admin/community/posts/:id/pin| Pin/unpin             |
| GET/PUT/DELETE| /api/admin/activities/pending     | Activity approval     |
| GET/POST      | /api/admin/activities             | Live activities       |
| GET/PUT       | /api/admin/complaints             | Complaints            |
| PUT           | /api/admin/complaints/:id/resolve | Resolve               |
| PUT           | /api/admin/complaints/:id/escalate| Escalate              |
| GET/POST/PUT  | /api/admin/grievances             | SoS / Help            |
| GET/POST/PUT  | /api/admin/feedback               | Feedback              |
| GET/POST/DELETE| /api/admin/calendar/events       | Calendar              |
| GET           | /api/admin/audit-logs             | Audit trail           |

---

## 9. Security

```
Layer 1 — Transport:   HTTPS in production, CORS allowlist
Layer 2 — Auth:        JWT 15-min access + 7-day refresh rotation
Layer 3 — Role Guard:  requireAdmin() on all /api/admin/*
Layer 4 — Passwords:   bcrypt salt rounds = 10
Layer 5 — Audit:       Every mutation → AuditLog (never deleted)
Layer 6 — Email:       Gmail App Password (not account password)
```

### Environment Variables
```
PORT=5000
MONGO_LOCAL_URI=mongodb://127.0.0.1:27017/bwf_db
ACCESS_TOKEN_SECRET=<32-char-random>
REFRESH_TOKEN_SECRET=<different-32-char-random>
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=<gmail-app-password>
ADMIN_EMAIL=admin@bwf.org
```

---

## 10. Development Standards

### Commit Convention
```
feat(scope): description    new feature
fix(scope): description     bug fix
refactor(scope): desc       cleanup
docs: description           documentation
```

### Code Review Checklist
- [ ] Endpoint uses authenticateToken + requireAdmin
- [ ] Every mutation logged to AuditLog
- [ ] Enums validated server-side
- [ ] Frontend handles loading / error / empty states
- [ ] No passwords or tokens in API responses
- [ ] New models imported in admin/controller.js

### Naming Conventions
```
Backend models:      PascalCase.js   (StaffMember.js)
Backend controllers: camelCase.js    (controller.js)
Frontend pages:      page.tsx        (Next.js App Router)
Frontend components: PascalCase.tsx  (AdminSidebar.tsx)
Frontend lib:        camelCase.ts    (api.ts)
```

---

## 11. Content Formatting Rule

Community post content supports inline bold:
```
Input:   "Results are #out now# check it"
Renders: "Results are <strong>out now</strong> check it"
```
The frontend splits on `#word#` and wraps in `<strong>`.

---

## 12. Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (at F:\mongoFIles\bin\mongod.exe)
- Git

### Start Everything
```batch
:: Run starter-bwfadmin.bat
start "" "F:\mongoFIles\bin\mongod.exe" --dbpath "F:\mongoFIles\data\db"
timeout /t 3
start cmd /k "cd /d F:\BWF\BWF-Backend && node index.js"
start cmd /k "cd /d F:\BWF\BWF-Web-Dashboard && npm run dev"
```

### Create Admin Account (first time only)
```
cd F:\BWF\BWF-Backend
node createAdmin.js
```
Default: admin@bwf.org / admin123

### URLs
- Admin Dashboard: http://localhost:3000/admin/login
- Backend API:     http://localhost:5000
- MongoDB:         mongodb://127.0.0.1:27017/bwf_db

---

## 13. Production Deployment (Render.com)

- Backend: https://bwf-backend-zkz2.onrender.com
- Set MONGO_URI to MongoDB Atlas connection string
- Set all env vars in Render dashboard
- Frontend: Deploy to Vercel (next build)

---

## 14. Troubleshooting

| Problem                    | Cause                  | Fix                              |
|----------------------------|------------------------|----------------------------------|
| 500 on login               | MongoDB not running    | Start mongod.exe first           |
| ERR_CONNECTION_REFUSED :5000| Backend not started   | node index.js in BWF-Backend     |
| OverwriteModelError: Post   | Duplicate model name  | Use unique model names           |
| Pages not updating          | .next cache           | Delete .next/, restart dev       |
| Email not sending           | Placeholder .env vars | Set real Gmail App Password      |
| JWT expired                 | 15 min token life     | Frontend calls /api/refresh      |

---

## 15. Roadmap

| Feature                  | Priority | Phase |
|--------------------------|----------|-------|
| Push notifications       | High     | 2     |
| Mobile app (React Native)| High     | 2     |
| File/image uploads       | Medium   | 2     |
| Age-based content access | Medium   | 2     |
| PDF report export        | Medium   | 2     |
| WhatsApp SoS integration | Medium   | 3     |
| Parent/guardian portal   | Low      | 3     |
| ML wellbeing prediction  | Low      | 3     |

---
Document maintained by BWF Tech Team.
Update this file on every major feature release.
