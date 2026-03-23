'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdmin } from '@/lib/auth';
import { AdminAPI } from '@/lib/api';

export default function StaffPage() {
  const { user, ready } = useAdmin();
  const [data, setData] = useState(null);

  useEffect(() => { if (ready) AdminAPI.staff().then(r => setData(r.data)).catch(console.error); }, [ready]);

  if (!ready) return <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"/></div>;

  const roleLabels = { housemother: 'Housemother', dean: 'Dean/Warden', admin: 'Administrator' };

  return (
    <div className="app-layout">
      <AdminSidebar user={user} />
      <div className="main-content">
        <header className="topbar">
          <div><h1>👥 Staff Management</h1><p>Caseloads, certifications, and turnover tracking</p></div>
        </header>
        <div className="page-content fade-in">
          {/* Stat cards */}
          {data && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { val: data.staffList.length, label: 'Total Staff', color: '' },
                { val: data.active, label: 'Active', color: '#22c55e' },
                { val: data.departed, label: 'Departed', color: '#ef4444' },
                { val: data.expiringCerts.length, label: 'Expiring Certs', color: data.expiringCerts.length ? '#f97316' : '' },
                { val: data.turnoverRatio + '%', label: 'Turnover Ratio', color: data.turnoverRatio > 30 ? '#ef4444' : '' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ textAlign: 'center', padding: 16 }}>
                  <strong style={{ display: 'block', fontSize: 24, fontWeight: 800, color: s.color || 'var(--text-primary)' }}>{s.val}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Turnover + cert alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="card">
              <div className="card-title">📊 Volunteer Turnover Ratio</div>
              {data ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--primary)' }}>{data.turnoverRatio}%</div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Active: <strong>{data.active}</strong></div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Departed: <strong>{data.departed}</strong></div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Departed ÷ Active × 100</div>
                  </div>
                </div>
              ) : <div className="spinner"/>}
            </div>
            <div className="card">
              <div className="card-title">⚠️ Certifications Expiring</div>
              {data?.expiringCerts?.length ? data.expiringCerts.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 8 }}>
                  <span>📋</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.staffName} — {c.cert}</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>Expires: {new Date(c.expiryDate).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              )) : <p style={{ color: '#22c55e', fontSize: 13 }}>✅ All certifications current</p>}
            </div>
          </div>

          {/* Staff table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Staff Member</th><th>Role</th><th>House</th><th>Type</th><th>Caseload</th><th>Status</th></tr></thead>
              <tbody>
                {!data ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}/></td></tr>
                  : data.staffList.map(s => (
                  <tr key={s._id}>
                    <td>{s.name}<br/><small style={{ color: 'var(--text-muted)' }}>{s.email}</small></td>
                    <td>{roleLabels[s.role] || s.role}</td>
                    <td>{s.homeGroup || '—'}</td>
                    <td style={{ fontSize: 12 }}>{s.staffType}</td>
                    <td>
                      <span style={{ fontSize: 16, fontWeight: 700, color: s.caseloadSize > 10 ? '#ef4444' : '#22c55e' }}>{s.caseloadSize}</span>
                      {s.caseloadSize > 10 && <><br/><small style={{ color: '#ef4444' }}>Overloaded</small></>}
                    </td>
                    <td><span className={`badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
