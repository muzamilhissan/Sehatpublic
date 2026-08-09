'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DoctorPortalLayout from '@/components/DoctorPortalLayout';
import { useAuth } from '@/lib/auth-context';
import { getDoctorProfile, saveDoctorProfile } from '@/lib/doctor-portal-store';
import { CITIES } from '@/data/cities';
import { SPECIALTIES, getSpecialtyBySlug } from '@/data/specialties';
import type { Doctor } from '@/types';

type ProfileTab = 'identity' | 'practice' | 'fees';

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [message, setMessage] = useState('');
  const [specialtySlug, setSpecialtySlug] = useState('');
  const [tab, setTab] = useState<ProfileTab>('identity');
  const [specQuery, setSpecQuery] = useState('');

  useEffect(() => {
    if (!user?.doctorId) return;
    const d = getDoctorProfile(user.doctorId);
    setDoctor(d);
    setSpecialtySlug(
      d?.specialties.find((s) => s.isPrimary)?.specialty.slug ?? d?.specialties[0]?.specialty.slug ?? '',
    );
  }, [user?.doctorId]);

  const completeness = useMemo(() => {
    if (!doctor) return 0;
    const checks = [
      !!doctor.user.fullName.trim(),
      !!doctor.pmcNumber,
      !!doctor.bio && doctor.bio.length > 40,
      doctor.yearsExperience > 0,
      Number(doctor.consultationFee) > 0,
      !!doctor.cityId,
      !!specialtySlug,
      doctor.clinics.length > 0,
      (doctor.availabilities?.length ?? 0) > 0,
      (doctor.languages?.length ?? 0) > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [doctor, specialtySlug]);

  const filteredSpecs = useMemo(() => {
    const q = specQuery.trim().toLowerCase();
    const list = SPECIALTIES.slice(0, 48);
    if (!q) return list;
    return list.filter((s) => s.name.toLowerCase().includes(q) || s.slug.includes(q));
  }, [specQuery]);

  const save = () => {
    if (!doctor) return;
    const city = CITIES.find((c) => c.id === doctor.cityId) ?? doctor.city;
    const specialty = getSpecialtyBySlug(specialtySlug);
    const next: Doctor = {
      ...doctor,
      city: city ?? doctor.city,
      cityId: city?.id ?? doctor.cityId,
      specialties: specialty
        ? [
            {
              id: doctor.specialties[0]?.id ?? `${doctor.id}-spec`,
              doctorId: doctor.id,
              specialtyId: specialty.id,
              isPrimary: true,
              specialty,
            },
          ]
        : doctor.specialties,
    };
    saveDoctorProfile(next);
    setDoctor(next);
    setMessage('Profile published to marketplace preview.');
    setTimeout(() => setMessage(''), 2800);
  };

  if (!doctor) {
    return (
      <DoctorPortalLayout title="Profile">
        <p className="entity-card-muted">Loading…</p>
      </DoctorPortalLayout>
    );
  }

  const primarySpec =
    getSpecialtyBySlug(specialtySlug)?.name ??
    doctor.specialties.find((s) => s.isPrimary)?.specialty.name ??
    'Specialist';

  const ringStyle = {
    background: `conic-gradient(var(--primary-navy) ${completeness * 3.6}deg, #e2e8f0 0deg)`,
  } as React.CSSProperties;

  return (
    <DoctorPortalLayout title="Profile">
      <div className="prof-page">
        {/* Hero */}
        <section className="prof-hero">
          <div className="prof-hero-main">
            <div className="prof-avatar" aria-hidden>
              {doctor.user.fullName.charAt(0)}
            </div>
            <div className="prof-hero-copy">
              <div className="prof-hero-badges">
                <span className={`prof-badge ${doctor.verificationStatus === 'APPROVED' ? 'ok' : 'warn'}`}>
                  {doctor.verificationStatus}
                </span>
                <span className={`prof-badge ${doctor.isAcceptingPatients ? 'ok' : 'muted'}`}>
                  {doctor.isAcceptingPatients ? 'Accepting patients' : 'Not accepting'}
                </span>
              </div>
              <h2 className="prof-hero-name">
                {doctor.title}. {doctor.user.fullName}
              </h2>
              <p className="prof-hero-meta">
                {primarySpec} · {doctor.yearsExperience} yrs · {doctor.city?.name ?? 'Pakistan'}
              </p>
              <p className="prof-hero-bio">{doctor.bio || 'Add a short bio so patients know how you help.'}</p>
            </div>
          </div>

          <div className="prof-hero-side">
            <div className="prof-ring-wrap" title="Profile completeness">
              <div className="prof-ring" style={ringStyle}>
                <div className="prof-ring-inner">
                  <strong>{completeness}%</strong>
                  <span>complete</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className={`prof-toggle ${doctor.isAcceptingPatients ? 'on' : ''}`}
              onClick={() => setDoctor({ ...doctor, isAcceptingPatients: !doctor.isAcceptingPatients })}
            >
              <span className="prof-toggle-knob" />
              <span>{doctor.isAcceptingPatients ? 'Open for bookings' : 'Paused bookings'}</span>
            </button>
            <button type="button" className="btn btn-primary" onClick={save}>
              Save profile
            </button>
            {message && <p className="prof-toast">{message}</p>}
          </div>
        </section>

        <div className="prof-layout">
          <div className="prof-editor">
            <div className="prof-tabs" role="tablist">
              {(
                [
                  { id: 'identity', label: 'Identity', hint: 'Name & PMC' },
                  { id: 'practice', label: 'Practice', hint: 'Specialty & city' },
                  { id: 'fees', label: 'Fees', hint: 'Pricing' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  className={`prof-tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <strong>{t.label}</strong>
                  <span>{t.hint}</span>
                </button>
              ))}
            </div>

            {tab === 'identity' && (
              <div className="prof-panel">
                <div className="prof-fields">
                  <div className="form-field">
                    <label>Title</label>
                    <div className="prof-chip-row">
                      {['Dr', 'Prof', 'Assoc Prof'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`prof-chip ${doctor.title === t ? 'active' : ''}`}
                          onClick={() => setDoctor({ ...doctor, title: t })}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Full name</label>
                    <input
                      value={doctor.user.fullName}
                      onChange={(e) =>
                        setDoctor({ ...doctor, user: { ...doctor.user, fullName: e.target.value } })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label>PMC number</label>
                    <input
                      value={doctor.pmcNumber ?? ''}
                      onChange={(e) => setDoctor({ ...doctor, pmcNumber: e.target.value || null })}
                      placeholder="PMC-xxxxx"
                    />
                  </div>
                  <div className="form-field prof-field-full">
                    <label>Bio</label>
                    <textarea
                      rows={5}
                      value={doctor.bio ?? ''}
                      onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
                      placeholder="Tell patients about your expertise…"
                    />
                    <div className="prof-char-count">{(doctor.bio ?? '').length} chars</div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'practice' && (
              <div className="prof-panel">
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label>Years of experience</label>
                  <div className="prof-slider-row">
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={doctor.yearsExperience}
                      onChange={(e) =>
                        setDoctor({ ...doctor, yearsExperience: Number(e.target.value) })
                      }
                    />
                    <strong>{doctor.yearsExperience} yrs</strong>
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label>City</label>
                  <div className="prof-chip-row">
                    {CITIES.slice(0, 8).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`prof-chip ${doctor.cityId === c.id ? 'active' : ''}`}
                        onClick={() => setDoctor({ ...doctor, cityId: c.id, city: c })}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label>Primary specialty</label>
                  <input
                    value={specQuery}
                    onChange={(e) => setSpecQuery(e.target.value)}
                    placeholder="Search specialties…"
                    style={{ marginBottom: 12 }}
                  />
                  <div className="prof-spec-grid">
                    {filteredSpecs.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`prof-spec-card ${specialtySlug === s.slug ? 'active' : ''}`}
                        onClick={() => setSpecialtySlug(s.slug)}
                      >
                        <span className="prof-spec-letter">{s.name.charAt(0)}</span>
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'fees' && (
              <div className="prof-panel">
                <div className="prof-fee-cards">
                  <div className="prof-fee-card">
                    <span className="prof-fee-label">Consultation</span>
                    <div className="prof-fee-value">
                      <span>PKR</span>
                      <input
                        value={doctor.consultationFee}
                        onChange={(e) => setDoctor({ ...doctor, consultationFee: e.target.value })}
                      />
                    </div>
                    <div className="prof-chip-row">
                      {['1500', '2000', '2500', '3000', '4000'].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          className={`prof-chip ${doctor.consultationFee === fee ? 'active' : ''}`}
                          onClick={() => setDoctor({ ...doctor, consultationFee: fee })}
                        >
                          {fee}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="prof-fee-card">
                    <span className="prof-fee-label">Follow-up</span>
                    <div className="prof-fee-value">
                      <span>PKR</span>
                      <input
                        value={doctor.followupFee ?? ''}
                        onChange={(e) =>
                          setDoctor({ ...doctor, followupFee: e.target.value || null })
                        }
                        placeholder="Optional"
                      />
                    </div>
                    <div className="prof-chip-row">
                      {['1000', '1500', '2000'].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          className={`prof-chip ${doctor.followupFee === fee ? 'active' : ''}`}
                          onClick={() => setDoctor({ ...doctor, followupFee: fee })}
                        >
                          {fee}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="prof-quick-links">
                  <Link href="/portal/doctor/clinics" className="prof-quick-link">
                    Manage clinics →
                  </Link>
                  <Link href="/portal/doctor/availability" className="prof-quick-link">
                    Set weekly calendar →
                  </Link>
                  <Link href="/portal/doctor/credentials" className="prof-quick-link">
                    Education & languages →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Live patient preview */}
          <aside className="prof-preview">
            <div className="prof-preview-label">Patient preview</div>
            <article className="prof-preview-card">
              <div className="prof-preview-top">
                <div className="prof-preview-avatar">{doctor.user.fullName.charAt(0)}</div>
                <div>
                  <h3>
                    {doctor.title}. {doctor.user.fullName}
                  </h3>
                  <p>{primarySpec}</p>
                </div>
              </div>
              <div className="prof-preview-stats">
                <div>
                  <strong>★ {Number(doctor.avgRating).toFixed(1)}</strong>
                  <span>{doctor.reviewCount} reviews</span>
                </div>
                <div>
                  <strong>{doctor.yearsExperience} yrs</strong>
                  <span>experience</span>
                </div>
                <div>
                  <strong>PKR {Number(doctor.consultationFee || 0).toLocaleString()}</strong>
                  <span>fee</span>
                </div>
              </div>
              <p className="prof-preview-bio">
                {doctor.bio || 'Your bio will appear here for patients.'}
              </p>
              <div className="chip-row">
                {doctor.pmcNumber && <span className="chip">PMC {doctor.pmcNumber}</span>}
                <span className="chip">{doctor.city?.name}</span>
                <span className="chip">{doctor.verificationStatus}</span>
              </div>
              <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled>
                Book Appointment
              </button>
            </article>
          </aside>
        </div>
      </div>
    </DoctorPortalLayout>
  );
}
