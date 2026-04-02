# BWF Student Portal 🎓
**Borderless World Foundation - Educational Resource Gateway**

A high-performance, secure authentication portal and dashboard designed for BWF students. Built with a focus on professional UX/UI (LeetCode-inspired) and robust server-side security.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Auth:** NextAuth.js / Auth.js (Credentials & Social)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Styling:** CSS Modules / Global CSS (Micro-interactions)

---

## 📂 Project Structure (SDE3 Architecture)

```text
student/
├── app/                  # Routing & Server Components
│   ├── (auth)/           # Authentication Group (Login, Signup, Forgot Password)
│   ├── dashboard/        # Protected Student Dashboard
│   └── api/              # Backend Route Handlers (Auth, Reset Logic)
├── components/           # Reusable UI Library (Independent of Routes)
│   └── ui/               # Atomic components (Buttons, Inputs, Cards)
├── lib/                  # Shared Server Logic & DB Configs
│   ├── mongodb.ts        # Database Connection Singleton
│   └── auth.ts           # NextAuth Configuration
├── public/               # Static Assets (Logos, Icons)
└── docs/                 # Documentation & UI Screenshots
