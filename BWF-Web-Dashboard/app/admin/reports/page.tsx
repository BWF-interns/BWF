"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import PageSkeleton from "../components/PageSkeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

interface ReportData {
  year: number; totalStudents: number; activeStaff: number; totalExpenses: number;
  byCategory: { name: string; value: number }[];
  byHome: { name: string; value: number }[];
  byMonth: { month: string; total: number }[];
  byStatus: { name: string; count: number }[];
  feedbackCount: number; grievanceCount: number;
}

const COLORS = ["#b38a63","#10b981","#6366f1","#f59e0b","#ef4444","#06b6d4","#ec4899","#8b5cf6"];
const HOMES  = ["Jammu","Anantnag","Kupwara","Beerwah"];
const YEARS  = [2024, 2025, 2026];

function exportCSV(data: ReportData) {
  const rows = [
    ["BWF Annual Report", data.year],
    ["Total Students", data.totalStudents],
    ["Active Staff", data.activeStaff],
    ["Total Expenses (₹)", data.totalExpenses],
    [""],
    ["Monthly Expenses"],
    ["Month", "Amount"],
    ...data.byMonth.map(m => [m.month, m.total]),
    [""],
    ["Expenses by Category"],
    ["Category", "Amount"],
    ...data.byCategory.map(c => [c.name, c.value]),
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `BWF_Report_${data.year}.csv`;
  a.click();
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [home, setHome] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    const p: Record<string, string> = { year: String(year) };
    if (home) p.home = home;
    adminAPI.getReportSummary(p)
      .then(d => { setData(d as unknown as ReportData); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [year, home]);

  if (loading) return <PageSkeleton rows={4} />;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Reports</h1>
          <p className="text-sm text-[#8c6d4f]">Yearly and custom expense & operations reports.</p>
        </div>
        <div className="flex gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={home} onChange={e => setHome(e.target.value)}
            className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
            <option value="">All Homes</option>
            {HOMES.map(h => <option key={h}>{h}</option>)}
          </select>
          {data && (
            <button onClick={() => exportCSV(data)}
              className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
              ⬇ Export CSV
            </button>
          )}
        </div>
      </header>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Students",   value: data.totalStudents },
              { label: "Active Staff",     value: data.activeStaff },
              { label: "Total Expenses",   value: `₹${data.totalExpenses.toLocaleString("en-IN")}` },
              { label: "Feedback Received",value: data.feedbackCount },
            ].map(k => (
              <div key={k.label} className="rounded-xl border border-[#efe3d5] bg-white p-5 shadow-sm">
                <p className="text-xs text-[#8c6d4f] uppercase tracking-wide mb-1">{k.label}</p>
                <p className="text-2xl font-bold text-[#2f2a24]">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Monthly Trend */}
          <div className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Monthly Expenses — {year}</h3>
            {data.byMonth.every(m => m.total === 0) ? (
              <p className="text-center text-sm text-[#8c6d4f] py-8">No expense data for {year}</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5ece1" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8c6d4f" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#8c6d4f" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]} />
                  <Bar dataKey="total" fill="#b38a63" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* By Category + By Home */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Expenses by Category</h3>
              {data.byCategory.length === 0 ? (
                <p className="text-center text-sm text-[#8c6d4f] py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                      {data.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-xl border border-[#efe3d5] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-[#2f2a24]">Expenses by Home</h3>
              {data.byHome.length === 0 ? (
                <p className="text-center text-sm text-[#8c6d4f] py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.byHome} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5ece1" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#8c6d4f" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#8c6d4f" }} width={70} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0,6,6,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
