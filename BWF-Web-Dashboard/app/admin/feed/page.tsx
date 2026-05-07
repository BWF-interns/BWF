"use client";
import { useEffect, useState } from "react";
import { adminAPI } from "../lib/api";
import PageSkeleton from "../components/PageSkeleton";

interface Post {
  _id: string; studentId: string; studentName: string; home: string;
  mediaType: string; caption: string; platform: string;
  status: string; submittedOn: string; rejectionReason: string;
  reviewedBy: string;
}

const PLATFORM_BADGE: Record<string, string> = {
  internal:  "bg-gray-100 text-gray-600",
  instagram: "bg-pink-100 text-pink-600",
  facebook:  "bg-blue-100 text-blue-700",
  website:   "bg-emerald-100 text-emerald-700",
};

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
};

const MEDIA_ICON: Record<string, string> = { image: "🖼️", video: "🎥", text: "✏️" };

export default function FeedPage() {
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterHome, setFilterHome] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ studentId:"admin", studentName:"Admin", home:"Jammu", mediaType:"text", caption:"", platform:"internal" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    const p: Record<string,string> = {};
    if (filterStatus) p.status = filterStatus;
    if (filterHome)   p.home   = filterHome;
    adminAPI.getPosts(p)
      .then(d => { setPosts(d as Post[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [filterStatus, filterHome]);

  const review = async (id: string, status: "approved"|"rejected") => {
    let rejectionReason = "";
    if (status === "rejected") {
      const r = prompt("Reason for rejection (optional):"); if (r === null) return;
      rejectionReason = r;
    }
    try { await adminAPI.reviewPost(id, { status, rejectionReason }); setMsg(`Post ${status}.`); load(); }
    catch (e: unknown) { setError((e as Error).message); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try { await adminAPI.deletePost(id); setMsg("Deleted."); load(); }
    catch (e: unknown) { setError((e as Error).message); }
  };

  const compose = async () => {
    if (!form.caption) return;
    setSaving(true);
    try {
      await adminAPI.addPost({ ...form, status: "approved" });
      setMsg("Post published."); setShowCompose(false);
      setForm({ studentId:"admin", studentName:"Admin", home:"Jammu", mediaType:"text", caption:"", platform:"internal" });
      load();
    } catch (e: unknown) { setError((e as Error).message); }
    setSaving(false);
  };

  const pending  = posts.filter(p => p.status === "pending").length;
  const approved = posts.filter(p => p.status === "approved").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a24]">Social Feed</h1>
          <p className="text-sm text-[#8c6d4f]">Admin has full control — publish, approve, reject, or delete any post.</p>
        </div>
        <button onClick={() => setShowCompose(true)}
          className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] transition">
          ✏️ Compose Post
        </button>
      </header>

      {msg   && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-700">{msg}</div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label:"Pending Review", value:pending,  warn:pending>0 },
          { label:"Published",      value:approved },
          { label:"Total Posts",    value:posts.length },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border bg-white p-4 shadow-sm ${k.warn?"border-amber-200":"border-[#efe3d5]"}`}>
            <p className="text-xs text-[#8c6d4f]">{k.label}</p>
            <p className={`text-2xl font-bold ${k.warn?"text-amber-600":"text-[#2f2a24]"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Role Key */}
      <div className="rounded-xl border border-[#efe3d5] bg-[#fdfaf6] p-4">
        <p className="text-xs font-semibold text-[#8c6d4f] mb-2">FEED PERMISSIONS (when students/wardens join)</p>
        <div className="grid gap-2 sm:grid-cols-3 text-xs text-[#4a3f35]">
          <div className="flex items-start gap-2"><span className="text-base">👑</span><div><b>Admin:</b> Post, approve/reject, pin, delete any post</div></div>
          <div className="flex items-start gap-2"><span className="text-base">🏠</span><div><b>Warden:</b> Post for their home, moderate home feed, cannot delete other homes</div></div>
          <div className="flex items-start gap-2"><span className="text-base">🎓</span><div><b>Student:</b> Submit posts (pending approval), like and comment on approved posts</div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border border-[#dfd1c2] overflow-hidden text-sm">
          {["","pending","approved","rejected"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 transition ${filterStatus===s?"bg-[#8c6d4f] text-white":"hover:bg-[#f5ece1] text-[#6e5034]"}`}>
              {s===""?"All":s.charAt(0).toUpperCase()+s.slice(1)}{s==="pending"&&pending>0?` (${pending})`:""}
            </button>
          ))}
        </div>
        <select value={filterHome} onChange={e => setFilterHome(e.target.value)}
          className="rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
          <option value="">All Homes</option>
          {["Jammu","Anantnag","Kupwara","Beerwah"].map(h => <option key={h}>{h}</option>)}
        </select>
      </div>

      {/* Feed */}
      {loading ? <PageSkeleton rows={3} /> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.length === 0 && (
            <div className="col-span-3 rounded-xl border border-[#efe3d5] bg-white p-8 text-center text-[#8c6d4f]">
              No posts found. Compose a post or wait for submissions.
            </div>
          )}
          {posts.map(p => (
            <article key={p._id} className="rounded-2xl border border-[#efe3d5] bg-white shadow-sm overflow-hidden hover:shadow-md transition">
              {/* Card Header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <div className="h-9 w-9 rounded-full bg-[#f4e9dd] flex items-center justify-center text-sm font-semibold text-[#8c6d4f]">
                  {p.studentName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2f2a24] truncate">{p.studentName}</p>
                  <p className="text-xs text-[#8c6d4f]">{p.home} · {p.submittedOn?.slice(0,10)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]??""}`}>{p.status}</span>
              </div>

              {/* Media area */}
              <div className="mx-4 mb-3 h-40 rounded-xl bg-[#f8efe5] flex items-center justify-center">
                <span className="text-4xl">{MEDIA_ICON[p.mediaType] ?? "📄"}</span>
              </div>

              {/* Caption */}
              {p.caption && <p className="px-4 pb-2 text-sm text-[#4a3f35] leading-relaxed line-clamp-3">{p.caption}</p>}

              {/* Tags */}
              <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PLATFORM_BADGE[p.platform]??""}`}>{p.platform}</span>
                <span className="rounded-full bg-[#f4e9dd] px-2 py-0.5 text-[11px] text-[#8c6d4f]">{p.mediaType}</span>
              </div>

              {p.rejectionReason && (
                <div className="mx-4 mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-600">
                  Reason: {p.rejectionReason}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-[#f2e9de] px-4 py-3 flex gap-2">
                {p.status === "pending" && (
                  <>
                    <button onClick={() => review(p._id,"approved")}
                      className="flex-1 rounded-lg bg-emerald-50 text-emerald-700 py-1.5 text-xs font-medium hover:bg-emerald-100 transition">
                      ✓ Approve
                    </button>
                    <button onClick={() => review(p._id,"rejected")}
                      className="flex-1 rounded-lg bg-red-50 text-red-600 py-1.5 text-xs font-medium hover:bg-red-100 transition">
                      ✕ Reject
                    </button>
                  </>
                )}
                {p.status === "rejected" && (
                  <button onClick={() => review(p._id,"approved")}
                    className="flex-1 rounded-lg bg-[#f5ece1] text-[#6e5034] py-1.5 text-xs font-medium hover:bg-[#ede0d0] transition">
                    Approve Anyway
                  </button>
                )}
                <button onClick={() => del(p._id)}
                  className="rounded-lg bg-gray-100 text-gray-500 px-3 py-1.5 text-xs font-medium hover:bg-gray-200 transition">
                  🗑
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold text-[#2f2a24]">Compose Post</h2>
              <button onClick={() => setShowCompose(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Display Name", key:"studentName", opts:null },
                { label:"Home",         key:"home",        opts:["Jammu","Anantnag","Kupwara","Beerwah"] },
                { label:"Media Type",   key:"mediaType",   opts:["text","image","video"] },
                { label:"Platform",     key:"platform",    opts:["internal","instagram","facebook","website"] },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-[#6e5034] mb-1">{f.label}</label>
                  {f.opts ? (
                    <select value={(form as Record<string,string>)[f.key]}
                      onChange={e => setForm({...form, [f.key]:e.target.value})}
                      className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none">
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={(form as Record<string,string>)[f.key]}
                      onChange={e => setForm({...form, [f.key]:e.target.value})}
                      className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6e5034] mb-1">Caption / Content *</label>
              <textarea rows={4} value={form.caption} onChange={e => setForm({...form, caption:e.target.value})}
                placeholder="What's on your mind?"
                className="w-full rounded-lg border border-[#dfd1c2] px-3 py-2 text-sm outline-none" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCompose(false)} className="rounded-lg border border-[#dfd1c2] px-4 py-2 text-sm hover:bg-[#f5ece1]">Cancel</button>
              <button onClick={compose} disabled={saving}
                className="rounded-lg bg-[#8c6d4f] px-4 py-2 text-sm font-medium text-white hover:bg-[#795a3e] disabled:opacity-50">
                {saving ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
