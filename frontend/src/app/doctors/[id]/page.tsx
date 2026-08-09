'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { getDoctorById } from '@/data';

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const doctor = getDoctorById(params.id).data;

  if (!doctor) {
    return (
      <AppShell>
        <section className="page-section">
          <div className="container">
            <EmptyState title="Doctor not found" actionHref="/doctors" actionLabel="Back to doctors" />
          </div>
        </section>
      </AppShell>
    );
  }

  const primary = doctor.specialties.find((s) => s.isPrimary)?.specialty ?? doctor.specialties[0]?.specialty;

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Doctors', href: '/doctors' },
              { label: doctor.user.fullName },
            ]}
          />
          <div className="detail-layout">
            <div className="detail-panel">
              <PageHeader
                title={`${doctor.title}. ${doctor.user.fullName}`}
                subtitle={`${primary?.name ?? 'Specialist'} · ${doctor.yearsExperience} years experience · ${doctor.city?.name}`}
              />
              <div className="chip-row" style={{ marginBottom: 16 }}>
                <span className="chip">PMC {doctor.pmcNumber}</span>
                <span className="chip">★ {Number(doctor.avgRating).toFixed(1)} ({doctor.reviewCount} reviews)</span>
                <span className="chip">{doctor.completedConsults.toLocaleString()} consults</span>
                <span className="chip">{doctor.verificationStatus}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{doctor.bio}</p>

              <div className="detail-section">
                <h3>Specialties</h3>
                <div className="chip-row">
                  {doctor.specialties.map((s) => (
                    <Link key={s.id} href={`/doctors?specialty=${s.specialty.slug}`} className="chip">
                      {s.specialty.name}{s.isPrimary ? ' (Primary)' : ''}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Clinics</h3>
                {doctor.clinics.map((c) => (
                  <div key={c.id} style={{ marginBottom: 12 }}>
                    <strong>{c.name}</strong>
                    <p className="entity-card-muted">{c.address}</p>
                    {c.fee && <p className="entity-card-muted">Clinic fee: {doctor.currency} {Number(c.fee).toLocaleString()}</p>}
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h3>Education</h3>
                <ul>
                  {doctor.educations?.map((e) => (
                    <li key={e.id} className="entity-card-muted">
                      {e.degree} — {e.institute} ({e.yearFrom}–{e.yearTo})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h3>Experience</h3>
                <ul>
                  {doctor.experiences?.map((e) => (
                    <li key={e.id} className="entity-card-muted">
                      {e.roleTitle} at {e.organization}{e.isCurrent ? ' (Current)' : ''}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h3>Languages</h3>
                <div className="chip-row">
                  {doctor.languages?.map((l) => (
                    <span key={l.id} className="chip">{l.language}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Weekly availability</h3>
                <ul>
                  {doctor.availabilities?.map((a) => (
                    <li key={a.id} className="entity-card-muted">
                      Day {a.dayOfWeek}: {a.startTime}–{a.endTime} · {a.mode} · {a.slotMinutes} min slots
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="side-panel">
              <p className="entity-card-muted">Consultation fee</p>
              <h2 style={{ margin: '4px 0 16px' }}>
                {doctor.currency} {Number(doctor.consultationFee).toLocaleString()}
              </h2>
              {doctor.followupFee && (
                <p className="entity-card-muted" style={{ marginBottom: 16 }}>
                  Follow-up: {doctor.currency} {Number(doctor.followupFee).toLocaleString()}
                </p>
              )}
              <p className="entity-card-muted" style={{ marginBottom: 16 }}>
                Free cancellation up to {doctor.freeCancelHours} hours before slot.
              </p>
              <Link href={`/book/${doctor.id}`} className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }}>
                Book Appointment
              </Link>
              <Link href={`/book/${doctor.id}?mode=ONLINE`} className="btn btn-outline" style={{ width: '100%' }}>
                Consult Online
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
