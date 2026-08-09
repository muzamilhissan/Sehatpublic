'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import {
  AuthCard,
  AuthDemoHint,
  AuthField,
  AuthRoleTabs,
  AuthSwitchLink,
} from '@/components/AuthUI';
import { useAuth } from '@/lib/auth-context';
import type { AuthRoleChoice } from '@/types';

function parseRole(value: string | null): AuthRoleChoice {
  if (value === 'DOCTOR' || value === 'HOSPITAL_ADMIN' || value === 'PATIENT') return value;
  return 'PATIENT';
}

function nextAllowedForRole(next: string, activeRole: string) {
  if (next.startsWith('/portal/hospital')) return activeRole === 'HOSPITAL_ADMIN';
  if (next.startsWith('/portal/doctor')) return activeRole === 'DOCTOR';
  return true;
}

function LoginForm() {
  const { login, user, isAuthenticated, authReady, homePath } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = parseRole(searchParams.get('role'));
  const next = searchParams.get('next');

  const [role, setRole] = useState<AuthRoleChoice>(roleParam);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setRole(roleParam);
  }, [roleParam]);

  useEffect(() => {
    setPhone('');
    setOtpSent(false);
    setOtp('');
    setError('');
  }, [role]);

  // Already signed in → open that account's dashboard (never stay on login).
  useEffect(() => {
    if (!authReady || !isAuthenticated || !user) return;

    if (next?.startsWith('/') && nextAllowedForRole(next, user.activeRole)) {
      router.replace(next);
      return;
    }

    router.replace(homePath);
  }, [authReady, isAuthenticated, user, next, homePath, router]);

  const requestOtp = () => {
    setError('');
    if (!phone.trim()) {
      setError('Enter your mobile number');
      return;
    }
    setOtpSent(true);
  };

  const verify = () => {
    const result = login(phone, otp, role);
    if (!result.ok) {
      setError(result.message || 'Login failed');
      return;
    }
    if (next?.startsWith('/') && nextAllowedForRole(next, role)) {
      router.push(next);
    } else if (role === 'DOCTOR') {
      router.push('/portal/doctor');
    } else if (role === 'HOSPITAL_ADMIN') {
      router.push('/portal/hospital');
    } else {
      router.push('/account');
    }
  };

  if (!authReady || isAuthenticated) {
    return (
      <div className="auth-loading">
        {!authReady ? 'Loading…' : 'Opening your dashboard…'}
      </div>
    );
  }

  return (
    <AuthCard title="Login" subtitle="Sign in as a customer, doctor, or hospital admin.">
      <AuthRoleTabs
        value={role}
        onChange={(r) => {
          setRole(r);
          router.replace(`/auth/login?role=${r}${next ? `&next=${encodeURIComponent(next)}` : ''}`);
        }}
      />

      <AuthDemoHint
        role={role}
        onUseDemo={(demoPhone) => {
          setPhone(demoPhone);
          setOtpSent(false);
          setOtp('');
          setError('');
        }}
      />

      {!otpSent ? (
        <div className="auth-form">
          <AuthField label="Mobile number">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XXXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
            />
          </AuthField>
          {error && <p className="auth-error">{error}</p>}
          <button type="button" className="btn btn-primary btn-block" onClick={requestOtp}>
            Request OTP
          </button>
        </div>
      ) : (
        <div className="auth-form">
          <p className="auth-otp-sent">
            OTP sent to <strong>{phone}</strong>
          </p>
          <AuthField label="Enter OTP">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </AuthField>
          {error && <p className="auth-error">{error}</p>}
          <button type="button" className="btn btn-primary btn-block" onClick={verify}>
            Verify &amp; Login
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={() => setOtpSent(false)}>
            Change number
          </button>
        </div>
      )}

      <AuthSwitchLink mode="login" />
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <AppShell>
      <div className="auth-page">
        <div className="auth-page-inner">
          <Suspense fallback={<div className="auth-loading">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
