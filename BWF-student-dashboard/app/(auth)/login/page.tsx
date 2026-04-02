"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      studentId,
      password,
      redirect: true,
      callbackUrl: "/dashboard",
    });

    if (result?.error) {
      setError("Invalid Student ID or Password");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="logo-section">
          <Image
            src="/icons/bwf2.png" // Path starting from the public folder
            alt="BWF Logo"
            width={300} // Desired width in pixels
            height={200} // Desired height in pixels
            quality={100}
            priority // Loads the logo immediately (good for LCP)
            className="auth-logo"
          />
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {/* Student ID Field */}
          <div className="form-group">
            <input
              id="studentId"
              className="lc-input"
              type="text"
              placeholder="Enter your ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <input
              id="password"
              className="lc-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="lc-btn-signin">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <Link href="/forgot-password">Forgot Password?</Link>
          <Link href="/signup">Sign Up</Link>
        </div>
      </div>
    </main>
  );
}
