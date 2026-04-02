"use client";
// app/admin/staff/page.tsx
// Staff & caseload management — certifications, turnover, permissions, CRUD.

import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import PageSkeleton from "../components/PageSkeleton";

interface Cert { name: string; completedOn: string; expiresOn: string; status: string; }
interface Staff {
  _id: string; name: string; email: string; phone: string; role: string;
  house: string; type: string; caseload: number; status: string;
  certifications: Cert[]; joinedOn: string; notes: string;
  permissions: { viewStudents: boolean; editStudents: boolean; approveExpenses: boolean; manageMedia: boolean; viewReports: boolean; };
}

const ROLES = ["housemother", "dean", "counsellor", "warden", "volunteer", "admin_staff"];
const HOMES = ["Jammu", "Anantnag", "Kupwara", "Beerwah", "All"];
const DEFAULT_CERTS = ["Trauma-Sensitive Care", "Child Safeguarding", "First Aid", "Food Hygiene"];
const EMPTY: Partial<Staff> = { name: "", email: "", phone: "", role: "housemother", house: "Jammu", type: "full-time", caseload: 0, notes: "" };

export default function StaffPage() {
  const [staff, setStaff]       = useState<Staff[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterHouse, setFilterHouse]   = useState("");
  const [filterRole, setFilterRole]     = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [editing, setEditing]   = useState<Staff | null>(null);
  const [form, setForm]         = useState<Partial<Staff>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [msg, setMsg]           = useState("");

  const load = () => {
    const p: Record<string, string> = {};
    if (filterStatus) p.status = filterStatus;
    if (filterHouse)  p.house  = filterHouse;
    if (filterRole)   p.role   = filterRole;
    adminAPI.getStaff(p)
      .then(d => { setStaff(d as Staff[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };
  useEffect(() => { load(); }, [filterStatus, filterHouse, filterRole]);

  if (loading) return <PageSkeleton rows={6} />;

  // Turnover: count left in 12 months vs total
  const turnoverRatio = staff.length > 0
    ? ((staff.filter(s => s.status === "inactive").length / staff.length) * 100).toFixed(1) : "0.0";

  // Cert alerts
  const certAlertCount = staff.reduce((acc, s) =>
    acc + s.certifications.filter(c => ["expired", "expiring_soon", "not_done"].includes(c.status)).length, 0);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowAdd(true); };
  const openEdit = (s: Staff) => { setEditing(s); setForm(s); setShowAdd(true); };

  const save = async () => {
    setSaving(true); setError("");
    try {
      if (editing) { await adminAPI.updateStaff(editing._id, form); setMsg("Staff updated."); }
      else          { await adminAPI.addStaff(form); setMsg("Staff member added."); }
      setShowAdd(false); load();
    } catch (e: unknown) { setError((e as Error).message); }
    setSaving(false);
  };

  const deactivate = async (s: Staff) => {
    if (!confirm(`Deactivate ${s.name}?`)) return;
    try { await adminAPI.deactivateStaff(s._id); setMsg(`${s.name} deactivated.`); load(); }
    catch (e: unknown) { setError((e as Error).message); }
  };

  const certStatusFor = (s: Staff) => {
    if (!s.certifications.length) return "not_done";
    if (s.certifications.some(c => c.status === "expired")) return "expired";
    if (s.certifications.some(c => c.status === "expiring_soon")) return "expiring_soon";
    if (s.certifications.some(c => c.status === "not_done")) return "pending";
    return "valid";
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Staff & Caseload</h1>
          <p className="text-sm text-[#8c6d4f]">Manage staff permissions, certifications, and turnover tracking.</p>
        </div>
        <button onClick={openAdd}
          className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
          + Add Staff
        </button>
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#efe3d5] bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8c6d4f]">Total Staff</p>
          <p className="text-2xl font-bold text-[#2f2a24]">{staff.length}</p>
        </div>
        <div className="rounded-xl border border-[#efe3d5] bg-white p-4 shadow-sm">
          <p className="text-xs text-[#8c6d4f]">Active</p>
          <p className="text-2xl font-bold text-[#2f2a24]">{staff.filter(s => s.status === "active").length}</p>
        </div>
        <div className={`rounded-xl border bg-white p-4 shadow-sm ${parseFloat(turnoverRatio) > 20 ? "border-amber-200" : "border-[#efe3d5]"}`}>
          <p className="text-xs text-[#8c6d4f]">Turnover Ratio</p>
          <p className={`text-2xl font-bold ${parseFloat(turnoverRatio) > 20 ? "text-amber-600" : "text-[#2f2a24]"}`}>{turnoverRatio}%</p>
          <p className="text-xs text-[#a08060] mt-0.5">Target &lt; 20%</p>
        </div>
        <div className={`rounded-xl border bg-white p-4 shadow-sm ${certAlertCount > 0 ? "border-red-200" : "border-[#efe3d5]"}`}>
          <p className="text-xs text-[#8c6d4f]">Cert Alerts</p>
          <p className={`text-2xl font-bold ${certAlertCount > 0 ? "text-red-600" : "text-[#2f2a24]"}`}>{certAlertCount}</p>
          <p className="text-xs text-[#a08060] mt-0.5">Expired or missing</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { val: filterStatus, set: setFilterStatus, opts: ["active", "inactive", "on_leave"], placeholder: "All Status" },
          { val: filterHouse, set: setFilterHouse, opts: HOMES, placeholder: "All Homes" },
          { val: filterRole, set: setFilterRole, opts: ROLES, placeholder: "All Roles" },
        ].map((f, i) => (
          <select key={i} className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
            value={f.val} onChange={e => f.set(e.target.value)}>
            <option value="">{f.placeholder}</option>
            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#efe3d5] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f8efe5] text-left text-[#6e5034]">
            <tr>
              {["Name", "Role", "House", "Type", "Caseload", "Certifications", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#8c6d4f]">No staff found.</td></tr>
            ) : staff.map(s => (
              <tr key={s._id} className="border-t border-[#f2e9de] hover:bg-[#fdfaf6] transition">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 capitalize">{s.role.replace("_", " ")}</td>
                <td className="px-4 py-3">{s.house}</td>
                <td className="px-4 py-3 capitalize">{s.type}</td>
                <td className="px-4 py-3">{s.caseload}</td>
                <td className="px-4 py-3"><StatusBadge status={certStatusFor(s)} /></td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)}
                      className="rounded px-2 py-1 text-xs bg-[#f5ece1] text-[#6e5034] hover:bg-[#ede0d0] transition">Edit</button>
                    {s.status === "active" && (
                      <button onClick={() => deactivate(s)}
                        className="rounded px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 transition">Deactivate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showAdd && (
        <Modal title={editing ? `Edit — ${editing.name}` : "Add Staff Member"} onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            {[
              { label: "Full Name *", key: "name" }, { label: "Email", key: "email" }, { label: "Phone", key: "phone" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                <input value={(form as Record<string, string | number>)[f.key] as string || ""}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Role *", key: "role", opts: ROLES },
                { label: "House *", key: "house", opts: HOMES },
                { label: "Type", key: "type", opts: ["full-time", "part-time", "volunteer"] },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                  <select value={(form as Record<string, string>)[f.key] || ""}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]">
                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">Caseload</label>
                <input type="number" value={form.caseload || 0}
                  onChange={e => setForm({ ...form, caseload: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-2">Mandatory Certifications</label>
              <div className="space-y-1">
                {DEFAULT_CERTS.map(c => (
                  <div key={c} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" id={c}
                      checked={(form.certifications || []).some(x => x.name === c)}
                      onChange={e => {
                        const certs = form.certifications ? [...form.certifications] : [];
                        if (e.target.checked) certs.push({ name: c, completedOn: "", expiresOn: "", status: "not_done" });
                        else { const idx = certs.findIndex(x => x.name === c); if (idx >= 0) certs.splice(idx, 1); }
                        setForm({ ...form, certifications: certs });
                      }} />
                    <label htmlFor={c}>{c}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Notes</label>
              <textarea rows={2} value={form.notes || ""}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAdd(false)}
                className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1] transition">Cancel</button>
              <button onClick={save} disabled={saving}
                className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50 transition">
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Staff"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
