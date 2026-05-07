"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import PageSkeleton from "../components/PageSkeleton";

interface Grievance {
  _id: string; submittedBy: string; role: string; home: string;
  type: "sos" | "help"; subject: string; message: string;
  priority: string; status: string; emailSent: boolean;
  resolvedBy?: string; resolvedNote?: string; resolvedAt?: string;
  createdAt: string;
}

const PRIORITY_STYLE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-amber-100 text-amber-700 border-amber-200",
  low:      "bg-gray-100 text-gray-600 border-gray-200",
};
const STATUS_STYLE: Record<string, string> = {
  open:        "bg-red-50 text-red-600",
  in_progress: "bg-blue-50 text-blue-600",
  resolved:    "bg-emerald-50 text-emerald-700",
  closed:      "bg-gray-100 text-gray-500",
};

export default function GrievancesPage() {
  const [items, setItems]           = useState<Grievance[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("open");
  const [selected, setSelected]     = useState<Grievance | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [form, setForm]             = useState({ submittedBy:"", role:"student", home:"Jammu", type:"help", subject:"", message:"", priority:"medium" });
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState("");
  const [error, setError]           = useState("");

  const load = () => {
    setLoading(true);
    const p: Record<string, string> = {};
    if (filterType)   p.type   = filterType;
    if (filterStatus) p.status = filterStatus;
    adminAPI.getGrievances(p)
      .then(d => { setItems(d as Grievance[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [filterType, filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminAPI.updateGrievance(id, { status, resolvedNote: resolveNote });
      setMsg(`Grievance marked ${status}.`); setSelected(null); setResolveNote(""); load();
    } catch (e: unknown) { setError((e as Error).message); }
  };

  const submit = async () => {
    if (!form.subject || !form.message) return;
    setSaving(true);
    try {
      await adminAPI.addGrievance(form);
      setMsg("Grievance submitted. Email alert sent to admin."); setShowAdd(false);
      setForm({ submittedBy:"", role:"student", home:"Jammu", type:"help", subject:"", message:"", priority:"medium" });
      load();
    } catch (e: unknown) { setError((e as Error).message); }
    setSaving(false);
  };

  const counts = { open: items.filter(i => i.status === "open").length, sos: items.filter(i => i.type === "sos").length };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Grievances & Alerts</h1>
          <p className="text-sm text-[#8c6d4f]">SoS and help requests from students and staff. Email alerts are sent automatically.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setForm(f => ({...f, type:"help"})); setShowAdd(true); }}
            className="rounded-lg border border-[#8c6d4f] px-4 py-2 text-sm font-medium text-[#8c6d4f] hover:bg-[#f5ece1] transition">
            🆘 Get Help
          </button>
          <button onClick={() => { setForm(f => ({...f, type:"sos", priority:"critical"})); setShowAdd(true); }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition animate-pulse">
            🚨 SoS Alert
          </button>
        </div>
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Open Grievances", value: counts.open, warn: counts.open > 0 },
          { label: "Active SoS",      value: counts.sos,  warn: counts.sos > 0 },
          { label: "Total Logged",    value: items.length },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border bg-white p-4 shadow-sm ${k.warn ? "border-red-200" : "border-[#efe3d5]"}`}>
            <p className="text-xs text-[#8c6d4f]">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn ? "text-red-600" : "text-[#2f2a24]"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-[#dfd1c2] overflow-hidden text-sm">
          {["","open","in_progress","resolved"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 transition ${filterStatus === s ? "bg-[#8c6d4f] text-white" : "hover:bg-[#f5ece1] text-[#6e5034]"}`}>
              {s === "" ? "All" : s.replace("_"," ")}
            </button>
          ))}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
          <option value="">All Types</option>
          <option value="sos">SoS</option>
          <option value="help">Get Help</option>
        </select>
      </div>

      {loading ? <PageSkeleton rows={3} /> : (
        <div className="space-y-3">
          {items.length === 0 && <div className="rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f]">No grievances found.</div>}
          {items.map(g => (
            <div key={g._id}
              className={`rounded-xl border bg-white p-5 shadow-sm cursor-pointer hover:shadow-md transition ${g.type === "sos" ? "border-red-200" : "border-[#efe3d5]"}`}
              onClick={() => setSelected(g)}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLE[g.priority] ?? ""}`}>
                      {g.type === "sos" ? "🚨 SoS" : "🆘 Help"} · {g.priority}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[g.status] ?? ""}`}>
                      {g.status.replace("_"," ")}
                    </span>
                    {g.emailSent && <span className="text-xs text-emerald-600">✉ Email sent</span>}
                  </div>
                  <p className="font-semibold text-[#2f2a24]">{g.subject}</p>
                  <p className="text-xs text-[#8c6d4f] mt-0.5">{g.submittedBy} · {g.role} · {g.home} · {new Date(g.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className="text-xs text-[#8c6d4f]">Click to manage →</span>
              </div>
              <p className="mt-2 text-sm text-[#4a3f35] line-clamp-2">{g.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-[#2f2a24]">{selected.subject}</h2>
              <button onClick={() => setSelected(null)} className="text-[#8c6d4f] hover:text-[#2f2a24]">✕</button>
            </div>
            <p className="text-sm text-[#4a3f35] leading-relaxed">{selected.message}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#8c6d4f]">
              <span>From: <b>{selected.submittedBy}</b></span>
              <span>Role: <b>{selected.role}</b></span>
              <span>Home: <b>{selected.home}</b></span>
              <span>Priority: <b className="text-red-600">{selected.priority}</b></span>
            </div>
            {selected.status !== "resolved" && (
              <>
                <textarea rows={2} value={resolveNote} onChange={e => setResolveNote(e.target.value)}
                  placeholder="Resolution note (optional)..."
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(selected._id, "in_progress")}
                    className="flex-1 rounded-lg border border-blue-200 bg-blue-50 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition">
                    Mark In Progress
                  </button>
                  <button onClick={() => updateStatus(selected._id, "resolved")}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition">
                    Mark Resolved ✓
                  </button>
                </div>
              </>
            )}
            {selected.status === "resolved" && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                ✓ Resolved by {selected.resolvedBy} — {selected.resolvedNote}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between">
              <h2 className={`text-lg font-bold ${form.type === "sos" ? "text-red-600" : "text-[#2f2a24]"}`}>
                {form.type === "sos" ? "🚨 Submit SoS Alert" : "🆘 Submit Help Request"}
              </h2>
              <button onClick={() => setShowAdd(false)}>✕</button>
            </div>
            {[
              { label:"Your Name", key:"submittedBy", type:"text" },
              { label:"Subject *", key:"subject", type:"text" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                <input type={f.type} value={(form as Record<string,string>)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Role", key:"role", opts:["student","staff","warden"] },
                { label:"Home", key:"home", opts:["Jammu","Anantnag","Kupwara","Beerwah"] },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                  <select value={(form as Record<string,string>)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Message *</label>
              <textarea rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)}
                className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1]">Cancel</button>
              <button onClick={submit} disabled={saving}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${form.type === "sos" ? "bg-red-600 hover:bg-red-700" : "bg-[#8c6d4f] hover:bg-[#795a3e]"}`}>
                {saving ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
