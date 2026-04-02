import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      // 1. Define the fields the user sees on the login form
      credentials: {
        studentId: { label: "Student ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // 2. The 'authorize' function is the gatekeeper
      async authorize(credentials) {
        if (!credentials?.studentId || !credentials?.password) return null;

        // 3. MOCK DATABASE (We will replace this with MongoDB later)
        const mockUser = {
          id: "BWF-2026-001",
          name: "Somesh",
          password: "password123",
          avatarSeed: "Somesh",
        };

        // 4. Verification Logic
        if (
          credentials.studentId === mockUser.id &&
          credentials.password === mockUser.password
        ) {
          // 5. If correct, return the User object
          return {
            id: mockUser.id,
            name: mockUser.name,
            // Gamified Avatar: We use a seed so the same user always gets the same avatar
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.avatarSeed}`,
          };
        }

        // 6. If incorrect, returning null denies access
        return null;
      },
    }),
  ],
  // 7. Tell Auth.js where your custom login page is
  pages: {
    signIn: "/login",
  },
});
