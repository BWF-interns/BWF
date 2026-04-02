"use client";
// app/student/context/NoticeContext.tsx
// ─────────────────────────────────────────────────────
// Single source of truth for unread notices.
// Wrap the student layout with <NoticeProvider>.
// Any component can call useNotices() to read / update.
// ─────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useCallback } from "react";

interface Notice {
  id: number;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  category: "event" | "academic" | "welfare" | "general";
}

interface NoticeContextValue {
  notices: Notice[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllRead: () => void;
  deleteNotice: (id: number) => void;
}

const INITIAL_NOTICES: Notice[] = [
  {
    id: 1,
    title: "Life Skills Workshop — Time Management",
    description: "A workshop on time management and productivity will be held in Room 101 on 22nd March. All students are encouraged to attend. Notebooks and pens will be provided.",
    date: "2026-03-18",
    isRead: false,
    category: "academic",
  },
  {
    id: 2,
    title: "Library Closed for Maintenance",
    description: "The library will be closed for maintenance on 20th March. Digital resources remain accessible through your student portal.",
    date: "2026-03-17",
    isRead: true,
    category: "general",
  },
  {
    id: 3,
    title: "Annual Sports Day — 25th March",
    description: "Annual Sports Day will be held on 25th March. Track events, team games, and fun activities for all. Wear comfortable clothes and bring water!",
    date: "2026-03-16",
    isRead: false,
    category: "event",
  },
  {
    id: 4,
    title: "Free Mental Wellness Session",
    description: "A trained counsellor will be available for private one-on-one sessions on 21st March. Attendance is voluntary and completely confidential. Sign up with Ms. Dana.",
    date: "2026-03-15",
    isRead: false,
    category: "welfare",
  },
  {
    id: 5,
    title: "Science Module — New Materials Available",
    description: "New study materials for the Plant Biology unit have been uploaded to your courses section. Please review before the next session on Friday.",
    date: "2026-03-14",
    isRead: true,
    category: "academic",
  },
];

const NoticeContext = createContext<NoticeContextValue | null>(null);

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);

  const unreadCount = notices.filter(n => !n.isRead).length;

  const markAsRead = useCallback((id: number) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotices(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const deleteNotice = useCallback((id: number) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NoticeContext.Provider value={{ notices, unreadCount, markAsRead, markAllRead, deleteNotice }}>
      {children}
    </NoticeContext.Provider>
  );
}

export function useNotices() {
  const ctx = useContext(NoticeContext);
  if (!ctx) throw new Error("useNotices must be used inside <NoticeProvider>");
  return ctx;
}