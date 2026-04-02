"use client";

import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  return (
    <main className="auth-page">
      <div className="auth-card animate-slide-up">
        <div className="logo-section">
          <Image
            src="/icons/bwf2.png"
            alt="BWF Logo"
            width={300}
            height={200}
            priority
          />
        </div>

        <div className="signup-hero">
          <div className="status-badge">Restricted Access</div>
          <h1 className="hero-title">Joining the Foundation?</h1>
          <p className="hero-subtitle">
            To ensure the security of our students, account creation is managed
            directly by our administration team.
          </p>
        </div>

        <div className="instruction-card">
          <h3>How to get started:</h3>
          <ul className="step-list">
            <li>
              Locate your assigned <strong>Hostel Warden</strong>.
            </li>
            <li>Provide your enrollment details and ID proof.</li>
            <li>
              Receive your <strong>Unique Student ID</strong> and temporary
              password.
            </li>
          </ul>
        </div>

        <Link
          href="/login"
          className="lc-btn-signin"
          style={{ textDecoration: "none", display: "block" }}
        >
          Return to Login
        </Link>
      </div>
    </main>
  );
}
