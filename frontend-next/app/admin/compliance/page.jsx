'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdmin } from '@/lib/auth';
import { AdminAPI } from '@/lib/api';

export default function CompliancePage() {
  const { user, ready } = useAdmin();
  const [compData, setCompData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalStudent, setModalStudent] = useState(null);
  const [method, setMethod] = useState('Offline Form');
  const [toast, setToast] = useState(null);

  useEffect(() => { if (ready) load(); }, [ready]);

  async function load() {
    try { const { data } = await AdminAPI.compliance(); setCompData(data); }
    catch (e) { showToast(e.message, 'error'); }
  }

  function showToast(msg, type = 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function submitConsent() {
    try {
      await AdminAPI.recordConsent(modalStudent._id, method);
      showToast('✅ Consent recorded and audit trail updated', 'success');
      setModalStudent(null);
      load();
    } catch (e) { showToast(e.message, 'error'); }
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 3600 * 1000);

  const filtered = (compData?.students || []).filter(s => {
    const nameMatch = !search || s.user?.name?.toLowerCase().includes(search.toLowerCase());
    if (!nameMatch) return false;
    if (filter === 'missing') return !s.guardianConsent;
    if (filter === 'verified') return s.dpdpConsent?.isVerified;
    if (filter === 'risk') return !s.guardianConsent && new Date(s.joinDate) < thirtyDaysAgo;
    return true;
  });

  if (!ready) return <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"/></div>;

  return (
    <div className="app-layout">
      <AdminSidebar user={user} />
      <div className="main-content">
        <header className="topbar">
          <div><h1>🔒 DPDP Compliance Hub</h1><p>Digital Personal Data Protection Act 2023 — Consent Governance</p></div>
        </header>

        <div className="page-content fade-in">
          {/* Stats */}
          {compData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Students', val: compData.total, color: '' },
                { label: 'Consent Given', val: compData.total - compData.consentMissing, color: '#22c55e' },
                { label: 'Consent Missing', val: compData.consentMissing, color: '#ef4444' },
                { label: 'DPDP Verified', val: compData.dpdpVerified, color: '#6366f1' },
                { label: 'Retention Risk', val: compData.retentionRisk, color: '#f97316' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <strong style={{ fontSize: 24, fontWeight: 800, color: s.color || 'var(--text-primary)', display: 'block' }}>{s.val}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Retention risk banner */}
          {compData?.retentionRisk > 0 && (
            <div className="card" style={{ borderColor: '#ef4444', background: 'rgba(239,68,68,0.07)', marginBottom: 16 }}>
              <strong style={{ color: '#ef4444' }}>⚖️ Data Retention Risk</strong>
              <p style={{ fontSize: 13, marginTop: 4, color: 'var(--text-secondary)' }}>
                {compData.retentionRisk} student(s) enrolled more than 30 days ago without recorded guardian consent — DPDP Act 2023 compliance risk.
              </p>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <select className="form-control" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Students</option>
              <option value="missing">Consent Missing</option>
              <option value="verified">DPDP Verified</option>
              <option value="risk">Retention Risk</option>
            </select>
            <input className="form-control" style={{ flex: 1, minWidth: 180 }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}/>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr>
                <th>Student</th><th>House</th><th>Program</th>
                <th>Consent</th><th>DPDP</th><th>Method</th><th>Enrolled</th><th>Action</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No students match</td></tr>
                ) : filtered.map(s => {
                  const isRisk = !s.guardianConsent && new Date(s.joinDate) < thirtyDaysAgo;
                  return (
                    <tr key={s._id} style={isRisk ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                      <td>{s.user?.name || '—'}<br/><small style={{ color: 'var(--text-muted)' }}>{s.studentId}</small></td>
                      <td>{s.homeGroup || '—'}</td>
                      <td style={{ fontSize: 12 }}>{s.bwfProgram || '—'}</td>
                      <td>{s.guardianConsent ? <span className="status-ok">✅ Given</span> : <span className="status-warn">❌ Missing</span>}</td>
                      <td>{s.dpdpConsent?.isVerified ? <span className="status-ok">🔒 Verified</span> : <span className="status-warn">⚠️ Pending</span>}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.dpdpConsent?.verificationMethod || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.joinDate ? new Date(s.joinDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        {!s.guardianConsent
                          ? <button className="btn btn-primary btn-sm" onClick={() => setModalStudent(s)}>Record Consent</button>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Done</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      {modalStudent && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalStudent(null)}>
          <div className="modal-box">
            <div className="modal-title">🔒 Record Guardian Consent</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Student: <strong>{modalStudent.user?.name}</strong></p>
            <div className="form-group">
              <label className="form-label">Verification Method</label>
              <select className="form-control" value={method} onChange={e => setMethod(e.target.value)}>
                <option>Offline Form</option>
                <option>Digital Signature</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={submitConsent}>✅ Record Consent</button>
              <button className="btn btn-secondary" onClick={() => setModalStudent(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
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
