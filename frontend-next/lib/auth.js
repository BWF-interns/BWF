/* Auth hook — requires admin/founder role, redirects to / otherwise */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from './api';

export function useAdmin() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = TokenManager.get();
    const u = TokenManager.getUser();
    if (!token || !u) { router.replace('/'); return; }
    if (!['admin', 'founder'].includes(u.role)) { router.replace('/'); return; }
    setUser(u);
    setReady(true);
  }, [router]);

  return { user, ready };
}

export function logout(router) {
  TokenManager.clearAll();
  router.replace('/');
}

export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
