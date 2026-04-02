"use client";
// app/student/dashboard/page.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../styles/dashboard.css";
import { Bell } from "lucide-react";
import { useNotices }  from "../context/NoticeContext";
import { useProfile }  from "../context/ProfileContext";
import { getAvatar }   from "../constants/avatars";
import { STUDENT_DASHBOARD_DATA } from "../../shared/mockData";

export default function Dashboard() {
  const router = useRouter();

  /* ── shared context ── */
  const { unreadCount, markAllRead } = useNotices();
  const { avatarId, name }           = useProfile();
  const av                           = getAvatar(avatarId);
  const hasUnread                    = unreadCount > 0;

  /* ── local state ── */
  const [greeting, setGreeting] = useState("Welcome");
  const [reacted, setReacted]   = useState(false);

  /* derive first name only */
  const firstName = name.split(" ")[0];

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else             setGreeting("Good evening");
  }, []);

  return (
    <main className="main-content">

      {/* ── HEADER ── */}
      <header className="top-header">
        <h1>{greeting}, {firstName} 👋</h1>

        <div className="header-actions">
          {/* Bell — reads from NoticeContext, turns orange when unread */}
          <button
            className={`dash-bell-btn${hasUnread ? " dash-bell-btn--alert" : ""}`}
            onClick={() => router.push("/student/noticeboard")}
            aria-label={hasUnread ? `${unreadCount} unread notices` : "No new notices"}
            title={hasUnread ? "You have new notices!" : "All caught up!"}
          >
            <Bell size={19} />
            {hasUnread && (
              <span className="dash-bell-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Avatar — reads from ProfileContext, click → profile */}
          <button
            className="dash-avatar-btn"
            style={{ background: av.bg }}
            onClick={() => router.push("/student/profile")}
            aria-label="My Profile"
            title="Go to my profile"
          >
            <span>{av.emoji}</span>
          </button>
        </div>
      </header>

      {/* ── WELCOME ── */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back!</h2>
          <p>Borderless World Foundation (BWF) created a safe space for you.</p>
        </div>
        <div className="mood-tracker">
          <button className="mood-btn"><span className="emoji">😊</span><span className="label">Happy</span></button>
          <button className="mood-btn"><span className="emoji">😐</span><span className="label">Okay</span></button>
          <button className="mood-btn help-btn"><span className="emoji">😨</span><span className="label">Need Help</span></button>
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="dashboard-grid">

        <div className="card schedule-card">
          <h3>Today's Schedule</h3>
          <div className="schedule-list">
            {STUDENT_DASHBOARD_DATA.schedule.map(s => (
              <div key={s.id} className="schedule-item">
                <div className="time">{s.time}</div>
                <div className="details">
                  <h4>{s.title}</h4>
                  <button className="btn-primary">{s.actionText}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card assignments-card">
          <h3>Recent Assignments</h3>
          <div className="assignment-list">
            {STUDENT_DASHBOARD_DATA.assignments.map(a => (
              <div key={a.id} className="assignment-item">
                <div className="assignment-header">
                  <span className={`status-dot dot-${a.status}`} />
                  <h4>{a.title}</h4>
                </div>
                <span className="due-date">{a.due}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card resources-card">
          <h3>Quick Resources</h3>
          <div className="resource-buttons">
            <button className="resource-btn bg-library">📚 Library</button>
            <button className="resource-btn bg-syllabus">📄 Download Syllabus</button>
            <button className="resource-btn bg-mentor">💬 Contact Mentor</button>
          </div>
        </div>

      </section>

      {/* ── BOTTOM ── */}
      <section className="connection-section mt-8">

        <div className="card mentor-note-card">
          <div className="card-header">
            <div className="mentor-info">
              <div className="mentor-avatar">
                <img src={STUDENT_DASHBOARD_DATA.mentor.avatarUrl} alt="Mentor" />
              </div>
              <div>
                <h3>Note from {STUDENT_DASHBOARD_DATA.mentor.name}</h3>
                <span className="mentor-role-label">{STUDENT_DASHBOARD_DATA.mentor.role}</span>
              </div>
            </div>
            <span className="date-badge">{STUDENT_DASHBOARD_DATA.mentor.dateLabel}</span>
          </div>
          <div className="mentor-message">
            <p>"{STUDENT_DASHBOARD_DATA.mentor.message}"</p>
          </div>
          <div className="mentor-actions">
            <button
              className={`btn-react${reacted ? " btn-react--active" : ""}`}
              onClick={() => setReacted(r => !r)}
            >
              {reacted ? "❤️" : "🤍"}
            </button>
            <button className="btn-reply">Say thanks</button>
          </div>
        </div>

        <div className="card mindful-card">
          <div className="mindful-header">
            <span className="mindful-emoji">🌱</span>
            <h3>Daily Inspiration</h3>
          </div>
          <div className="mindful-body">
            <p>"{STUDENT_DASHBOARD_DATA.inspiration.quote}"</p>
          </div>
          <div className="mindful-footer">
            <span className="mindful-emoji">🌬️</span>
            <p>{STUDENT_DASHBOARD_DATA.inspiration.footer}</p>
          </div>
        </div>

      </section>
    </main>
  );
}