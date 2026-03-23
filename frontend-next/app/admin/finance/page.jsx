'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdmin } from '@/lib/auth';
import { AdminAPI, formatINR } from '@/lib/api';

const CAT_COLORS = { 'Program/Mission': '#22c55e', 'Overhead/Admin': '#ef4444', 'Fundraising Investment': '#6366f1', 'Medical Emergency': '#f97316' };

export default function FinancePage() {
  const { user, ready } = useAdmin();
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Program/Mission', associatedHomeGroup: '', description: '', date: new Date().toISOString().slice(0, 10) });
  const [toast, setToast] = useState(null);

  useEffect(() => { if (ready) load(); }, [ready]);

  async function load() {
    try { const { data } = await AdminAPI.finance(); setData(data); }
    catch (e) { showToastMsg(e.message, 'error'); }
  }

  function showToastMsg(msg, type = 'info') { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }

  async function submitExpense() {
    if (!form.title || !form.amount) return showToastMsg('Title and amount required', 'error');
    try {
      await AdminAPI.addExpense({ ...form, amount: parseFloat(form.amount) });
      showToastMsg(`✅ ${form.title} — ${formatINR(form.amount)} logged`, 'success');
      setShowModal(false);
      load();
    } catch (e) { showToastMsg(e.message, 'error'); }
  }

  async function approveExpense(id, status) {
    try { await AdminAPI.approveExpense(id, status); showToastMsg(`Expense marked ${status}`, 'success'); load(); }
    catch (e) { showToastMsg(e.message, 'error'); }
  }

  if (!ready) return <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"/></div>;

  const kpis = data ? [
    { val: formatINR(data.totalRaised), label: 'Total Raised', sub: 'All time' },
    { val: formatINR(data.totalExpenses), label: 'Total Expenses', sub: 'All paid' },
    { val: formatINR(data.netBalance), label: 'Net Balance', sub: '' },
    { val: data.programEfficiencyRatio + '%', label: 'Program Efficiency', sub: 'Goes to mission' },
    { val: data.overheadRatio + '%', label: 'Overhead Ratio', sub: 'Admin costs' },
    { val: data.fundraisingROI + 'x', label: 'Fundraising ROI', sub: 'Per ₹ invested' },
    { val: formatINR(data.costPerBeneficiary), label: 'Cost/Beneficiary', sub: 'Per student' },
    { val: data.donorRetentionRate + '%', label: 'Donor Retention', sub: `${data.recurringDonors}/${data.totalDonors} recurring` },
  ] : [];

  return (
    <div className="app-layout">
      <AdminSidebar user={user} />
      <div className="main-content">
        <header className="topbar">
          <div><h1>💰 Financial Health</h1><p>Fundraising ROI, program efficiency, and budget transparency</p></div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Log Expense</button>
        </header>

        <div className="page-content fade-in">
          {/* KPI grid */}
          <div className="kpi-grid" style={{ marginBottom: 20 }}>
            {kpis.map((k, i) => (
              <div key={i} className="kpi-card">
                <div className="kpi-value">{k.val}</div>
                <div className="kpi-label">{k.label}</div>
                {k.sub && <div className="kpi-sub">{k.sub}</div>}
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="chart-box">
              <div className="chart-title">📊 Expenses by Category</div>
              {data?.expensesByCategory?.length ? (() => {
                const max = Math.max(...data.expensesByCategory.map(c => c.total), 1);
                return data.expensesByCategory.map((c, i) => (
                  <div key={i} className="bar-row">
                    <span className="bar-label" style={{ fontSize: 11 }}>{c._id}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((c.total / max) * 100)}%`, background: CAT_COLORS[c._id] || '#6366f1' }}/></div>
                    <span className="bar-count" style={{ minWidth: 80, fontSize: 11 }}>{formatINR(c.total)}</span>
                  </div>
                ));
              })() : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No expenses logged yet</p>}
            </div>
            <div className="chart-box">
              <div className="chart-title">📈 Key Ratios</div>
              {data && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Program Efficiency', val: data.programEfficiencyRatio, color: '#22c55e', unit: '%' },
                    { label: 'Overhead Ratio', val: data.overheadRatio, color: '#ef4444', unit: '%' },
                    { label: 'Fundraising ROI', val: data.fundraisingROI, color: '#6366f1', unit: 'x' },
                    { label: 'Donor Retention', val: data.donorRetentionRate, color: '#f59e0b', unit: '%' },
                  ].map((r, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: r.color }}>{r.val}{r.unit}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expense table */}
          <div className="card-title" style={{ marginBottom: 12 }}>📋 Recent Expenses</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {!data ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}/></td></tr>
                  : data.recentExpenses?.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No expenses logged yet</td></tr>
                  : data.recentExpenses?.map(e => (
                  <tr key={e._id}>
                    <td>{e.title}</td>
                    <td><span style={{ fontSize: 11, color: CAT_COLORS[e.category] || '#6366f1' }}>{e.category}</span></td>
                    <td style={{ fontWeight: 600 }}>{formatINR(e.amount)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge ${e.status === 'Paid' ? 'badge-green' : e.status === 'Approved' ? 'badge-blue' : 'badge-orange'}`}>{e.status}</span></td>
                    <td>
                      {e.status === 'Pending' && <button className="btn btn-secondary btn-sm" onClick={() => approveExpense(e._id, 'Approved')}>Approve</button>}
                      {e.status === 'Approved' && <button className="btn btn-primary btn-sm" onClick={() => approveExpense(e._id, 'Paid')}>Mark Paid</button>}
                      {e.status === 'Paid' && <span style={{ color: '#22c55e', fontSize: 13 }}>✅</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Expense Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-title">💰 Log New Expense</div>
            {['title', 'amount', 'description'].map(field => (
              <div key={field} className="form-group">
                <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}{field === 'title' || field === 'amount' ? ' *' : ''}</label>
                <input className="form-control" type={field === 'amount' ? 'number' : 'text'}
                  placeholder={field === 'amount' ? '5000' : ''}
                  value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}/>
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {Object.keys(CAT_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-control" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={submitExpense}>Log Expense</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
