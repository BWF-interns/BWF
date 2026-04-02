"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "../../auth/login/service";

type LoginError = {
  message?: string;
};

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(adminId, password);
      if (data.role !== "admin") {
        throw new Error("Only admin accounts can access this dashboard");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userRole", data.role);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const typedError = err as LoginError;
      setError(typedError.message || "Login failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fdfaf6] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#efe3d5] bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image src="/bwf2.png" alt="BWF Logo" width={220} height={140} priority />
        </div>
        <h1 className="mb-1 text-center text-2xl font-semibold text-[#2f2a24]">Admin Sign In</h1>
        <p className="mb-6 text-center text-sm text-[#8c6d4f]">Warm, secure and professional access</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter admin ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-full rounded-md border border-[#dfd1c2] px-4 py-3 text-[#2f2a24] outline-none focus:border-[#8c6d4f]"
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-[#dfd1c2] px-4 py-3 text-[#2f2a24] outline-none focus:border-[#8c6d4f]"
            required
          />
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-[#8c6d4f] py-3 font-medium text-white transition hover:bg-[#795a3e]"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
