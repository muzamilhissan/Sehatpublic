'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, PageHeader } from '@/components/ui';
import { CITIES, getMainSpecialties } from '@/data';

export default function DoctorRegisterPage() {
  const specialties = getMainSpecialties();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    pmcNumber: '',
    specialtySlug: specialties[0]?.slug ?? '',
    citySlug: 'lahore',
    yearsExperience: '5',
    consultationFee: '2000',
    bio: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (submitted) {
    return (
      <AppShell>
        <section className="page-section">
          <div className="container" style={{ maxWidth: 640 }}>
            <div className="detail-panel">
              <h2>Application received</h2>
              <p className="entity-card-muted" style={{ margin: '12px 0' }}>
                Mock doctor registration saved locally. In production this maps to POST /doctors/register with verificationStatus PENDING.
              </p>
              <p><strong>Name:</strong> Dr. {form.fullName}</p>
              <p><strong>PMC:</strong> {form.pmcNumber}</p>
              <p><strong>Specialty:</strong> {form.specialtySlug}</p>
              <div className="form-actions">
                <Link href="/" className="btn btn-primary">Home</Link>
              </div>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section">
        <div className="container" style={{ maxWidth: 720 }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Join as Doctor' }]} />
          <PageHeader title="Join SehatDoc as a Doctor" subtitle="Multi-step onboarding mirroring doctor registration fields." />
          <div className="stepper">
            {['Profile', 'Practice', 'Review'].map((label, i) => (
              <div key={label} className={`stepper-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                {i + 1}. {label}
              </div>
            ))}
          </div>
          <div className="detail-panel form-grid">
            {step === 0 && (
              <>
                <div className="form-field">
                  <label>Full name</label>
                  <input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>PMC number</label>
                  <input value={form.pmcNumber} onChange={(e) => update('pmcNumber', e.target.value)} />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="form-field">
                  <label>Primary specialty</label>
                  <select value={form.specialtySlug} onChange={(e) => update('specialtySlug', e.target.value)}>
                    {specialties.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>City</label>
                  <select value={form.citySlug} onChange={(e) => update('citySlug', e.target.value)}>
                    {CITIES.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Years experience</label>
                  <input value={form.yearsExperience} onChange={(e) => update('yearsExperience', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Consultation fee (PKR)</label>
                  <input value={form.consultationFee} onChange={(e) => update('consultationFee', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Bio</label>
                  <textarea rows={4} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p><strong>Name:</strong> {form.fullName}</p>
                <p><strong>Phone:</strong> {form.phone}</p>
                <p><strong>PMC:</strong> {form.pmcNumber}</p>
                <p><strong>Specialty:</strong> {form.specialtySlug}</p>
                <p><strong>City:</strong> {form.citySlug}</p>
                <p><strong>Fee:</strong> PKR {form.consultationFee}</p>
                <p className="entity-card-muted">{form.bio}</p>
              </>
            )}
            <div className="form-actions">
              {step > 0 && <button type="button" className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>Back</button>}
              {step < 2 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (step === 0 && (!form.fullName || !form.phone || !form.pmcNumber)) return;
                    setStep((s) => s + 1);
                  }}
                >
                  Continue
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => setSubmitted(true)}>Submit application</button>
              )}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
