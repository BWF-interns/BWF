"use client";
// app/student/context/ProfileContext.tsx
// ─────────────────────────────────────────────────────
// Single source of truth for the student's avatar & name.
// Any page (Sidebar, Dashboard header, MyCourses header)
// reads avatarId from here so they all stay in sync.
// ─────────────────────────────────────────────────────
import React, { createContext, useContext, useState } from "react";

interface ProfileContextValue {
  avatarId: string;
  name: string;
  setAvatarId: (id: string) => void;
  setName: (name: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [avatarId, setAvatarId] = useState("cat");
  const [name, setName]         = useState("Aisha Sharma");

  return (
    <ProfileContext.Provider value={{ avatarId, name, setAvatarId, setName }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}