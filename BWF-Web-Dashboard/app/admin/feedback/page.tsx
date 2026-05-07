"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import PageSkeleton from "../components/PageSkeleton";

interface Feedback {
  _id: string; submittedBy: string; role: string; home: string;
  category: string; message: string; rating?: number; anonymous: boolean;
  status: string; reviewedBy?: string; reviewNote?: string; createdAt: string;
}

const STAR_COLORS = ["","text-gray-300","text-red-400","text-amber-400","text-amber-500","text-emerald-500"];
const CATEGORIES  = ["academics","facilities","food","staff","general","other"];
const ROLES       = ["student","staff","warden"];

export default function FeedbackPage() {
  const [items, setItems]         = useState<Feedback[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole, setFilterRole]   = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [selected, setSelected]   = useState<Feedback | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState({ submittedBy:"", role:"student", home:"Jammu", category:"general", message:"", rating:5, anonymous:false });
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState("");
  const [error, setError]         = useState("");

  const load = () => {
    setLoading(true);
    const p: Record<string,string> = {};
    if (filterStatus) p.status   = filterStatus;
    if (filterRole)   p.role     = filterRole;
    if (filterCat)    p.category = filterCat;
    adminAPI.getFeedback(p)
      .then(d => { setItems(d as Feedback[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [filterStatus, filterRole, filterCat]);

  const markReviewed = async (id: string, status: string) => {
    try {
      await adminAPI.reviewFeedback(id, { status, reviewNote });
      setMsg("Feedback updated."); setSelected(null); setReviewNote(""); load();
    } catch (e: unknown) { setError((e as Error).message); }
  };

  const submit = async () => {
    if (!form.message) return;
    setSaving(true);
    try {
      await adminAPI.addFeedback(form);
      setMsg("Feedback submitted."); setShowAdd(false); load();
    } catch (e: unknown) { setError((e as Error).message); }
    setSaving(false);
  };

  const avgRating = items.filter(i => i.rating).reduce((a, i) => a + (i.rating??0), 0) / (items.filter(i=>i.rating).length || 1);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Feedback</h1>
          <p className="text-sm text-[#8c6d4f]">Insights from students and staff. Average rating: {avgRating.toFixed(1)} ⭐</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
          + Submit Feedback
        </button>
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label:"Total Feedback",   value: items.length },
          { label:"New (Unreviewed)", value: items.filter(i=>i.status==="new").length, warn:true },
          { label:"Avg Rating",       value: `${avgRating.toFixed(1)} / 5 ⭐` },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border bg-white p-4 shadow-sm ${k.warn && items.filter(i=>i.status==="new").length>0?"border-amber-200":"border-[#efe3d5]"}`}>
            <p className="text-xs text-[#8c6d4f]">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn && items.filter(i=>i.status==="new").length>0?"text-amber-600":"text-[#2f2a24]"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { val:filterStatus, set:setFilterStatus, opts:["","new","reviewed","actioned"], labels:["All Status","New","Reviewed","Actioned"] },
          { val:filterRole,   set:setFilterRole,   opts:["","student","staff","warden"],  labels:["All Roles","Student","Staff","Warden"] },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
            className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
            {f.opts.map((o, j) => <option key={o} value={o}>{f.labels[j]}</option>)}
          </select>
        ))}
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <PageSkeleton rows={3} /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.length === 0 && <div className="col-span-3 rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f]">No feedback yet.</div>}
          {items.map(f => (
            <div key={f._id} onClick={() => setSelected(f)}
              className="rounded-xl border border-[#efe3d5] bg-white p-5 shadow-sm cursor-pointer hover:shadow-md transition space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#2f2a24]">{f.anonymous ? "Anonymous" : f.submittedBy}</p>
                  <p className="text-xs text-[#8c6d4f] capitalize">{f.role} · {f.home} · {f.category}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.status==="new"?"bg-amber-100 text-amber-700":f.status==="actioned"?"bg-emerald-100 text-emerald-700":"bg-gray-100 text-gray-600"}`}>
                  {f.status}
                </span>
              </div>
              {f.rating && (
                <div className="flex gap-0.5 text-lg">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={n <= f.rating! ? STAR_COLORS[f.rating!] : "text-gray-200"}>★</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-[#4a3f35] line-clamp-3">{f.message}</p>
              <p className="text-xs text-[#8c6d4f]">{new Date(f.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold text-[#2f2a24]">Feedback Details</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <p className="text-sm text-[#4a3f35] leading-relaxed">{selected.message}</p>
            {selected.rating && (
              <div className="flex gap-1 text-xl">
                {[1,2,3,4,5].map(n => <span key={n} className={n <= selected.rating! ? STAR_COLORS[selected.rating!] : "text-gray-200"}>★</span>)}
              </div>
            )}
            <textarea rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)}
              placeholder="Add a review note..."
              className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
            <div className="flex gap-2">
              <button onClick={() => markReviewed(selected._id, "reviewed")}
                className="flex-1 rounded-lg border border-[#8c6d4f] py-2 text-sm text-[#8c6d4f] hover:bg-[#f5ece1]">
                Mark Reviewed
              </button>
              <button onClick={() => markReviewed(selected._id, "actioned")}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Mark Actioned ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold text-[#2f2a24]">Submit Feedback</h2>
              <button onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Name (or leave blank)", key:"submittedBy", type:"text", full:true },
              ].map(f => (
                <div key={f.key} className={f.full ? "col-span-2" : ""}>
                  <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                  <input type={f.type} value={(form as Record<string,string>)[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                    className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
                </div>
              ))}
              {[
                { label:"Role", key:"role", opts:ROLES },
                { label:"Category", key:"category", opts:CATEGORIES },
                { label:"Home", key:"home", opts:["Jammu","Anantnag","Kupwara","Beerwah"] },
                { label:"Rating", key:"rating", opts:["1","2","3","4","5"] },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                  <select value={String((form as Record<string,unknown>)[f.key])}
                    onChange={e => setForm({...form, [f.key]: f.key==="rating" ? Number(e.target.value) : e.target.value})}
                    className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Message *</label>
              <textarea rows={3} value={form.message} onChange={e => setForm({...form, message:e.target.value})}
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#6e5034]">
              <input type="checkbox" checked={form.anonymous} onChange={e => setForm({...form, anonymous:e.target.checked})} />
              Submit anonymously
            </label>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1]">Cancel</button>
              <button onClick={submit} disabled={saving}
                className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50">
                {saving ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
