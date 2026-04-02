"use client";
// app/admin/dashboard/page.tsx
// Live admin overview — pulls real data from /api/admin/overview

import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import StatusBadge from "../components/StatusBadge";
import PageSkeleton from "../components/PageSkeleton";

interface Overview {
  totalStudents: number;
  activeStaff: number;
  pendingExpenses: number;
  pendingPosts: number;
  volunteerTurnoverRatio: number;
  certAlerts: number;
  expensesThisMonth: number;
  homeDistribution: { home: string; count: number }[];
}

function KPICard({ label, value, sub, warn }: { label: string; value: string | number; sub?: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm bg-white ${warn ? "border-amber-200" : "border-[#efe3d5]"}`}>
      <p className="text-xs uppercase tracking-wide text-[#8c6d4f] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${warn ? "text-amber-600" : "text-[#2f2a24]"}`}>{value}</p>
      {sub && <p className="text-xs text-[#a08060] mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminAPI.getOverview()
      .then(d => setData(d as unknown as Overview))
      .catch(e => setError(e.message));
  }, []);

  if (!data && !error) return <PageSkeleton rows={4} />;

  const maxHome = data ? Math.max(...data.homeDistribution.map(h => h.count), 1) : 1;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[#2f2a24]">Admin Overview</h1>
        <p className="text-sm text-[#8c6d4f] mt-1">
          Live dashboard — students, staff operations, finance, and moderation.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error} — showing last cached data if available.
        </div>
      )}

      {/* KPI Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total Students" value={data?.totalStudents ?? "—"} sub="Active enrollments" />
        <KPICard label="Active Staff" value={data?.activeStaff ?? "—"} sub="Across all homes" />
        <KPICard label="Pending Expenses" value={data?.pendingExpenses ?? "—"} sub="Awaiting approval" warn={(data?.pendingExpenses ?? 0) > 3} />
        <KPICard label="Pending Posts" value={data?.pendingPosts ?? "—"} sub="Awaiting moderation" warn={(data?.pendingPosts ?? 0) > 0} />
        <KPICard
          label="Volunteer Turnover"
          value={data ? `${data.volunteerTurnoverRatio}%` : "—"}
          sub="Last 12 months"
          warn={(data?.volunteerTurnoverRatio ?? 0) > 20}
        />
        <KPICard
          label="Cert Alerts"
          value={data?.certAlerts ?? "—"}
          sub="Expiring within 30 days"
          warn={(data?.certAlerts ?? 0) > 0}
        />
        <KPICard
          label="Expenses This Month"
          value={data ? `₹${data.expensesThisMonth.toLocaleString("en-IN")}` : "—"}
          sub="Approved + paid"
        />
      </section>

      {/* Home Distribution */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Home Group Distribution</h3>
          {data?.homeDistribution.length ? (
            <div className="space-y-4">
              {data.homeDistribution
                .sort((a, b) => b.count - a.count)
                .map(h => (
                  <div key={h.home}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{h.home} Home</span>
                      <span className="text-[#8c6d4f]">{h.count} students</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#f5ece1]">
                      <div
                        className="h-2 rounded-full bg-[#b38a63] transition-all"
                        style={{ width: `${(h.count / maxHome) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-[#8c6d4f]">{data ? "No active students found." : "Loading..."}</p>
          )}
        </div>

        {/* Quick Action Panel */}
        <div className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Quick Actions</h3>
          <div className="grid gap-3">
            {[
              { label: "Review Pending Expenses", href: "/admin/finance", badge: data?.pendingExpenses },
              { label: "Moderate Posts", href: "/admin/media", badge: data?.pendingPosts },
              { label: "Check Cert Alerts", href: "/admin/staff", badge: data?.certAlerts },
              { label: "View Audit Log", href: "/admin/audit-logs" },
            ].map(a => (
              <a
                key={a.label}
                href={a.href}
                className="flex items-center justify-between rounded-lg border border-[#efe3d5] px-4 py-3 text-sm hover:bg-[#fdf7f1] transition"
              >
                <span className="font-medium text-[#2f2a24]">{a.label}</span>
                {a.badge !== undefined && a.badge > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    {a.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
