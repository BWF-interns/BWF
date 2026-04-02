"use client";
// app/admin/students/page.tsx
// Full student management — view, search, filter, add, edit, deactivate.

import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import PageSkeleton from "../components/PageSkeleton";

interface Student {
  _id: string; studentId: string; name: string; home: string;
  className: string; background: string; status: string; xp: number;
  dueDiligenceNotes: string; notes: string;
}

const HOMES = ["Jammu", "Anantnag", "Kupwara", "Beerwah"];
const EMPTY_FORM = { name: "", home: "Jammu", className: "", background: "", dueDiligenceNotes: "", notes: "" };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterHome, setFilterHome] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showAdd, setShowAdd]   = useState(false);
  const [editing, setEditing]   = useState<Student | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [msg, setMsg]           = useState("");

  const load = () => {
    const p: Record<string, string> = {};
    if (filterHome)   p.home   = filterHome;
    if (filterStatus) p.status = filterStatus;
    if (search)       p.search = search;
    adminAPI.getStudents(p)
      .then(d => { setStudents(d as Student[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [search, filterHome, filterStatus]);

  if (loading) return <PageSkeleton rows={8} />;

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowAdd(true); };
  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ name: s.name, home: s.home, className: s.className, background: s.background, dueDiligenceNotes: s.dueDiligenceNotes, notes: s.notes });
    setShowAdd(true);
  };

  const save = async () => {
    setSaving(true); setError("");
    try {
      if (editing) { await adminAPI.updateStudent(editing._id, form); setMsg("Student updated."); }
      else          { await adminAPI.addStudent(form); setMsg("Student added."); }
      setShowAdd(false); load();
    } catch (e: unknown) { setError((e as Error).message); }
    setSaving(false);
  };

  const deactivate = async (s: Student) => {
    if (!confirm(`Deactivate ${s.name}?`)) return;
    try { await adminAPI.deactivateStudent(s._id); setMsg(`${s.name} deactivated.`); load(); }
    catch (e: unknown) { setError((e as Error).message); }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Student Census</h1>
          <p className="text-sm text-[#8c6d4f]">Full student registry with welfare and academic tracking.</p>
        </div>
        <button onClick={openAdd}
          className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
          + Add Student
        </button>
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f] w-56"
          placeholder="Search name or ID..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
          value={filterHome} onChange={e => setFilterHome(e.target.value)}>
          <option value="">All Homes</option>
          {HOMES.map(h => <option key={h}>{h}</option>)}
        </select>
        <select className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: students.length },
          { label: "Active",   value: students.filter(s => s.status === "active").length },
          { label: "Inactive", value: students.filter(s => s.status === "inactive").length },
          { label: "Homes",    value: [...new Set(students.map(s => s.home))].length },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-[#efe3d5] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#8c6d4f]">{k.label}</p>
            <p className="text-2xl font-bold text-[#2f2a24]">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#efe3d5] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#f8efe5] text-left text-[#6e5034]">
            <tr>
              {["Name", "ID", "Home", "Class", "Background", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#8c6d4f]">No students found.</td></tr>
            ) : students.map(s => (
              <tr key={s._id} className="border-t border-[#f2e9de] hover:bg-[#fdfaf6] transition">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-[#8c6d4f]">{s.studentId}</td>
                <td className="px-4 py-3">{s.home}</td>
                <td className="px-4 py-3">{s.className || "—"}</td>
                <td className="px-4 py-3">{s.background || "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)}
                      className="rounded px-2 py-1 text-xs bg-[#f5ece1] text-[#6e5034] hover:bg-[#ede0d0] transition">
                      Edit
                    </button>
                    {s.status === "active" && (
                      <button onClick={() => deactivate(s)}
                        className="rounded px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 transition">
                        Deactivate
                      </button>
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
        <Modal title={editing ? `Edit — ${editing.name}` : "Add New Student"} onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            {[
              { label: "Full Name *", key: "name", type: "text" },
              { label: "Class", key: "className", type: "text" },
              { label: "Background", key: "background", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                <input type={f.type}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Home *</label>
              <select value={form.home} onChange={e => setForm({ ...form, home: e.target.value })}
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]">
                {HOMES.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Due Diligence Notes</label>
              <textarea rows={3} value={form.dueDiligenceNotes}
                onChange={e => setForm({ ...form, dueDiligenceNotes: e.target.value })}
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none focus:border-[#8c6d4f]"
                placeholder="Intake verification, background check, referral source..." />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAdd(false)}
                className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1] transition">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50 transition">
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Student"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
