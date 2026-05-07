"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import PageSkeleton from "../components/PageSkeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

interface Overview {
  totalStudents: number; activeStaff: number; pendingExpenses: number;
  pendingPosts: number; volunteerTurnoverRatio: number; certAlerts: number;
  expensesThisMonth: number; openSoS: number;
  homeDistribution: { home: string; count: number }[];
  monthlyTrend: { month: string; total: number }[];
  statusBreakdown: { name: string; value: number }[];
}

const PIE_COLORS: Record<string, string> = { active: "#10b981", inactive: "#f59e0b", graduated: "#6366f1" };
const HOME_COLOR = "#b38a63";

function KPI({ label, value, sub, warn }: { label: string; value: string | number; sub?: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm bg-white ${warn ? "border-amber-200" : "border-[#efe3d5]"}`}>
      <p className="text-xs uppercase tracking-wide text-[#8c6d4f] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${warn ? "text-amber-600" : "text-[#2f2a24]"}`}>{value}</p>
      {sub && <p className="text-xs text-[#a08060] mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#efe3d5] bg-white px-3 py-2 shadow text-xs">
      <p className="font-semibold text-[#2f2a24]">{label}</p>
      <p className="text-[#8c6d4f]">₹{payload[0].value.toLocaleString("en-IN")}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminAPI.getOverview()
      .then(d => setData(d as unknown as Overview))
      .catch(e => setError(e.message));
  }, []);

  if (!data && !error) return <PageSkeleton rows={4} />;

  const homeDist = data?.homeDistribution?.map(h => ({ name: h.home, students: h.count })) ?? [];
  const statusPie = data?.statusBreakdown?.length
    ? data.statusBreakdown
    : [{ name: "No data", value: 1 }];
  const trend = data?.monthlyTrend ?? [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[#2f2a24]">Admin Overview</h1>
        <p className="text-sm text-[#8c6d4f] mt-1">Live dashboard — students, staff, finance, and alerts.</p>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI label="Total Students"    value={data?.totalStudents ?? "—"} sub="Active enrollments" />
        <KPI label="Active Staff"      value={data?.activeStaff ?? "—"} sub="Across all homes" />
        <KPI label="Pending Expenses"  value={data?.pendingExpenses ?? "—"} sub="Awaiting approval" warn={(data?.pendingExpenses ?? 0) > 3} />
        <KPI label="🚨 Open SoS"       value={data?.openSoS ?? "—"} sub="Unresolved SoS alerts" warn={(data?.openSoS ?? 0) > 0} />
        <KPI label="Pending Posts"     value={data?.pendingPosts ?? "—"} sub="Awaiting moderation" warn={(data?.pendingPosts ?? 0) > 0} />
        <KPI label="Volunteer Turnover" value={data ? `${data.volunteerTurnoverRatio}%` : "—"} sub="Last 12 months" warn={(data?.volunteerTurnoverRatio ?? 0) > 20} />
        <KPI label="Cert Alerts"       value={data?.certAlerts ?? "—"} sub="Expiring within 30 days" warn={(data?.certAlerts ?? 0) > 0} />
        <KPI label="Expenses This Month" value={data ? `₹${data.expensesThisMonth.toLocaleString("en-IN")}` : "—"} sub="Approved + paid" />
      </section>

      {/* Charts Row 1 */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Home Distribution Bar Chart */}
        <div className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Students by Home</h3>
          {homeDist.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-[#8c6d4f]">No active students yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={homeDist} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5ece1" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8c6d4f" }} />
                <YAxis tick={{ fontSize: 12, fill: "#8c6d4f" }} allowDecimals={false} />
                <Tooltip content={<div />} formatter={(v: number) => [v, "Students"]} />
                <Bar dataKey="students" fill={HOME_COLOR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Student Status Pie Chart */}
        <div className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Student Status Breakdown</h3>
          {data?.statusBreakdown?.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-[#8c6d4f]">No students in DB yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {statusPie.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.name] ?? "#d6b896"} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Monthly Expense Trend */}
      <section className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Monthly Expense Trend (Last 6 Months)</h3>
        {trend.every(t => t.total === 0) ? (
          <div className="flex h-48 items-center justify-center text-sm text-[#8c6d4f]">No expense data yet — log expenses in Finance to see trends</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ece1" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8c6d4f" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8c6d4f" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" stroke="#b38a63" strokeWidth={2.5} dot={{ fill: "#b38a63", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Quick Actions */}
      <section className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Review Pending Expenses", href: "/admin/finance",    badge: data?.pendingExpenses },
            { label: "Moderate Posts",          href: "/admin/media",      badge: data?.pendingPosts },
            { label: "Check SoS Alerts",        href: "/admin/grievances", badge: data?.openSoS, urgent: true },
            { label: "View Audit Log",          href: "/admin/audit-logs" },
          ].map(a => (
            <a key={a.label} href={a.href}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm hover:bg-[#fdf7f1] transition ${a.urgent && (a.badge ?? 0) > 0 ? "border-red-200 bg-red-50" : "border-[#efe3d5]"}`}>
              <span className="font-medium text-[#2f2a24]">{a.label}</span>
              {a.badge !== undefined && a.badge > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.urgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                  {a.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
