'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdmin } from '@/lib/auth';
import { AdminAPI } from '@/lib/api';

const COLORS = ['#6366f1','#a78bfa','#22c55e','#f59e0b','#ef4444','#06b6d4'];

function BarChart({ data, colorOffset = 0 }) {
  if (!data?.length) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return data.map((d, i) => (
    <div key={i} className="bar-row">
      <span className="bar-label">{d._id || 'Unknown'}</span>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((d.count / max) * 100)}%`, background: COLORS[(i + colorOffset) % COLORS.length] }}/></div>
      <span className="bar-count">{d.count}</span>
    </div>
  ));
}

export default function StudentsPage() {
  const { user, ready } = useAdmin();
  const [welfare, setWelfare] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterProg, setFilterProg] = useState('');
  const [filterHouse, setFilterHouse] = useState('');

  useEffect(() => {
    if (!ready) return;
    Promise.all([AdminAPI.welfare(), AdminAPI.compliance()])
      .then(([w, c]) => { setWelfare(w.data); setStudents(c.data.students); })
      .catch(console.error);
  }, [ready]);

  const filtered = students.filter(s =>
    (!search || s.user?.name?.toLowerCase().includes(search.toLowerCase()) || s.studentId?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterProg || s.bwfProgram === filterProg) &&
    (!filterHouse || s.homeGroup === filterHouse)
  );

  if (!ready) return <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"/></div>;

  const ageDist = welfare?.ageDist ? Object.entries(welfare.ageDist).map(([k, v]) => ({ _id: k, count: v })) : [];

  return (
    <div className="app-layout">
      <AdminSidebar user={user} />
      <div className="main-content">
        <header className="topbar">
          <div><h1>👩‍🎓 Student Census</h1><p>{students.length} total enrollments across all programs</p></div>
        </header>
        <div className="page-content fade-in">
          {/* Metric tiles */}
          {welfare && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { val: students.length, label: 'Total Students' },
                { val: welfare.byProgram?.find(p => p._id === 'Basera-e-Tabassum')?.count || 0, label: 'Basera-e-Tabassum' },
                { val: welfare.byProgram?.find(p => p._id === 'Foster A Home')?.count || 0, label: 'Foster A Home' },
                { val: welfare.byProgram?.find(p => p._id === 'Rah-e-Niswan')?.count || 0, label: 'Rah-e-Niswan' },
                { val: welfare.avgXP || 0, label: 'Avg XP Points' },
                { val: (welfare.avgStreak || 0) + 'd', label: 'Avg Streak' },
              ].map((t, i) => (
                <div key={i} className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{t.val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{t.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Demographic charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div className="chart-box"><div className="chart-title">📋 By Program</div><BarChart data={welfare?.byProgram} colorOffset={0}/></div>
            <div className="chart-box"><div className="chart-title">⚧ By Gender</div><BarChart data={welfare?.byGender} colorOffset={2}/></div>
            <div className="chart-box"><div className="chart-title">🏠 By Home Group</div><BarChart data={welfare?.byHomeGroup} colorOffset={1}/></div>
            <div className="chart-box"><div className="chart-title">👪 By Background</div><BarChart data={welfare?.byBackground?.filter(b => b._id)} colorOffset={3}/></div>
            <div className="chart-box"><div className="chart-title">🎂 By Age Group</div><BarChart data={ageDist} colorOffset={4}/></div>
            <div className="chart-box">
              <div className="chart-title">📈 Avg Metrics</div>
              {welfare && <>
                <div style={{ fontSize: 13, marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Avg XP</span> <strong style={{ color: '#6366f1' }}>{welfare.avgXP}</strong></div>
                <div style={{ fontSize: 13, marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Avg Streak</span> <strong style={{ color: '#22c55e' }}>{welfare.avgStreak} days</strong></div>
                <div style={{ fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Houses</span> <strong style={{ color: '#a78bfa' }}>{welfare.byHomeGroup?.length}</strong></div>
              </>}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <input className="form-control" style={{ flex: 1, minWidth: 180 }} placeholder="Search name or ID..." value={search} onChange={e => setSearch(e.target.value)}/>
            <select className="form-control" style={{ width: 'auto' }} value={filterProg} onChange={e => setFilterProg(e.target.value)}>
              <option value="">All Programs</option>
              <option>Basera-e-Tabassum</option><option>Foster A Home</option><option>Rah-e-Niswan</option>
            </select>
            <select className="form-control" style={{ width: 'auto' }} value={filterHouse} onChange={e => setFilterHouse(e.target.value)}>
              <option value="">All Houses</option>
              <option>House A</option><option>House B</option><option>House C</option>
            </select>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Student</th><th>ID</th><th>House</th><th>Program</th><th>Class</th><th>Background</th><th>XP</th><th>Consent</th></tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No students match filters</td></tr>
                  : filtered.map(s => (
                    <tr key={s._id}>
                      <td>{s.user?.name || '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.studentId || '—'}</td>
                      <td>{s.homeGroup || '—'}</td>
                      <td style={{ fontSize: 12 }}>{s.bwfProgram || '—'}</td>
                      <td>{s.education?.currentClass || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.familyDetails?.background || '—'}</td>
                      <td>{s.totalPoints || 0}</td>
                      <td>{s.guardianConsent ? '✅' : '❌'}</td>
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
