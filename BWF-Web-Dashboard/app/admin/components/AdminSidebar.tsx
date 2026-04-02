"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard",   icon: "DB", label: "Dashboard" },
  { href: "/admin/students",    icon: "ST", label: "Students" },
  { href: "/admin/staff",       icon: "SF", label: "Staff & Caseload" },
  { href: "/admin/finance",     icon: "FN", label: "Finance" },
  { href: "/admin/media",       icon: "MD", label: "Media" },
  { href: "/admin/audit-logs",  icon: "AL", label: "Audit Logs" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    router.push("/admin/login");
  };

  return (
    <aside className="w-full border-r border-[#efe3d5] bg-white/90 p-5 lg:w-72">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4e9dd] text-sm font-semibold">BW</div>
          <div>
            <h2 className="text-base font-semibold text-[#2f2a24]">BWF Portal</h2>
            <p className="text-xs text-[#8c6d4f]">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              pathname === item.href
                ? "bg-[#f8efe5] text-[#6e5034] font-medium"
                : "text-[#6f6458] hover:bg-[#fcf6ef]"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <button
          className="w-full rounded-lg bg-[#8c6d4f] px-3 py-2 text-sm font-medium text-white hover:bg-[#795a3e]"
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
