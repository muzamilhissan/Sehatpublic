'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/account';
  const [phone, setPhone] = useState('03001234567');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) router.replace(next);
  }, [isAuthenticated, next, router]);

  const requestOtp = () => {
    setError('');
    setOtpSent(true);
  };

  const verify = () => {
    const result = login(phone, otp);
    if (!result.ok) {
      setError(result.message ?? 'Login failed');
      return;
    }
    router.push(next);
  };

  return (
    <div className="detail-panel form-grid" style={{ maxWidth: 480, margin: '0 auto' }}>
      <p className="entity-card-muted">Demo OTP is always <strong>123456</strong>. Creates a mock patient session.</p>
      <div className="form-field">
        <label>Mobile number</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XXXXXXXXX" />
      </div>
      {!otpSent ? (
        <button type="button" className="btn btn-primary" onClick={requestOtp}>Request OTP</button>
      ) : (
        <>
          <div className="form-field">
            <label>OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
          </div>
          <button type="button" className="btn btn-primary" onClick={verify}>Verify & login</button>
        </>
      )}
      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      <Link href="/" className="btn btn-outline">Back home</Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Login' }]} />
          <PageHeader title="Login with OTP" subtitle="Mirrors POST /auth/request-otp and /auth/verify-otp." />
          <Suspense fallback={<p>Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </AppShell>
  );
}
