'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, getInitials } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/compliance', icon: '🔒', label: 'DPDP Compliance' },
  { href: '/admin/students', icon: '👩‍🎓', label: 'Student Census' },
  { href: '/admin/staff', icon: '👥', label: 'Staff Management' },
  { href: '/admin/finance', icon: '💰', label: 'Finance' },
  { href: '/admin/media', icon: '📸', label: 'Media Oversight' },
];

export default function AdminSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = user ? getInitials(user.name) : 'AD';
  const roleLabel = { admin: 'Administrator', founder: 'Founder' }[user?.role] || 'Admin';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🌏</div>
        <div className="logo-text">
          <h2>BWF Portal</h2>
          <span className="staff-badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Staff info */}
      <div className="sidebar-staff">
        <div className="staff-card">
          <div className="staff-avatar" style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)' }}>
            {initials}
          </div>
          <div className="staff-info">
            <h4>{user?.name || 'Loading...'}</h4>
            <p>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={() => logout(router)}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
