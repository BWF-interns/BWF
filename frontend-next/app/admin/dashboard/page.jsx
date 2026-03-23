'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdmin } from '@/lib/auth';
import { AdminAPI, formatINR } from '@/lib/api';

export default function AdminDashboard() {
  const { user, ready } = useAdmin();
  const [data, setData] = useState(null);
  const [welfare, setWelfare] = useState(null);
  const [risk, setRisk] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    Promise.all([AdminAPI.overview(), AdminAPI.welfare(), AdminAPI.risk()])
      .then(([ov, welf, rk]) => { setData(ov.data); setWelfare(welf.data); setRisk(rk.data); })
      .catch(e => setError(e.message));
  }, [ready]);

  if (!ready) return <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"/></div>;

  const kpis = data ? [
    { icon: '👩‍🎓', val: data.totalStudents, label: 'Total Students' },
    { icon: '👥', val: data.activeStaff, label: 'Active Staff' },
    { icon: '📋', val: data.pendingRequests, label: 'Pending Requests', flag: data.urgentRequests > 0 },
    { icon: '📸', val: data.pendingPosts, label: 'Pending Posts', flag: data.pendingPosts > 5 },
    { icon: '🔒', val: data.consentMissing, label: 'Consent Missing', flag: data.consentMissing > 0 },
    { icon: '💰', val: formatINR(data.thisYearDonations), label: 'Donations This Year' },
    { icon: '📤', val: formatINR(data.thisMonthExpenses), label: 'Expenses This Month' },
    { icon: '⏰', val: data.pendingExpenses, label: 'Expenses Pending', flag: data.pendingExpenses > 0 },
  ] : [];

  const radarItems = risk?.riskRadar ? [
    { label: 'Medical', score: risk.riskRadar.medicalRisk },
    { label: 'Engagement', score: risk.riskRadar.engagementRisk },
    { label: 'Urgency', score: risk.riskRadar.urgencyRisk },
    { label: 'Consent', score: risk.riskRadar.consentRisk },
    { label: 'Media', score: risk.riskRadar.mediaRisk },
  ] : [];

  const warnings = [];
  if (risk?.medicalSpike) warnings.push({ icon: '🚑', title: 'Medical Request Spike', sub: `${risk.medicalRequestsThisWeek} this week vs ${risk.medicalRequestsLastWeek} last week` });
  if (risk?.disengagedCount > 3) warnings.push({ icon: '📉', title: `${risk.disengagedCount} Students Disengaged`, sub: '0-day streak — housemother check-in needed' });
  if (data?.urgentRequests > 0) warnings.push({ icon: '🚨', title: `${data.urgentRequests} Urgent Requests`, sub: 'Requires immediate attention' });
  if (data?.consentMissing > 0) warnings.push({ icon: '⚖️', title: `${data.consentMissing} Missing Consent`, sub: 'DPDP Act 2023 compliance risk' });
  if (!warnings.length) warnings.push({ icon: '✅', title: 'All systems healthy', sub: 'No critical warnings' });

  return (
    <div className="app-layout">
      <AdminSidebar user={user} />
      <div className="main-content">
        <header className="topbar">
          <div>
            <h1>📊 Admin Dashboard</h1>
            <p>{data ? `${data.totalStudents} students · ${data.activeStaff} active staff · ${formatINR(data.thisYearDonations)} raised this year` : 'Loading overview...'}</p>
          </div>
          {data?.consentMissing > 0 && (
            <a href="/admin/compliance" className="btn btn-secondary btn-sm" style={{ color: 'var(--warning)' }}>
              ⚠️ {data.consentMissing} consent missing
            </a>
          )}
        </header>

        <div className="page-content fade-in">
          {error && <div style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</div>}

          {/* KPI Cards */}
          <div className="kpi-grid">
            {data ? kpis.map((k, i) => (
              <div key={i} className={`kpi-card ${k.flag ? 'kpi-flag' : ''}`}>
                <div className="kpi-icon">{k.icon}</div>
                <div className="kpi-value">{k.val}</div>
                <div className="kpi-label">{k.label}</div>
              </div>
            )) : <div className="kpi-card"><div className="spinner"/></div>}
          </div>

          {/* Charts */}
          <div className="chart-grid" style={{ marginTop: 20 }}>
            {/* Program enrollment */}
            <div className="chart-box">
              <div className="chart-title">📚 Program Enrollment</div>
              {welfare?.byProgram?.length ? (() => {
                const max = Math.max(...welfare.byProgram.map(p => p.count));
                return welfare.byProgram.map((p, i) => (
                  <div key={i} className="bar-row">
                    <span className="bar-label">{p._id || 'Unassigned'}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((p.count / max) * 100)}%` }}/></div>
                    <span className="bar-count">{p.count}</span>
                  </div>
                ));
              })() : <div className="spinner"/>}
            </div>

            {/* Home Group */}
            <div className="chart-box">
              <div className="chart-title">🏠 Home Group Distribution</div>
              {welfare?.byHomeGroup?.length ? (() => {
                const max = Math.max(...welfare.byHomeGroup.map(h => h.count));
                return welfare.byHomeGroup.map((h, i) => (
                  <div key={i} className="bar-row">
                    <span className="bar-label">{h._id || 'Unassigned'}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((h.count / max) * 100)}%`, background: 'linear-gradient(90deg,#a78bfa,#6366f1)' }}/></div>
                    <span className="bar-count">{h.count}</span>
                  </div>
                ));
              })() : <div className="spinner"/>}
            </div>

            {/* Risk radar */}
            <div className="chart-box">
              <div className="chart-title">🚨 Risk Radar</div>
              <div className="radar-grid">
                {radarItems.map((it, i) => {
                  const color = it.score >= 7 ? '#ef4444' : it.score >= 4 ? '#f97316' : '#22c55e';
                  return (
                    <div key={i} className="radar-item">
                      <div className="radar-score" style={{ color }}>{it.score}/10</div>
                      <div className="radar-label">{it.label}</div>
                      <div className="risk-bar"><div className="risk-fill" style={{ width: `${it.score * 10}%`, background: color }}/></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Early warnings */}
            <div className="chart-box">
              <div className="chart-title">⚠️ Early Warnings</div>
              {warnings.map((w, i) => (
                <div key={i} className="warning-item">
                  <span className="warning-icon">{w.icon}</span>
                  <div><div className="warning-title">{w.title}</div><div className="warning-sub">{w.sub}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
