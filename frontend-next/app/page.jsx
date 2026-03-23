'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthAPI, TokenManager } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = TokenManager.get();
    const user = TokenManager.getUser();
    if (token && user) {
      const dest = user.role === 'student' ? '/dashboard'
        : user.role === 'housemother' ? '/housemother/dashboard'
        : user.role === 'dean' ? '/dean/dashboard'
        : ['admin', 'founder'].includes(user.role) ? '/admin/dashboard'
        : '/';
      if (dest !== '/') router.replace(dest);
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await AuthAPI.login(email, password);
      TokenManager.set(data.token);
      TokenManager.setUser(data.user);
      const role = data.user.role;
      const dest = role === 'student' ? '/dashboard'
        : role === 'housemother' ? '/housemother/dashboard'
        : role === 'dean' ? '/dean/dashboard'
        : ['admin', 'founder'].includes(role) ? '/admin/dashboard'
        : '/';
      router.push(dest);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(e, p) { setEmail(e); setPassword(p); }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌍</div>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)' }}>BWF Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Borderless World Foundation</p>
        </div>

        {/* Card */}
        <div className="card" style={{ borderRadius: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" className="form-control" required
                placeholder="your.email@bwf.org"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-control" required
                placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In ✨'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>🧪 Demo Accounts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                ['aisha@bwf.org', 'student123', '👩‍🎓 Aisha (Student)'],
                ['housemother@bwf.org', 'house123', '🏠 Sister Zara (Housemother)'],
                ['dean@bwf.org', 'dean123', '👩‍🏫 Dr. Fatima (Dean)'],
                ['admin@bwf.org', 'admin123', '🔐 Admin'],
              ].map(([e, p, label]) => (
                <button key={e} onClick={() => fillDemo(e, p)} type="button"
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
