"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "./components/AuthGuard";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname?.startsWith("/admin/login");

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fdfaf6] text-[#2f2a24]">
        <header className="border-b border-[#efe3d5] bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#8c6d4f]">BWF</p>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/dashboard" className="hover:text-[#8c6d4f]">
                Dashboard
              </Link>
              <Link href="/admin/profile" className="hover:text-[#8c6d4f]">
                Profile
              </Link>
              <button onClick={logout} className="rounded-md bg-[#8c6d4f] px-3 py-1.5 text-white hover:bg-[#795a3e]">
                Logout
              </button>
            </nav>
          </div>
        </header>
        <div className="mx-auto flex max-w-[1300px]">
          <AdminSidebar />
          <main className="min-h-[calc(100vh-73px)] flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
