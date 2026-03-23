'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdmin } from '@/lib/auth';
import { PostsAPI } from '@/lib/api';

const TABS = [
  { key: 'approved', label: '✅ Approved' },
  { key: 'hall_of_fame', label: '⭐ Hall of Fame' },
  { key: 'pending', label: '⏳ Pending' },
  { key: 'rejected', label: '❌ Rejected' },
];

const SAFEGUARDING = [
  'No identifiable landmarks or street signs visible',
  'No school uniforms or institution names visible',
  'Child depicted with dignity (not as object of pity)',
  'Explicit guardian consent recorded before sharing externally',
];

export default function MediaPage() {
  const { user, ready } = useAdmin();
  const [posts, setPosts] = useState({ approved: [], hall_of_fame: [], pending: [], rejected: [] });
  const [tab, setTab] = useState('approved');
  const [toast, setToast] = useState(null);

  useEffect(() => { if (ready) load(); }, [ready]);

  async function load() {
    try {
      const [approved, pending] = await Promise.all([PostsAPI.approved(), PostsAPI.pending()]);
      const approvedList = approved.data || approved || [];
      const pendingList = pending.data || pending || [];
      setPosts({
        approved: approvedList.filter(p => p.status === 'approved' && !p.hallOfFame),
        hall_of_fame: approvedList.filter(p => p.hallOfFame),
        pending: pendingList,
        rejected: approvedList.filter(p => p.status === 'rejected'),
      });
    } catch (e) { showToast(e.message, 'error'); }
  }

  function showToast(msg, type = 'info') { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }

  async function actionPost(id, action, hallOfFame) {
    try {
      await PostsAPI.review(id, action, hallOfFame, hallOfFame ? 'Featured in Hall of Fame by Admin' : '');
      showToast(hallOfFame ? '⭐ Added to Hall of Fame' : action === 'approve' ? '✅ Approved' : '❌ Rejected', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  const currentPosts = posts[tab] || [];

  if (!ready) return <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"/></div>;

  return (
    <div className="app-layout">
      <AdminSidebar user={user} />
      <div className="main-content">
        <header className="topbar">
          <div><h1>📸 Media Oversight</h1><p>Dignity verification, de-identification audit, Hall of Fame management</p></div>
        </header>
        <div className="page-content fade-in">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: tab === t.key ? 'var(--primary-dim)' : 'transparent', color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)' }}>
                {t.label} ({posts[t.key]?.length || 0})
              </button>
            ))}
          </div>

          {/* Media grid */}
          {currentPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === 'pending' ? '🎉' : '📭'}</div>
              <h3>{tab === 'pending' ? 'All clear — no pending posts!' : 'No posts here'}</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {currentPosts.map(p => {
                const student = p.student?.user?.name || p.author?.name || 'Unknown';
                const hasImage = p.imageUrl;
                return (
                  <div key={p._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    {/* Image */}
                    <div style={{ width: '100%', height: 180, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 60 }}>
                      {hasImage ? <img src={p.imageUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : '📷'}
                      {p.hallOfFame && <div style={{ position: 'absolute', top: 8, right: 8, background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: '#000', borderRadius: 10, padding: '3px 8px', fontSize: 10, fontWeight: 800 }}>⭐ HoF</div>}
                      <div style={{ position: 'absolute', top: 8, left: 8, background: p.status === 'approved' ? 'rgba(34,197,94,0.9)' : p.status === 'rejected' ? 'rgba(239,68,68,0.9)' : 'rgba(245,158,11,0.9)', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                        {p.status === 'approved' ? '✅ Approved' : p.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                      </div>
                    </div>
                    {/* Body */}
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{student}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{p.student?.homeGroup || '—'} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}</div>
                      {/* Safeguarding checklist */}
                      <div style={{ marginBottom: 10 }}>
                        {SAFEGUARDING.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)', padding: '2px 0' }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.reviewNote ? '#22c55e' : '#6b7280', flexShrink: 0 }}/>
                            {c}
                          </div>
                        ))}
                      </div>
                      {/* Actions */}
                      {p.status === 'pending_review' && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => actionPost(p._id, 'approve', false)}>✅ Approve</button>
                          <button className="btn btn-secondary btn-sm" style={{ color: '#f59e0b' }} onClick={() => actionPost(p._id, 'approve', true)}>⭐ HoF</button>
                          <button className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }} onClick={() => actionPost(p._id, 'reject', false)}>❌ Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <div><div className="toast-title">{toast.msg}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
