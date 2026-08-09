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
import { CITIES, getMainSpecialties } from '@/data';
import type { AuthRoleChoice } from '@/types';

function SignupForm() {
  const { signup, isAuthenticated, authReady, homePath } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') as AuthRoleChoice | null;

  const [role, setRole] = useState<AuthRoleChoice>(
    roleParam === 'DOCTOR' || roleParam === 'HOSPITAL_ADMIN' || roleParam === 'PATIENT'
      ? roleParam
      : 'PATIENT',
  );
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [pmcNumber, setPmcNumber] = useState('');
  const [specialtySlug, setSpecialtySlug] = useState('general-physician');
  const [citySlug, setCitySlug] = useState('lahore');
  const [consultationFee, setConsultationFee] = useState('2000');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState('HOSPITAL');

  const specialties = getMainSpecialties();

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    router.replace(homePath);
  }, [authReady, isAuthenticated, homePath, router]);

  useEffect(() => {
    setOtpSent(false);
    setOtp('');
    setError('');
  }, [role]);

  const submit = () => {
    const result = signup({
      phone,
      otp,
      fullName,
      role,
      extra:
        role === 'DOCTOR'
          ? { pmcNumber, specialtySlug, citySlug, consultationFee }
          : role === 'HOSPITAL_ADMIN'
            ? { hospitalName: hospitalName || `${fullName} Hospital`, citySlug, type: hospitalType }
            : undefined,
    });
    if (!result.ok) {
      setError(result.message ?? 'Signup failed');
      return;
    }
    router.push(result.redirect || '/');
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Register as a customer, doctor, or hospital."
      footer={<AuthSwitchLink mode="signup" />}
    >
      <AuthRoleTabs
        value={role}
        onChange={(r) => {
          setRole(r);
          router.replace(`/auth/signup?role=${r}`);
        }}
      />
      <AuthDemoHint role={role} />

      <div className="auth-form">
        <AuthField label={role === 'HOSPITAL_ADMIN' ? 'Admin full name' : 'Full name'}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
        </AuthField>
        <AuthField label="Mobile number">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XXXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
          />
        </AuthField>

        {role === 'DOCTOR' && (
          <>
            <AuthField label="PMC number">
              <input value={pmcNumber} onChange={(e) => setPmcNumber(e.target.value)} />
            </AuthField>
            <AuthField label="Primary specialty">
              <select value={specialtySlug} onChange={(e) => setSpecialtySlug(e.target.value)}>
                {specialties.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </AuthField>
            <div className="auth-field-row">
              <AuthField label="City">
                <select value={citySlug} onChange={(e) => setCitySlug(e.target.value)}>
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </AuthField>
              <AuthField label="Consultation fee (PKR)">
                <input
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  inputMode="numeric"
                />
              </AuthField>
            </div>
          </>
        )}

        {role === 'HOSPITAL_ADMIN' && (
          <>
            <AuthField label="Hospital name">
              <input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
            </AuthField>
            <div className="auth-field-row">
              <AuthField label="Type">
                <select value={hospitalType} onChange={(e) => setHospitalType(e.target.value)}>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="MEDICAL_CENTER">Medical center</option>
                </select>
              </AuthField>
              <AuthField label="City">
                <select value={citySlug} onChange={(e) => setCitySlug(e.target.value)}>
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </AuthField>
            </div>
          </>
        )}

        {otpSent && (
          <>
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
          </>
        )}

        {error && <p className="auth-error">{error}</p>}

        {!otpSent ? (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              if (!fullName.trim() || !phone.trim()) {
                setError('Name and phone are required');
                return;
              }
              setError('');
              setOtpSent(true);
            }}
          >
            Request OTP
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-primary btn-block" onClick={submit}>
              Verify &amp; create account
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setOtpSent(false)}>
              Change details
            </button>
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default function SignupPage() {
  return (
    <AppShell>
      <div className="auth-page">
        <div className="auth-page-inner auth-page-wide">
          <Suspense fallback={<div className="auth-loading">Loading…</div>}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
