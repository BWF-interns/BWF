"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import PageSkeleton from "../components/PageSkeleton";

interface Activity {
  _id: string; title: string; description: string;
  requestedBy: string; requesterRole: string;
  date: string; time: string; location: string;
  category: string; hostelName: string; status: string;
  approvedBy?: string; rejectionReason?: string; createdAt: string;
}

const CATEGORIES = ["Cultural","Sports","Technical","Academic","Social","Entertainment"];
const CATEGORY_ICONS: Record<string, string> = {
  Cultural:"🎭", Sports:"⚽", Technical:"💻", Academic:"📚", Social:"🤝", Entertainment:"🎉"
};
const STATUS_STYLE: Record<string, string> = {
  upcoming:  "bg-blue-100 text-blue-700",
  ongoing:   "bg-emerald-100 text-emerald-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-500",
  pending:   "bg-amber-100 text-amber-700",
  approved:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-red-100 text-red-600",
};
const HOMES = ["Jammu","Anantnag","Kupwara","Beerwah"];

export default function ActivitiesPage() {
  const [tab, setTab]                 = useState<"pending"|"live">("live");
  const [pending, setPending]         = useState<Activity[]>([]);
  const [activities, setActivities]   = useState<Activity[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filterCat, setFilterCat]     = useState("");
  const [filterHome, setFilterHome]   = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [showAdd, setShowAdd]         = useState(false);
  const [editItem, setEditItem]       = useState<Activity | null>(null);
  const [form, setForm]               = useState({ title:"", description:"", date:"", time:"", location:"", category:"Cultural", hostelName:"Jammu" });
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState("");
  const [error, setError]             = useState("");

  const flash = (m: string, isErr = false) => { isErr ? setError(m) : setMsg(m); setTimeout(() => { setMsg(""); setError(""); }, 4000); };

  const loadPending = () => {
    const p: Record<string,string> = { status: filterStatus };
    if (filterHome) p.hostelName = filterHome;
    adminAPI.getPendingActivities(p).then(d => { setPending(d as Activity[]); setLoading(false); }).catch(e => { flash(e.message, true); setLoading(false); });
  };

  const loadLive = () => {
    const p: Record<string,string> = {};
    if (filterCat)  p.category = filterCat;
    if (filterHome) p.hostelName = filterHome;
    adminAPI.getActivities(p).then(d => { setActivities(d as Activity[]); setLoading(false); }).catch(e => { flash(e.message, true); setLoading(false); });
  };

  useEffect(() => { setLoading(true); if (tab === "pending") loadPending(); else loadLive(); }, [tab, filterCat, filterHome, filterStatus]);

  const review = async (id: string, status: "approved"|"rejected") => {
    let rejectionReason = "";
    if (status === "rejected") { const r = prompt("Reason:"); if (r === null) return; rejectionReason = r; }
    try { await adminAPI.reviewPendingActivity(id, { status, rejectionReason }); flash(`Activity ${status}!`); loadPending(); }
    catch (e: unknown) { flash((e as Error).message, true); }
  };

  const del = async (id: string, isLive: boolean) => {
    if (!confirm("Delete this activity?")) return;
    try {
      if (isLive) { await adminAPI.deleteActivity(id); loadLive(); }
      else        { await adminAPI.deletePendingActivity(id); loadPending(); }
      flash("Deleted.");
    } catch (e: unknown) { flash((e as Error).message, true); }
  };

  const updateStatus = async (id: string, status: string) => {
    try { await adminAPI.updateActivity(id, { status }); flash(`Marked ${status}.`); loadLive(); }
    catch (e: unknown) { flash((e as Error).message, true); }
  };

  const save = async () => {
    if (!form.title || !form.description || !form.date) return;
    setSaving(true);
    try {
      if (editItem) { await adminAPI.updateActivity(editItem._id, form); flash("Activity updated!"); }
      else          { await adminAPI.createActivity(form); flash("Activity created!"); }
      setShowAdd(false); setEditItem(null); setForm({ title:"", description:"", date:"", time:"", location:"", category:"Cultural", hostelName:"Jammu" }); loadLive();
    } catch (e: unknown) { flash((e as Error).message, true); }
    setSaving(false);
  };

  const pendingCount = pending.filter(p => p.status === "pending").length;

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = activities.filter(a => a.category === cat);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Activities & Events</h1>
          <p className="text-sm text-[#8c6d4f]">Approve pending requests · Manage live activities · Create admin events.</p>
        </div>
        {tab === "live" && (
          <button onClick={() => { setEditItem(null); setShowAdd(true); }}
            className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
            + Create Activity
          </button>
        )}
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#efe3d5] bg-[#fdfaf6] p-1 w-fit">
        {(["live","pending"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${tab===t?"bg-white text-[#2f2a24] shadow-sm":"text-[#8c6d4f] hover:text-[#2f2a24]"}`}>
            {t === "pending" ? `Pending Approval ${pendingCount > 0 ? `(${pendingCount})` : ""}` : "Live Activities"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterHome} onChange={e => setFilterHome(e.target.value)}
          className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
          <option value="">All Homes</option>
          {HOMES.map(h => <option key={h}>{h}</option>)}
        </select>
        {tab === "live" && (
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        )}
        {tab === "pending" && (
          <div className="flex rounded-lg border border-[#dfd1c2] overflow-hidden text-sm">
            {["pending","approved","rejected"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 transition capitalize ${filterStatus===s?"bg-[#8c6d4f] text-white":"hover:bg-[#f5ece1] text-[#6e5034]"}`}>{s}</button>
            ))}
          </div>
        )}
      </div>

      {loading ? <PageSkeleton rows={3} /> : (
        <>
          {/* Pending list */}
          {tab === "pending" && (
            <div className="space-y-4">
              {pending.length === 0 && <div className="rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f]">No activities in this queue.</div>}
              {pending.map(a => (
                <div key={a._id} className="rounded-2xl border border-[#efe3d5] bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{CATEGORY_ICONS[a.category]??""}</span>
                        <p className="font-semibold text-[#2f2a24]">{a.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[a.status]??""}`}>{a.status}</span>
                      </div>
                      <p className="text-xs text-[#8c6d4f]">{a.requestedBy} ({a.requesterRole}) · {a.hostelName} · {new Date(a.date).toLocaleDateString("en-IN")}{a.time ? ` at ${a.time}` : ""}</p>
                      {a.location && <p className="text-xs text-[#8c6d4f]">📍 {a.location}</p>}
                    </div>
                    <span className="rounded-full bg-[#f4e9dd] px-2 py-0.5 text-xs text-[#8c6d4f]">{a.category}</span>
                  </div>
                  <p className="text-sm text-[#4a3f35] leading-relaxed">{a.description}</p>
                  {a.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => review(a._id,"approved")}
                        className="flex-1 rounded-lg bg-emerald-50 text-emerald-700 py-2 text-sm font-medium hover:bg-emerald-100 transition">
                        ✓ Approve → Live
                      </button>
                      <button onClick={() => review(a._id,"rejected")}
                        className="flex-1 rounded-lg bg-red-50 text-red-600 py-2 text-sm font-medium hover:bg-red-100 transition">
                        ✕ Reject
                      </button>
                      <button onClick={() => del(a._id, false)}
                        className="rounded-lg bg-gray-100 text-gray-500 px-3 py-2 text-sm hover:bg-gray-200 transition">🗑</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Live activities — grouped by category */}
          {tab === "live" && (
            <div className="space-y-8">
              {activities.length === 0 && <div className="rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f]">No live activities yet.</div>}
              {Object.entries(grouped).filter(([,items]) => items.length > 0).map(([cat, items]) => (
                <div key={cat}>
                  <h2 className="flex items-center gap-2 text-base font-semibold text-[#2f2a24] mb-3">
                    <span>{CATEGORY_ICONS[cat]}</span> {cat}
                    <span className="rounded-full bg-[#f4e9dd] px-2 py-0.5 text-xs text-[#8c6d4f] font-normal">{items.length}</span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map(a => (
                      <div key={a._id} className="rounded-2xl border border-[#efe3d5] bg-white p-5 shadow-sm space-y-3 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-[#2f2a24]">{a.title}</p>
                            <p className="text-xs text-[#8c6d4f] mt-0.5">{a.hostelName} · {new Date(a.date).toLocaleDateString("en-IN")}{a.time ? ` · ${a.time}` : ""}</p>
                            {a.location && <p className="text-xs text-[#8c6d4f]">📍 {a.location}</p>}
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[a.status]??""}`}>{a.status}</span>
                        </div>
                        <p className="text-sm text-[#4a3f35] line-clamp-2">{a.description}</p>
                        <div className="flex gap-2 pt-1 border-t border-[#f2e9de]">
                          {["upcoming","ongoing","completed"].filter(s => s !== a.status).map(s => (
                            <button key={s} onClick={() => updateStatus(a._id, s)}
                              className="flex-1 rounded-lg bg-[#f5ece1] text-[#6e5034] py-1.5 text-xs hover:bg-[#ede0d0] transition capitalize">{s}</button>
                          ))}
                          <button onClick={() => { setEditItem(a); setForm({ title:a.title, description:a.description, date:a.date?.slice(0,10)??'', time:a.time??'', location:a.location??'', category:a.category, hostelName:a.hostelName??'Jammu' }); setShowAdd(true); }}
                            className="rounded-lg bg-blue-50 text-blue-600 px-2.5 py-1.5 text-xs hover:bg-blue-100">✏</button>
                          <button onClick={() => del(a._id, true)}
                            className="rounded-lg bg-red-50 text-red-400 px-2.5 py-1.5 text-xs hover:bg-red-100">🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold text-[#2f2a24]">{editItem ? "Edit Activity" : "Create Activity"}</h2>
              <button onClick={() => { setShowAdd(false); setEditItem(null); }}>✕</button>
            </div>
            <div className="grid gap-3">
              {[
                { label:"Title *", key:"title", type:"text" },
                { label:"Date *",  key:"date",  type:"date" },
                { label:"Time",    key:"time",  type:"time" },
                { label:"Location",key:"location",type:"text" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                  <input type={f.type} value={(form as Record<string,string>)[f.key]}
                    onChange={e => setForm({...form,[f.key]:e.target.value})}
                    className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:"Category", key:"category", opts:CATEGORIES },
                  { label:"Home",     key:"hostelName",opts:HOMES },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                    <select value={(form as Record<string,string>)[f.key]}
                      onChange={e => setForm({...form,[f.key]:e.target.value})}
                      className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">Description *</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAdd(false); setEditItem(null); }} className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1]">Cancel</button>
              <button onClick={save} disabled={saving}
                className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50">
                {saving ? "Saving..." : editItem ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
