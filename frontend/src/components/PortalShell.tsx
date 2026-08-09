'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { AuthRoleChoice } from '@/types';

type NavItem = { href: string; label: string };

type PortalShellProps = {
  requiredRole: AuthRoleChoice;
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
};

function isNavActive(pathname: string, href: string) {
  if (pathname === href) return true;
  // Exact dashboard roots only — avoid marking Dashboard active on nested routes
  if (href === '/portal/doctor' || href === '/portal/hospital') return false;
  return pathname.startsWith(`${href}/`);
}

export default function PortalShell({ requiredRole, title, nav, children }: PortalShellProps) {
  const { user, authReady, logout, homePath } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      const role = requiredRole === 'DOCTOR' ? 'DOCTOR' : 'HOSPITAL_ADMIN';
      router.replace(`/auth/login?role=${role}&next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.activeRole !== requiredRole) {
      const role = requiredRole === 'DOCTOR' ? 'DOCTOR' : 'HOSPITAL_ADMIN';
      router.replace(`/auth/login?role=${role}`);
    }
  }, [authReady, user, requiredRole, router, pathname]);

  if (!authReady || !user || user.activeRole !== requiredRole) {
    return (
      <div className="portal-loading">
        <div className="spinner" />
        <p>Loading portal…</p>
      </div>
    );
  }

  const roleLabel = requiredRole === 'DOCTOR' ? 'Doctor' : 'Hospital';

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <Link href={homePath} className="portal-brand">
          <span className="portal-brand-title">
            SEHAT<span>DOC</span>
          </span>
        </Link>
        <span className="portal-role-badge">{roleLabel} portal</span>
        <nav className="portal-nav" aria-label="Portal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`portal-nav-link ${isNavActive(pathname, item.href) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="portal-sidebar-footer">
          <p className="portal-user-name">{user.fullName}</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="portal-main">
        <header className="portal-topbar">
          <h1>{title}</h1>
        </header>
        <div className="portal-content">{children}</div>
      </main>
    </div>
  );
}

export function PortalStatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="portal-stat-card">
      <p className="portal-stat-label">{label}</p>
      <div className="portal-stat-value">{value}</div>
    </div>
  );
}

export function PortalQuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="portal-quick-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="portal-quick-arrow" aria-hidden>
        →
      </span>
    </Link>
  );
}
