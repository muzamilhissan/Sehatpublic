'use client';

import React from 'react';
import Link from 'next/link';
import type { AuthRoleChoice } from '@/types';
import { DEMO_ACCOUNTS } from '@/lib/auth-context';

const ROLES: { id: AuthRoleChoice; label: string; hint: string }[] = [
  { id: 'PATIENT', label: 'Customer', hint: 'Book doctors & labs' },
  { id: 'DOCTOR', label: 'Doctor', hint: 'Manage practice' },
  { id: 'HOSPITAL_ADMIN', label: 'Hospital', hint: 'Manage facility' },
];

export function AuthRoleTabs({
  value,
  onChange,
}: {
  value: AuthRoleChoice;
  onChange: (role: AuthRoleChoice) => void;
}) {
  return (
    <div className="auth-role-tabs" role="tablist">
      {ROLES.map((r) => (
        <button
          key={r.id}
          type="button"
          role="tab"
          aria-selected={value === r.id}
          className={`auth-role-tab ${value === r.id ? 'active' : ''}`}
          onClick={() => onChange(r.id)}
        >
          <span className="auth-role-label">{r.label}</span>
          <span className="auth-role-hint">{r.hint}</span>
        </button>
      ))}
    </div>
  );
}

export function AuthDemoHint({
  role,
  onUseDemo,
}: {
  role: AuthRoleChoice;
  onUseDemo?: (phone: string) => void;
}) {
  const demo = DEMO_ACCOUNTS[role];
  return (
    <div className="auth-demo-hint">
      <div>
        <strong>Demo</strong>
        <span>
          {demo.phone} · OTP <strong>123456</strong>
        </span>
        <em>{demo.label}</em>
      </div>
      {onUseDemo && (
        <button type="button" className="auth-demo-fill" onClick={() => onUseDemo(demo.phone)}>
          Use demo
        </button>
      )}
    </div>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth-card">
      <div className="auth-card-brand">SEHAT<span>DOC</span></div>
      <h1 className="auth-card-title">{title}</h1>
      <p className="auth-card-subtitle">{subtitle}</p>
      {children}
      {footer && <div className="auth-card-footer">{footer}</div>}
    </div>
  );
}

export function AuthSwitchLink({ mode }: { mode: 'login' | 'signup' }) {
  if (mode === 'login') {
    return (
      <p className="auth-switch">
        New here? <Link href="/auth/signup">Create an account</Link>
      </p>
    );
  }
  return (
    <p className="auth-switch">
      Already registered? <Link href="/auth/login">Login</Link>
    </p>
  );
}

export function AuthField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
