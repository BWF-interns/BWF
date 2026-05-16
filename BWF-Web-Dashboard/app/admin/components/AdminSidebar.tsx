"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";

const NAV_ITEMS = [
  { href: "/admin/dashboard",    icon: "📊", label: "Dashboard" },
  { href: "/admin/students",     icon: "🎓", label: "Students" },
  { href: "/admin/staff",        icon: "👥", label: "Staff & Caseload" },
  { href: "/admin/finance",      icon: "💰", label: "Finance" },
  { href: "/admin/reports",      icon: "📄", label: "Reports" },
  { href: "/admin/home-records", icon: "🗂️",  label: "Home Records" },
  { href: "/admin/community",    icon: "🗣️",  label: "Community Feed" },
  { href: "/admin/activities",   icon: "🏆", label: "Activities" },
  { href: "/admin/complaints",   icon: "📋", label: "Complaints" },
  { href: "/admin/feed",         icon: "📱", label: "Social Feed" },
  { href: "/admin/calendar",     icon: "📅", label: "Calendar" },
  { href: "/admin/feedback",     icon: "💬", label: "Feedback" },
  { href: "/admin/grievances",   icon: "🆘", label: "Grievances" },
  { href: "/admin/audit-logs",   icon: "🔍", label: "Audit Logs" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sosCount, setSosCount] = useState(0);

  useEffect(() => {
    adminAPI.getGrievances({ type: 'sos', status: 'open' })
      .then((d) => setSosCount((d as unknown[]).length))
      .catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    router.push("/admin/login");
  };

  return (
    <aside className="w-full border-r border-[#efe3d5] bg-white/90 p-5 lg:w-64 flex flex-col">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4e9dd] text-sm font-bold text-[#6e5034]">BW</div>
          <div>
            <h2 className="text-base font-semibold text-[#2f2a24]">BWF Portal</h2>
            <p className="text-xs text-[#8c6d4f]">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="space-y-0.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const isSos = item.href === "/admin/grievances";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                pathname === item.href
                  ? "bg-[#f8efe5] text-[#6e5034] font-semibold"
                  : "text-[#6f6458] hover:bg-[#fcf6ef]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isSos && sosCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse">
                  {sosCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t border-[#efe3d5]">
        <button
          className="w-full rounded-lg bg-[#8c6d4f] px-3 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition"
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
