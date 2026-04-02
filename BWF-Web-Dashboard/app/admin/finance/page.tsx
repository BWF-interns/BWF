"use client";
// app/admin/finance/page.tsx
// Finance hub: expense approval, budget variance, fundraising ROI, impact per dollar.

import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

interface Expense {
  _id: string; title: string; category: string; amount: number;
  date: string; home: string; status: string; notes: string;
  submittedBy: string; rejectionReason: string;
}
interface KPI {
  month: number; home: string; budget: number; actualExpenses: number;
  donations: number; fundraisingCost: number; beneficiariesServed: number;
  variance: number; fundraisingROI: number | null; impactPerDollar: number | null;
}

const HOMES       = ["Jammu", "Anantnag", "Kupwara", "Beerwah"];
const CATEGORIES  = ["Food", "Education", "Medical", "Cosmetics", "Utilities", "Maintenance", "Events", "Other"];
const MONTHS      = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EMPTY_EXP   = { title: "", category: "Food", amount: 0, date: "", home: "Jammu", notes: "" };

export default function FinancePage() {
  const [tab, setTab]               = useState<"expenses" | "kpis" | "homes">("expenses");
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [kpis, setKPIs]             = useState<KPI[]>([]);
  const [filterHome, setFilterHome] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [form, setForm]             = useState<Record<string, string | number>>(EMPTY_EXP);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [msg, setMsg]               = useState("");

  const loadExpenses = () => {
    const p: Record<string, string> = {};
    if (filterHome)   p.home     = filterHome;
    if (filterStatus) p.status   = filterStatus;
    if (filterCat)    p.category = filterCat;
    adminAPI.getExpenses(p).then(d => setExpenses(d as Expense[])).catch(e => setError(e.message));
  };

  const loadKPIs = () => {
    adminAPI.getKPIs(2025).then(d => setKPIs(d as KPI[])).catch(e => setError(e.message));
  };

  useEffect(() => { if (tab === "expenses" || tab === "homes") loadExpenses(); }, [tab, filterHome, filterStatus, filterCat]);
  useEffect(() => { if (tab === "kpis" || tab === "homes") loadKPIs(); }, [tab]);

  const addExpense = async () => {
    setSaving(true); setError("");
    try {
      await adminAPI.addExpense({ ...form, date: new Date(form.date as string) });
      setMsg("Expense added."); setShowAdd(false); loadExpenses();
    } catch (e: unknown) { setError((e as Error).message); }
    setSaving(false);
  };

  const setStatus = async (id: string, status: string, reason?: string) => {
    try {
      await adminAPI.updateExpense(id, { status, ...(reason ? { rejectionReason: reason } : {}) });
      setMsg(`Expense ${status}.`); loadExpenses();
    } catch (e: unknown) { setError((e as Error).message); }
  };

  const deleteExp = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await adminAPI.deleteExpense(id); setMsg("Expense deleted."); loadExpenses(); }
    catch (e: unknown) { setError((e as Error).message); }
  };

  const totalApproved = expenses.filter(e => ["approved","paid"].includes(e.status)).reduce((a,e) => a+e.amount,0);
  const totalPending  = expenses.filter(e => e.status === "pending").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#2f2a24]">Financial Health</h1>
        <p className="text-sm text-[#8c6d4f]">Expenses, budget variance, fundraising ROI, and impact per donor rupee.</p>
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#efe3d5] bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8c6d4f]">Total Logged</p>
          <p className="text-2xl font-bold">{expenses.length}</p>
        </div>
        <div className="rounded-xl border border-[#efe3d5] bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8c6d4f]">Approved Value</p>
          <p className="text-2xl font-bold">₹{totalApproved.toLocaleString("en-IN")}</p>
        </div>
        <div className={`rounded-xl border bg-white p-4 shadow-sm ${totalPending > 0 ? "border-amber-200" : "border-[#efe3d5]"}`}>
          <p className="text-xs text-[#8c6d4f]">Pending Approval</p>
          <p className={`text-2xl font-bold ${totalPending > 0 ? "text-amber-600" : ""}`}>{totalPending}</p>
        </div>
        <div className="rounded-xl border border-[#efe3d5] bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8c6d4f]">Paid</p>
          <p className="text-2xl font-bold">{expenses.filter(e => e.status === "paid").length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#efe3d5]">
        {(["expenses", "kpis", "homes"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${
              tab === t ? "border-[#8c6d4f] text-[#6e5034]" : "border-transparent text-[#a08060] hover:text-[#6e5034]"
            }`}>
            {t === "kpis" ? "KPI Dashboard" : t === "homes" ? "Home Summary" : "Expenses"}
          </button>
        ))}
      </div>

      {/* Tab: Expenses */}
      {tab === "expenses" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
              value={filterHome} onChange={e => setFilterHome(e.target.value)}>
              <option value="">All Homes</option>
              {HOMES.map(h => <option key={h}>{h}</option>)}
            </select>
            <select className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              {["pending","approved","rejected","paid"].map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
              value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => setShowAdd(true)}
              className="ml-auto rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
              + Add Expense
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#efe3d5] bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#f8efe5] text-left text-[#6e5034]">
                <tr>{["Title","Category","Amount","Date","Home","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-[#8c6d4f]">No expenses found.</td></tr>
                ) : expenses.map(e => (
                  <tr key={e._id} className="border-t border-[#f2e9de] hover:bg-[#fdfaf6] transition">
                    <td className="px-4 py-3 font-medium">{e.title}</td>
                    <td className="px-4 py-3">{e.category}</td>
                    <td className="px-4 py-3">₹{e.amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-[#8c6d4f]">{e.date?.slice(0,10)}</td>
                    <td className="px-4 py-3">{e.home}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {e.status === "pending" && (
                          <>
                            <button onClick={() => setStatus(e._id, "approved")}
                              className="rounded px-2 py-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">Approve</button>
                            <button onClick={() => { const r = prompt("Rejection reason:"); if (r !== null) setStatus(e._id, "rejected", r); }}
                              className="rounded px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 transition">Reject</button>
                          </>
                        )}
                        {e.status === "approved" && (
                          <button onClick={() => setStatus(e._id, "paid")}
                            className="rounded px-2 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition">Mark Paid</button>
                        )}
                        <button onClick={() => deleteExp(e._id, e.title)}
                          className="rounded px-2 py-1 text-xs bg-gray-100 text-gray-500 hover:bg-gray-200 transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: KPI Dashboard */}
      {tab === "kpis" && (
        <div className="space-y-4">
          {kpis.length === 0 ? (
            <div className="rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f] shadow-sm">
              No KPI data for 2025. Add monthly records via the API or seed script.
            </div>
          ) : (
            <div className="grid gap-4">
              {kpis.map(k => (
                <div key={`${k.home}-${k.month}`} className="rounded-xl border border-[#efe3d5] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#2f2a24]">{k.home} — {MONTHS[k.month - 1]} 2025</h3>
                    <StatusBadge status={k.variance > 0 ? "rejected" : "valid"} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                    <div>
                      <p className="text-xs text-[#8c6d4f]">Budget</p>
                      <p className="font-semibold">₹{k.budget.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8c6d4f]">Actual</p>
                      <p className="font-semibold">₹{k.actualExpenses.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8c6d4f]">Variance</p>
                      <p className={`font-semibold ${k.variance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {k.variance > 0 ? "+" : ""}₹{Math.abs(k.variance).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8c6d4f]">Fundraising ROI</p>
                      <p className="font-semibold">{k.fundraisingROI !== null ? `${k.fundraisingROI}%` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8c6d4f]">Donations</p>
                      <p className="font-semibold">₹{k.donations.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8c6d4f]">Impact per ₹</p>
                      <p className="font-semibold">{k.impactPerDollar !== null ? `${k.impactPerDollar} students/₹` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8c6d4f]">Beneficiaries</p>
                      <p className="font-semibold">{k.beneficiariesServed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Home Summary (from real Excel data) */}
      {tab === "homes" && (
        <div className="space-y-4">
          {[
            { name: "Jammu",     total: 2482566, months: [290054,198204,256501,160210,132580,135580,180401,195572,150839,156555,160020,466050] },
            { name: "Anantnag",  total: 2996608, months: [99370,94683,1333793,136335,147708,135314,177714,174214,175907,200759,189580,131231] },
            { name: "Kupwara",   total: 1531264, months: [61000,61000,160822,155240,147174,116647,136115,145784,92882,154681,153868,146051] },
          ].map(home => {
            const max = Math.max(...home.months);
            return (
              <div key={home.name} className="rounded-xl border border-[#efe3d5] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#2f2a24]">{home.name} Home — 2025</h3>
                  <span className="text-sm font-medium text-[#8c6d4f]">Total: ₹{home.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="space-y-2">
                  {MONTHS.map((m, i) => (
                    <div key={m} className="flex items-center gap-3 text-xs">
                      <span className="w-8 text-[#8c6d4f]">{m}</span>
                      <div className="flex-1 h-4 rounded-full bg-[#f5ece1]">
                        <div className="h-4 rounded-full bg-[#b38a63]"
                          style={{ width: `${Math.min((home.months[i] / max) * 100, 100)}%` }} />
                      </div>
                      <span className="w-20 text-right font-medium">₹{home.months[i].toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAdd && (
        <Modal title="Log New Expense" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            {[
              { label: "Title *", key: "title", type: "text" },
              { label: "Amount (₹) *", key: "amount", type: "number" },
              { label: "Date *", key: "date", type: "date" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key] as string | number}
                  onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Category *", key: "category", opts: CATEGORIES },
                { label: "Home *",     key: "home",     opts: HOMES },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                  <select value={form[f.key] as string}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]">
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Notes</label>
              <textarea rows={2} value={form.notes as string}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAdd(false)}
                className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1] transition">Cancel</button>
              <button onClick={addExpense} disabled={saving}
                className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50 transition">
                {saving ? "Saving..." : "Log Expense"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
