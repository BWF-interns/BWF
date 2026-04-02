"use client";
// app/student/layout.tsx
import React from "react";
import "./styles/global.css";
import "./styles/sidebar.css";
import { NoticeProvider } from "./context/NoticeContext";
import { ProfileProvider } from "./context/ProfileContext";
import StudentSidebar from "./components/Sidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <NoticeProvider>
      <ProfileProvider>
        <div className="student-shell">
          <StudentSidebar />
          <div className="student-page-area">
            {children}
          </div>
        </div>
      </ProfileProvider>
    </NoticeProvider>
  );
}
