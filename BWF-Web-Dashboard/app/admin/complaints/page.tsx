"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import PageSkeleton from "../components/PageSkeleton";

interface Complaint {
  _id: string; title: string; description: string; location: string;
  role: "student"|"staff"; priority: "Low"|"Medium"|"High";
  status: "OPEN"|"RESOLVED"|"ESCALATED";
  reporter: string; hostelName: string;
  timeline: {
    reportedDate: string; resolvedReason?: string; escalatedReason?: string;
    resolvedDate?: string; escalatedDate?: string;
  };
  createdAt: string;
}

const PRIORITY_STYLE: Record<string, string> = {
  High:   "border-red-200 bg-red-50",
  Medium: "border-amber-200 bg-amber-50/30",
  Low:    "border-[#efe3d5] bg-white",
};
const PRIORITY_BADGE: Record<string, string> = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-gray-100 text-gray-600",
};
const STATUS_BADGE: Record<string, string> = {
  OPEN:      "bg-blue-100 text-blue-700",
  RESOLVED:  "bg-emerald-100 text-emerald-700",
  ESCALATED: "bg-orange-100 text-orange-700",
};
const HOMES = ["Jammu","Anantnag","Kupwara","Beerwah"];

export default function ComplaintsPage() {
  const [items, setItems]             = useState<Complaint[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterRole, setFilterRole]   = useState("");
  const [filterHome, setFilterHome]   = useState("");
  const [selected, setSelected]       = useState<Complaint | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionType, setActionType]   = useState<"resolve"|"escalate"|null>(null);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState("");
  const [error, setError]             = useState("");

  const flash = (m: string, isErr = false) => { isErr ? setError(m) : setMsg(m); setTimeout(() => { setMsg(""); setError(""); }, 4000); };

  const load = () => {
    setLoading(true);
    const p: Record<string,string> = {};
    if (filterStatus)   p.status   = filterStatus;
    if (filterPriority) p.priority = filterPriority;
    if (filterRole)     p.role     = filterRole;
    if (filterHome)     p.hostelName = filterHome;
    adminAPI.getComplaints(p)
      .then(d => { setItems(d as Complaint[]); setLoading(false); })
      .catch(e => { flash(e.message, true); setLoading(false); });
  };

  useEffect(() => { load(); }, [filterStatus, filterPriority, filterRole, filterHome]);

  const act = async () => {
    if (!selected || !actionType) return;
    setSaving(true);
    try {
      if (actionType === "resolve") {
        await adminAPI.resolveComplaint(selected._id, { resolvedReason: actionReason || "Resolved by admin" });
        flash("Complaint resolved.");
      } else {
        await adminAPI.escalateComplaint(selected._id, { escalatedReason: actionReason || "Escalated by admin" });
        flash("Complaint escalated.");
      }
      setSelected(null); setActionType(null); setActionReason(""); load();
    } catch (e: unknown) { flash((e as Error).message, true); }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this complaint permanently?")) return;
    try { await adminAPI.deleteComplaint(id); flash("Deleted."); load(); }
    catch (e: unknown) { flash((e as Error).message, true); }
  };

  const counts = {
    open:      items.filter(i => i.status === "OPEN").length,
    high:      items.filter(i => i.priority === "High" && i.status === "OPEN").length,
    resolved:  items.filter(i => i.status === "RESOLVED").length,
    escalated: items.filter(i => i.status === "ESCALATED").length,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#2f2a24]">Complaints</h1>
        <p className="text-sm text-[#8c6d4f]">Hostel complaints from students and staff. Resolve or escalate with logged timeline.</p>
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label:"Open",     value:counts.open,      warn:counts.open>0 },
          { label:"High Priority", value:counts.high, warn:counts.high>0 },
          { label:"Resolved", value:counts.resolved },
          { label:"Escalated",value:counts.escalated, warn:counts.escalated>0 },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border bg-white p-4 shadow-sm ${k.warn?"border-red-200":"border-[#efe3d5]"}`}>
            <p className="text-xs text-[#8c6d4f]">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn?"text-red-600":"text-[#2f2a24]"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-[#dfd1c2] overflow-hidden text-sm">
          {["","OPEN","RESOLVED","ESCALATED"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 transition ${filterStatus===s?"bg-[#8c6d4f] text-white":"hover:bg-[#f5ece1] text-[#6e5034]"}`}>
              {s === "" ? "All" : s}
            </button>
          ))}
        </div>
        {[
          { val:filterPriority, set:setFilterPriority, opts:[["","All Priority"],["High","High"],["Medium","Medium"],["Low","Low"]] },
          { val:filterRole,     set:setFilterRole,     opts:[["","All Roles"],["student","Student"],["staff","Staff"]] },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
            className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
            {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <select value={filterHome} onChange={e => setFilterHome(e.target.value)}
          className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
          <option value="">All Homes</option>
          {HOMES.map(h => <option key={h}>{h}</option>)}
        </select>
      </div>

      {loading ? <PageSkeleton rows={4} /> : (
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f]">No complaints found.</div>
          )}
          {items.map(c => (
            <div key={c._id} className={`rounded-2xl border p-5 shadow-sm space-y-3 ${PRIORITY_STYLE[c.priority]??""}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_BADGE[c.priority]??""}`}>
                      {c.priority} Priority
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[c.status]??""}`}>
                      {c.status}
                    </span>
                    <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs capitalize">{c.role}</span>
                  </div>
                  <p className="font-semibold text-[#2f2a24]">{c.title}</p>
                  <p className="text-xs text-[#8c6d4f] mt-0.5">
                    {c.reporter || "Unknown"} · {c.hostelName} · {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    {c.location ? ` · 📍 ${c.location}` : ""}
                  </p>
                </div>
                <button onClick={() => del(c._id)} className="text-red-400 hover:text-red-600 text-sm transition">🗑</button>
              </div>

              <p className="text-sm text-[#4a3f35] leading-relaxed">{c.description}</p>

              {/* Timeline */}
              {(c.timeline.resolvedReason || c.timeline.escalatedReason) && (
                <div className="rounded-lg border border-[#efe3d5] bg-white px-4 py-3 text-xs space-y-1">
                  {c.timeline.resolvedReason && (
                    <p className="text-emerald-700">✓ Resolved: {c.timeline.resolvedReason} {c.timeline.resolvedDate ? `(${new Date(c.timeline.resolvedDate).toLocaleDateString("en-IN")})` : ""}</p>
                  )}
                  {c.timeline.escalatedReason && (
                    <p className="text-orange-700">⬆ Escalated: {c.timeline.escalatedReason} {c.timeline.escalatedDate ? `(${new Date(c.timeline.escalatedDate).toLocaleDateString("en-IN")})` : ""}</p>
                  )}
                </div>
              )}

              {c.status === "OPEN" && (
                <div className="flex gap-2">
                  <button onClick={() => { setSelected(c); setActionType("resolve"); setActionReason(""); }}
                    className="flex-1 rounded-lg bg-emerald-50 text-emerald-700 py-2 text-sm font-medium hover:bg-emerald-100 transition">
                    ✓ Mark Resolved
                  </button>
                  <button onClick={() => { setSelected(c); setActionType("escalate"); setActionReason(""); }}
                    className="flex-1 rounded-lg bg-orange-50 text-orange-600 py-2 text-sm font-medium hover:bg-orange-100 transition">
                    ⬆ Escalate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selected && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between">
              <h2 className={`text-lg font-bold ${actionType==="resolve"?"text-emerald-700":"text-orange-600"}`}>
                {actionType === "resolve" ? "✓ Resolve Complaint" : "⬆ Escalate Complaint"}
              </h2>
              <button onClick={() => { setSelected(null); setActionType(null); }}>✕</button>
            </div>
            <p className="text-sm text-[#2f2a24] font-medium">{selected.title}</p>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">
                {actionType === "resolve" ? "Resolution note" : "Escalation reason"} (optional)
              </label>
              <textarea rows={3} value={actionReason} onChange={e => setActionReason(e.target.value)}
                placeholder={actionType === "resolve" ? "How was this resolved?" : "Why is this being escalated?"}
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setSelected(null); setActionType(null); }}
                className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1]">Cancel</button>
              <button onClick={act} disabled={saving}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${actionType==="resolve"?"bg-emerald-600 hover:bg-emerald-700":"bg-orange-500 hover:bg-orange-600"}`}>
                {saving ? "Saving..." : actionType === "resolve" ? "Confirm Resolve" : "Confirm Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
