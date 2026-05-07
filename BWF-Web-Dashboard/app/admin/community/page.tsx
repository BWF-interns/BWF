"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import PageSkeleton from "../components/PageSkeleton";

interface PendingPost {
  _id: string; content: string; type: "text" | "poll";
  tags: string[]; pollOptions: { text: string }[];
  creatorName: string; creatorRole: string; hostelName: string;
  status: string; rejectionReason: string; createdAt: string;
}

interface LivePost {
  _id: string; content: string; type: "text" | "poll";
  tags: string[]; pollOptions: { text: string; votes: number }[];
  creatorName: string; creatorRole: string; hostelName: string;
  pinned: boolean; createdAt: string;
}

// Render #bold# markers as <strong>
function renderContent(text: string) {
  const parts = text.split(/#([^#]+)#/g);
  return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
}

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
};

const HOMES = ["Jammu","Anantnag","Kupwara","Beerwah"];

export default function CommunityPage() {
  const [tab, setTab]               = useState<"pending"|"live">("pending");
  const [pending, setPending]       = useState<PendingPost[]>([]);
  const [live, setLive]             = useState<LivePost[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterHome, setFilterHome] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [msg, setMsg]               = useState("");
  const [error, setError]           = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm]             = useState({ content:"", type:"text", tags:"", hostelName:"Jammu" });
  const [saving, setSaving]         = useState(false);

  const flash = (m: string, isErr = false) => { isErr ? setError(m) : setMsg(m); setTimeout(() => { setMsg(""); setError(""); }, 4000); };

  const loadPending = () => {
    const p: Record<string,string> = { status: filterStatus };
    if (filterHome) p.hostelName = filterHome;
    adminAPI.getPendingPosts(p).then(d => { setPending(d as PendingPost[]); setLoading(false); }).catch(e => { flash(e.message, true); setLoading(false); });
  };

  const loadLive = () => {
    const p: Record<string,string> = {};
    if (filterHome) p.hostelName = filterHome;
    adminAPI.getLivePosts(p).then(d => { setLive(d as LivePost[]); setLoading(false); }).catch(e => { flash(e.message, true); setLoading(false); });
  };

  useEffect(() => { setLoading(true); if (tab === "pending") loadPending(); else loadLive(); }, [tab, filterHome, filterStatus]);

  const reviewPost = async (id: string, status: "approved"|"rejected") => {
    let rejectionReason = "";
    if (status === "rejected") { const r = prompt("Reason for rejection:"); if (r === null) return; rejectionReason = r; }
    try { await adminAPI.reviewPendingPost(id, { status, rejectionReason }); flash(`Post ${status}!`); loadPending(); }
    catch (e: unknown) { flash((e as Error).message, true); }
  };

  const deleteP = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try { await adminAPI.deletePendingPost(id); flash("Deleted."); loadPending(); }
    catch (e: unknown) { flash((e as Error).message, true); }
  };

  const deleteL = async (id: string) => {
    if (!confirm("Delete live post?")) return;
    try { await adminAPI.deleteLivePost(id); flash("Deleted."); loadLive(); }
    catch (e: unknown) { flash((e as Error).message, true); }
  };

  const pin = async (id: string) => {
    try { const r = await adminAPI.togglePinPost(id) as { message: string }; flash(r.message); loadLive(); }
    catch (e: unknown) { flash((e as Error).message, true); }
  };

  const compose = async () => {
    if (!form.content) return;
    setSaving(true);
    try {
      await adminAPI.createLivePost({ content: form.content, type: form.type, tags: form.tags.split(",").map(t=>t.trim()).filter(Boolean), hostelName: form.hostelName });
      flash("Post published to live feed!"); setShowCompose(false); setForm({ content:"", type:"text", tags:"", hostelName:"Jammu" }); loadLive();
    } catch (e: unknown) { flash((e as Error).message, true); }
    setSaving(false);
  };

  const pendingCount = pending.filter(p => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Community Feed</h1>
          <p className="text-sm text-[#8c6d4f]">Moderate pending posts from students · Manage live feed · Admin can pin & delete.</p>
        </div>
        <div className="flex gap-2">
          {tab === "live" && (
            <button onClick={() => setShowCompose(true)}
              className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
              ✏️ Admin Post
            </button>
          )}
        </div>
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl border border-[#efe3d5] bg-[#fdfaf6] p-1 w-fit">
        {(["pending","live"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${tab===t?"bg-white text-[#2f2a24] shadow-sm":"text-[#8c6d4f] hover:text-[#2f2a24]"}`}>
            {t === "pending" ? `Pending Review ${pendingCount > 0 ? `(${pendingCount})` : ""}` : "Live Feed"}
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
        {tab === "pending" && (
          <div className="flex rounded-lg border border-[#dfd1c2] overflow-hidden text-sm">
            {["pending","approved","rejected"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 transition capitalize ${filterStatus===s?"bg-[#8c6d4f] text-white":"hover:bg-[#f5ece1] text-[#6e5034]"}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? <PageSkeleton rows={3} /> : (
        <div className="space-y-4">
          {tab === "pending" && pending.length === 0 && (
            <div className="rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f]">No posts in this queue.</div>
          )}
          {tab === "live" && live.length === 0 && (
            <div className="rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f]">No live posts yet.</div>
          )}

          {/* Pending Posts */}
          {tab === "pending" && pending.map(post => (
            <div key={post._id} className="rounded-2xl border border-[#efe3d5] bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#f4e9dd] flex items-center justify-center text-sm font-semibold text-[#8c6d4f]">
                    {(post.creatorName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2f2a24] text-sm">{post.creatorName || "Unknown"}</p>
                    <p className="text-xs text-[#8c6d4f] capitalize">{post.creatorRole} · {post.hostelName} · {new Date(post.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[post.status]??""}`}>{post.status}</span>
                  {post.type === "poll" && <span className="rounded-full bg-indigo-100 text-indigo-600 px-2 py-0.5 text-xs">📊 Poll</span>}
                </div>
              </div>

              <p className="text-sm text-[#2f2a24] leading-relaxed">{renderContent(post.content)}</p>

              {post.type === "poll" && post.pollOptions.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {post.pollOptions.map((opt, i) => (
                    <div key={i} className="rounded-lg border border-[#dfd1c2] bg-[#fdfaf6] px-3 py-2 text-xs text-[#6e5034]">{opt.text}</div>
                  ))}
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.map(t => <span key={t} className="rounded-full bg-[#f4e9dd] px-2 py-0.5 text-xs text-[#8c6d4f]">#{t}</span>)}
                </div>
              )}

              {post.rejectionReason && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">Rejection reason: {post.rejectionReason}</div>
              )}

              {post.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => reviewPost(post._id, "approved")}
                    className="flex-1 rounded-lg bg-emerald-50 text-emerald-700 py-2 text-sm font-medium hover:bg-emerald-100 transition">
                    ✓ Approve → Live Feed
                  </button>
                  <button onClick={() => reviewPost(post._id, "rejected")}
                    className="flex-1 rounded-lg bg-red-50 text-red-600 py-2 text-sm font-medium hover:bg-red-100 transition">
                    ✕ Reject
                  </button>
                  <button onClick={() => deleteP(post._id)}
                    className="rounded-lg bg-gray-100 text-gray-500 px-3 py-2 text-sm hover:bg-gray-200 transition">
                    🗑
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Live Posts */}
          {tab === "live" && live.map(post => (
            <div key={post._id} className={`rounded-2xl border bg-white p-5 shadow-sm space-y-3 ${post.pinned ? "border-amber-300 bg-amber-50/30" : "border-[#efe3d5]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {post.pinned && <span className="text-base" title="Pinned">📌</span>}
                  <div className="h-9 w-9 rounded-full bg-[#f4e9dd] flex items-center justify-center text-sm font-semibold text-[#8c6d4f]">
                    {(post.creatorName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2f2a24] text-sm">{post.creatorName}</p>
                    <p className="text-xs text-[#8c6d4f] capitalize">{post.creatorRole} · {post.hostelName} · {new Date(post.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                {post.type === "poll" && <span className="rounded-full bg-indigo-100 text-indigo-600 px-2 py-0.5 text-xs">📊 Poll</span>}
              </div>

              <p className="text-sm text-[#2f2a24] leading-relaxed">{renderContent(post.content)}</p>

              {post.type === "poll" && post.pollOptions.length > 0 && (
                <div className="space-y-2">
                  {post.pollOptions.map((opt, i) => {
                    const total = post.pollOptions.reduce((s, o) => s + o.votes, 0);
                    const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                    return (
                      <div key={i} className="rounded-lg border border-[#dfd1c2] overflow-hidden">
                        <div className="relative px-3 py-2 text-xs text-[#2f2a24]">
                          <div className="absolute inset-0 bg-[#f4e9dd]" style={{ width: `${pct}%` }} />
                          <span className="relative">{opt.text} — {opt.votes} votes ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.map(t => <span key={t} className="rounded-full bg-[#f4e9dd] px-2 py-0.5 text-xs text-[#8c6d4f]">#{t}</span>)}
                </div>
              )}

              <div className="flex gap-2 pt-1 border-t border-[#f2e9de]">
                <button onClick={() => pin(post._id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${post.pinned ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {post.pinned ? "📌 Unpin" : "📌 Pin"}
                </button>
                <button onClick={() => deleteL(post._id)}
                  className="rounded-lg bg-red-50 text-red-500 px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition">
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2f2a24]">Admin Post to Live Feed</h2>
              <button onClick={() => setShowCompose(false)}>✕</button>
            </div>
            <p className="text-xs text-[#8c6d4f]">Use <code className="bg-gray-100 px-1 rounded">#text#</code> to make text bold. Posts go directly to live feed.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
                  <option value="text">Text</option>
                  <option value="poll">Poll</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6e5034] mb-1">Home</label>
                <select value={form.hostelName} onChange={e => setForm({...form, hostelName:e.target.value})}
                  className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
                  {HOMES.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Content *</label>
              <textarea rows={4} value={form.content} onChange={e => setForm({...form, content:e.target.value})}
                placeholder="Write your post... use #bold text# for emphasis"
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({...form, tags:e.target.value})}
                placeholder="sports, event, announcement"
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCompose(false)} className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1]">Cancel</button>
              <button onClick={compose} disabled={saving}
                className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50">
                {saving ? "Publishing..." : "Publish to Live Feed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
