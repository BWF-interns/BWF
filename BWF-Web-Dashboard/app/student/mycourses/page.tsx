"use client";
// app/student/mycourses/page.tsx
import React, { useState, useEffect } from "react";
import "../styles/mycourses.css";
import {
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Sparkles,
  RotateCcw,
} from "lucide-react";

// Types
interface Assignment {
  id: number;
  title: string;
  subject: string;
  emoji: string;
  color: string;
  accentColor: string;
  status: "todo" | "waiting" | "verified";
  teacherNote?: string;
}

interface UndoPending {
  id: number;
  title: string;
  prevStatus: "todo" | "waiting" | "verified";
}

interface StatusMeta {
  label: string;
  ringColor: string;
  ringGlow: string;
}

interface User {
  firstName: string;
  avatarUrl: string;
}

const MOCK_USER: User = {
  firstName: "Aisha",
  avatarUrl:
    "https://ui-avatars.com/api/?name=Aisha&background=e0e7ff&color=4f46e5&rounded=true&bold=true",
};

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: "Read Chapter 4",
    subject: "English",
    emoji: "📖",
    color: "#fce7f3",
    accentColor: "#db2777",
    status: "todo",
  },
  {
    id: 2,
    title: "Fractions Worksheet",
    subject: "Math",
    emoji: "🔢",
    color: "#eff6ff",
    accentColor: "#3b82f6",
    status: "todo",
  },
  {
    id: 3,
    title: "Plant Cell Diagram",
    subject: "Science",
    emoji: "🌿",
    color: "#f0fdf4",
    accentColor: "#16a34a",
    status: "waiting",
    teacherNote: "Under Review",
  },
  {
    id: 4,
    title: "History Quiz Prep",
    subject: "History",
    emoji: "📜",
    color: "#fefce8",
    accentColor: "#ca8a04",
    status: "verified",
    teacherNote: "Great effort!",
  },
];

const STATUS_META: Record<Assignment["status"], StatusMeta> = {
  todo: { label: "To Do Right Now", ringColor: "#f87171", ringGlow: "#fee2e2" },
  waiting: {
    label: "Waiting for Teacher",
    ringColor: "#fbbf24",
    ringGlow: "#fef3c7",
  },
  verified: {
    label: "Verified & Finished",
    ringColor: "#34d399",
    ringGlow: "#d1fae5",
  },
};

// Kashmiri-flavoured cheer messages
const CHEER_MESSAGES = [
  "Shukriya! You're amazing! ✨",
  "Wah! Great job! Keep going! 💪",
  "Shabash! Look at you go! ⭐",
  "You're doing brilliant work! 🌟",
  "You're crushing it! Shabash! 🎉",
];

const UNDO_WINDOW_MS = 6000;

export default function MyCourses() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [celebrating, setCelebrating] = useState<number | null>(null);
  const [cheerMsg, setCheerMsg] = useState<string | null>(null);
  const [undoPending, setUndoPending] = useState<UndoPending | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(
    () => () => {
      if (undoTimer) clearTimeout(undoTimer);
    },
    [undoTimer],
  );

  const totalCount = assignments.length;
  const verifiedCount = assignments.filter(
    (a) => a.status === "verified",
  ).length;
  const progressPct = Math.round((verifiedCount / totalCount) * 100);
  const allDone = verifiedCount === totalCount;

  const handleDone = (id: number) => {
    if (undoTimer) clearTimeout(undoTimer);
    const assignment = assignments.find((a) => a.id === id);

    if (!assignment) return;

    const msg =
      CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "waiting", teacherNote: "Under Review" }
          : a,
      ),
    );
    setCelebrating(id);
    setCheerMsg(msg);
    setUndoPending({
      id,
      title: assignment.title,
      prevStatus: assignment.status,
    });

    const t = setTimeout(() => {
      setUndoPending(null);
      setUndoTimer(null);
    }, UNDO_WINDOW_MS);
    setUndoTimer(t);
    setTimeout(() => setCelebrating(null), 900);
    setTimeout(() => setCheerMsg(null), 3200);
  };

  const handleUndo = () => {
    if (!undoPending) return;
    if (undoTimer) clearTimeout(undoTimer);

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === undoPending.id
          ? { ...a, status: undoPending.prevStatus, teacherNote: undefined }
          : a,
      ),
    );
    setUndoPending(null);
    setUndoTimer(null);
  };

  const groups = (["todo", "waiting", "verified"] as const)
    .map((key) => ({
      key,
      meta: STATUS_META[key],
      items: assignments.filter((a) => a.status === key),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mc-page">
      {/* HEADER */}
      <header className="mc-header">
        <div className="mc-header-left">
          <p className="mc-eyebrow">My Courses</p>
          <h1 className="mc-title">Today's Work</h1>
        </div>
        <div className="mc-header-right">
          <div className="profile-pill">
            <img src={MOCK_USER.avatarUrl} alt={MOCK_USER.firstName} />
            <span>{MOCK_USER.firstName}</span>
          </div>
        </div>
      </header>

      {/* HERO PROGRESS CARD */}
      <section className={`mc-hero ${allDone ? "mc-hero--done" : ""}`}>
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-inner">
          <div className="hero-zap">
            {allDone ? (
              <span style={{ fontSize: "1.5rem" }}>🏆</span>
            ) : (
              <Zap size={22} fill="currentColor" />
            )}
          </div>
          <div className="hero-text">
            <h2>
              {allDone
                ? "You've finished everything!"
                : "Today's Device Session"}
            </h2>
            <p>
              {allDone
                ? "You're a star. Your teacher will review your work! 🌟"
                : `${verifiedCount} of ${totalCount} done — you've got this!`}
            </p>
          </div>
          <div className="hero-counter">
            <span className="hero-num">{verifiedCount}</span>
            <span className="hero-slash">/</span>
            <span className="hero-total">{totalCount}</span>
          </div>
        </div>
        <div className="hero-track">
          <div className="hero-fill" style={{ width: `${progressPct}%` }}>
            {progressPct >= 15 && (
              <span className="hero-pct">{progressPct}%</span>
            )}
          </div>
        </div>
        <div className="hero-stars">
          {assignments.map((a, i) => (
            <span
              key={a.id}
              className={`hstar ${a.status === "verified" ? "hstar--lit" : ""}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              ⭐
            </span>
          ))}
        </div>
      </section>

      {/* CHEER TOAST */}
      {cheerMsg && (
        <div className="cheer-toast" key={cheerMsg}>
          <Sparkles size={15} />
          {cheerMsg}
        </div>
      )}

      {/* UNDO BANNER — shown for UNDO_WINDOW_MS after submitting */}
      {undoPending && (
        <div className="undo-banner">
          <div className="undo-banner-left">
            <span className="undo-icon">✅</span>
            <div className="undo-text">
              <strong>"{undoPending.title}"</strong> submitted!
              <span className="undo-hint"> — Submitted by mistake?</span>
            </div>
          </div>
          <button className="undo-btn" onClick={handleUndo}>
            <RotateCcw size={13} />
            Undo
          </button>
          <div className="undo-timer-bar">
            <div
              className="undo-timer-fill"
              style={{ animationDuration: `${UNDO_WINDOW_MS}ms` }}
            />
          </div>
        </div>
      )}

      {/* ASSIGNMENT GROUPS */}
      <section className="mc-groups">
        {groups.map(({ key, meta, items }, gi) => (
          <div
            key={key}
            className="mc-group"
            style={{ "--gi": gi } as React.CSSProperties}
          >
            <div className="mc-group-header">
              <span
                className="mc-dot"
                style={{
                  background: meta.ringColor,
                  boxShadow: `0 0 0 4px ${meta.ringGlow}`,
                }}
              />
              <h3 className="mc-group-label">{meta.label}</h3>
              <span className="mc-count-pill">{items.length}</span>
            </div>
            <div className="mc-cards">
              {items.map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  celebrating={celebrating === a.id}
                  isUndoing={undoPending?.id === a.id}
                  onDone={() => handleDone(a.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Assignment;
  celebrating: boolean;
  isUndoing: boolean;
  onDone: () => void;
}

function AssignmentCard({
  assignment,
  celebrating,
  isUndoing,
  onDone,
}: AssignmentCardProps) {
  const { title, subject, emoji, color, accentColor, status, teacherNote } =
    assignment;

  return (
    <div
      className={[
        "ac",
        status === "waiting" ? "ac--waiting" : "",
        status === "verified" ? "ac--verified" : "",
        celebrating ? "ac--celebrate" : "",
        isUndoing ? "ac--undoing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--accent": accentColor,
          "--icon-bg": color,
        } as React.CSSProperties
      }
    >
      <div className="ac-strip" />
      <div className="ac-icon-wrap">
        <span className="ac-icon-emoji">{emoji}</span>
      </div>
      <div className="ac-content">
        <h4 className="ac-name">{title}</h4>
        <span className="ac-subject">{subject}</span>
      </div>
      <div className="ac-right">
        {status === "todo" && (
          <button className="btn-done" onClick={onDone}>
            <CheckCircle2 size={15} />
            I'm Done!
          </button>
        )}
        {status === "waiting" && (
          <div
            className={`badge bdg-waiting ${isUndoing ? "bdg-undoing" : ""}`}
          >
            <Clock size={12} />
            {isUndoing ? "Submitted…" : teacherNote}
          </div>
        )}
        {status === "verified" && (
          <div className="badge bdg-verified">
            <Star size={12} fill="currentColor" />
            Verified!
          </div>
        )}
      </div>
    </div>
  );
}
