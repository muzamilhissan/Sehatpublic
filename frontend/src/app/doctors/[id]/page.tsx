'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState } from '@/components/ui';
import { getDoctorById } from '@/data';
import { DAY_LABELS } from '@/lib/doctor-portal-store';

const WEEK_DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat

function modeLabel(mode: string) {
  if (mode === 'ONLINE') return 'Online';
  if (mode === 'CLINIC') return 'In clinic';
  return 'Clinic & online';
}

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const doctor = getDoctorById(params.id).data;
  const [activeSection, setActiveSection] = useState<'about' | 'schedule' | 'clinics'>('about');

  const byDay = useMemo(() => {
    const map = new Map<number, NonNullable<typeof doctor>['availabilities']>();
    if (!doctor?.availabilities) return map;
    for (const a of doctor.availabilities.filter((w) => w.isActive)) {
      const list = map.get(a.dayOfWeek) ?? [];
      list.push(a);
      map.set(a.dayOfWeek, list);
    }
    return map;
  }, [doctor]);

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
  const initial = doctor.user.fullName.charAt(0).toUpperCase();
  const accepting = doctor.isAcceptingPatients;

  return (
    <AppShell>
      <div className="dp-page">
        <div className="dp-hero">
          <div className="container">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Doctors', href: '/doctors' },
                { label: doctor.user.fullName },
              ]}
            />

            <div className="dp-hero-grid">
              <div className="dp-hero-identity">
                <div className="dp-avatar" aria-hidden>
                  {initial}
                </div>
                <div>
                  <div className="dp-hero-tags">
                    <span className={`dp-tag ${doctor.verificationStatus === 'APPROVED' ? 'ok' : ''}`}>
                      {doctor.verificationStatus === 'APPROVED' ? 'Verified' : doctor.verificationStatus}
                    </span>
                    <span className={`dp-tag ${accepting ? 'ok' : 'muted'}`}>
                      {accepting ? 'Accepting patients' : 'Not accepting'}
                    </span>
                    <span className="dp-tag">PMC {doctor.pmcNumber}</span>
                  </div>
                  <h1 className="dp-name">
                    {doctor.title}. {doctor.user.fullName}
                  </h1>
                  <p className="dp-meta">
                    {primary?.name ?? 'Specialist'}
                    <span aria-hidden>·</span>
                    {doctor.yearsExperience} yrs experience
                    <span aria-hidden>·</span>
                    {doctor.city?.name}
                  </p>
                  <p className="dp-bio">{doctor.bio}</p>
                  <div className="dp-stats">
                    <div>
                      <strong>★ {Number(doctor.avgRating).toFixed(1)}</strong>
                      <span>{doctor.reviewCount} reviews</span>
                    </div>
                    <div>
                      <strong>{doctor.completedConsults.toLocaleString()}</strong>
                      <span>consults</span>
                    </div>
                    <div>
                      <strong>{doctor.languages?.length ?? 0}</strong>
                      <span>languages</span>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="dp-book">
                <p className="dp-book-label">Consultation fee</p>
                <p className="dp-book-fee">
                  <span>{doctor.currency}</span> {Number(doctor.consultationFee).toLocaleString()}
                </p>
                {doctor.followupFee != null && (
                  <p className="dp-book-follow">
                    Follow-up {doctor.currency} {Number(doctor.followupFee).toLocaleString()}
                  </p>
                )}
                <p className="dp-book-note">
                  Free cancellation up to {doctor.freeCancelHours} hours before your slot.
                </p>
                <Link href={`/book/${doctor.id}`} className="btn btn-primary btn-block">
                  Book appointment
                </Link>
                <Link href={`/book/${doctor.id}?mode=ONLINE`} className="btn btn-outline btn-block">
                  Consult online
                </Link>
              </aside>
            </div>
          </div>
        </div>

        <div className="container dp-body">
          <div className="dp-tabs" role="tablist">
            {(
              [
                { id: 'about' as const, label: 'About' },
                { id: 'schedule' as const, label: 'Schedule' },
                { id: 'clinics' as const, label: 'Clinics' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeSection === t.id}
                className={`dp-tab ${activeSection === t.id ? 'active' : ''}`}
                onClick={() => setActiveSection(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeSection === 'about' && (
            <div className="dp-panels animate-in">
              <section className="dp-section">
                <h2>Specialties</h2>
                <div className="dp-chip-row">
                  {doctor.specialties.map((s) => (
                    <Link
                      key={s.id}
                      href={`/doctors?specialty=${s.specialty.slug}`}
                      className={`dp-chip ${s.isPrimary ? 'primary' : ''}`}
                    >
                      {s.specialty.name}
                      {s.isPrimary ? ' · Primary' : ''}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="dp-section">
                <h2>Languages</h2>
                <div className="dp-chip-row">
                  {doctor.languages?.map((l) => (
                    <span key={l.id} className="dp-chip">
                      {l.language}
                    </span>
                  ))}
                </div>
              </section>

              <div className="dp-split">
                <section className="dp-section">
                  <h2>Education</h2>
                  <ol className="dp-timeline">
                    {doctor.educations?.map((e) => (
                      <li key={e.id}>
                        <strong>{e.degree}</strong>
                        <span>{e.institute}</span>
                        <em>
                          {e.yearFrom}–{e.yearTo}
                        </em>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="dp-section">
                  <h2>Experience</h2>
                  <ol className="dp-timeline">
                    {doctor.experiences?.map((e) => (
                      <li key={e.id}>
                        <strong>{e.roleTitle}</strong>
                        <span>
                          {e.organization}
                          {e.isCurrent ? ' · Current' : ''}
                        </span>
                        {e.description && <em>{e.description}</em>}
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="dp-panels animate-in">
              <section className="dp-section">
                <h2>Weekly availability</h2>
                <p className="dp-section-lead">Active windows patients can book from.</p>
                <div className="dp-week">
                  {WEEK_DAYS.map((day) => {
                    const windows = byDay.get(day) ?? [];
                    return (
                      <div key={day} className={`dp-day ${windows.length ? 'has' : ''}`}>
                        <div className="dp-day-name">{DAY_LABELS[day]}</div>
                        {windows.length === 0 ? (
                          <p className="dp-day-empty">Off</p>
                        ) : (
                          windows.map((a) => (
                            <div key={a.id} className={`dp-window mode-${a.mode.toLowerCase()}`}>
                              <strong>
                                {a.startTime}–{a.endTime}
                              </strong>
                              <span>{modeLabel(a.mode)}</span>
                              <span>{a.slotMinutes} min</span>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeSection === 'clinics' && (
            <div className="dp-panels animate-in">
              <section className="dp-section">
                <h2>Clinic locations</h2>
                <div className="dp-clinic-list">
                  {doctor.clinics.map((c) => (
                    <article key={c.id} className="dp-clinic">
                      <h3>{c.name}</h3>
                      <p>{c.address}</p>
                      {c.fee != null && (
                        <p className="dp-clinic-fee">
                          Clinic fee {doctor.currency} {Number(c.fee).toLocaleString()}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
