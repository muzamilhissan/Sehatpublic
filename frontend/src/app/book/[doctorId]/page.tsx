'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, SlotPicker } from '@/components/ui';
import { createMockAppointment, getDoctorById, getDoctorSlots, getPatientMe } from '@/data';
import { useAuth } from '@/lib/auth-context';
import type { AppointmentMode } from '@/types';

const STEPS = [
  { id: 'mode', label: 'Mode', hint: 'How you meet' },
  { id: 'schedule', label: 'Schedule', hint: 'Pick a slot' },
  { id: 'patient', label: 'Patient', hint: 'Who is visiting' },
  { id: 'confirm', label: 'Confirm', hint: 'Review & book' },
] as const;

function nextDays(count: number) {
  const days: { value: string; label: string; sub: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    days.push({
      value,
      label: d.toLocaleDateString('en-PK', { weekday: 'short' }),
      sub: d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
    });
  }
  return days;
}

function BookContent() {
  const params = useParams<{ doctorId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const doctor = getDoctorById(params.doctorId).data;
  const patient = getPatientMe().data;

  const initialMode = (searchParams.get('mode') as AppointmentMode | null) ?? 'IN_PERSON';
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<AppointmentMode>(
    initialMode === 'ONLINE' ? 'ONLINE' : 'IN_PERSON',
  );
  const [clinicId, setClinicId] = useState(doctor?.clinics[0]?.id ?? '');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [slot, setSlot] = useState<string | null>(null);
  const [dependentId, setDependentId] = useState('');
  const [error, setError] = useState('');

  const dateChoices = useMemo(() => nextDays(7), []);
  const slots = useMemo(
    () => (doctor ? getDoctorSlots(doctor.id, date, mode).data : []),
    [doctor, date, mode],
  );

  if (!doctor) {
    return <EmptyState title="Doctor not found" actionHref="/doctors" actionLabel="Browse doctors" />;
  }

  const canOnline = doctor.availabilities?.some((a) => a.mode === 'ONLINE' || a.mode === 'BOTH');
  const canClinic = doctor.availabilities?.some((a) => a.mode === 'CLINIC' || a.mode === 'BOTH');
  const clinic = doctor.clinics.find((c) => c.id === clinicId);
  const patientName = dependentId
    ? patient.dependents.find((d) => d.id === dependentId)?.fullName
    : patient.user.fullName;
  const initial = doctor.user.fullName.charAt(0).toUpperCase();

  const goNext = () => {
    setError('');
    if (step === 0) {
      if (mode === 'IN_PERSON' && !clinicId) {
        setError('Select a clinic for in-person visit.');
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!slot) {
        setError('Pick an available slot.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!isAuthenticated) {
        router.push(`/auth/login?next=${encodeURIComponent(`/book/${doctor.id}?mode=${mode}`)}`);
        return;
      }
      setStep(3);
    }
  };

  const submit = () => {
    if (!slot) return;
    const appointment = createMockAppointment({
      doctorId: doctor.id,
      mode,
      scheduledStart: slot,
      clinicId: mode === 'IN_PERSON' ? clinicId : null,
      dependentId: dependentId || null,
    });
    router.push(`/book/confirmation/${appointment.id}`);
  };

  return (
    <div className="bk-page">
      <div className="bk-hero">
        <div className="container bk-hero-inner">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Doctors', href: '/doctors' },
              { label: doctor.user.fullName, href: `/doctors/${doctor.id}` },
              { label: 'Book' },
            ]}
          />
          <div className="bk-hero-row">
            <div className="bk-hero-doc">
              <div className="bk-avatar" aria-hidden>
                {initial}
              </div>
              <div>
                <p className="bk-kicker">Book appointment</p>
                <h1 className="bk-title">
                  {doctor.title}. {doctor.user.fullName}
                </h1>
                <p className="bk-sub">
                  {doctor.currency} {Number(doctor.consultationFee).toLocaleString()}
                  <span aria-hidden>·</span>
                  Free cancel {doctor.freeCancelHours}h before
                </p>
              </div>
            </div>
            <div className="bk-fee-pill">
              <span>Consultation</span>
              <strong>
                {doctor.currency} {Number(doctor.consultationFee).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="container bk-body">
        <ol className="bk-steps">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className={`bk-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            >
              <span className="bk-step-num">{i < step ? '✓' : i + 1}</span>
              <span className="bk-step-copy">
                <strong>{s.label}</strong>
                <em>{s.hint}</em>
              </span>
            </li>
          ))}
        </ol>

        <div className="bk-layout">
          <div className="bk-panel animate-in" key={step}>
            {step === 0 && (
              <>
                <h2 className="bk-panel-title">How would you like to consult?</h2>
                <p className="bk-panel-lead">Choose a visit type to continue.</p>
                <div className="bk-mode-grid">
                  {canClinic && (
                    <button
                      type="button"
                      className={`bk-mode-card ${mode === 'IN_PERSON' ? 'active' : ''}`}
                      onClick={() => setMode('IN_PERSON')}
                    >
                      <span className="bk-mode-icon" aria-hidden>
                        ◇
                      </span>
                      <strong>In person</strong>
                      <span>Visit the clinic at the scheduled time</span>
                    </button>
                  )}
                  {canOnline && (
                    <button
                      type="button"
                      className={`bk-mode-card ${mode === 'ONLINE' ? 'active' : ''}`}
                      onClick={() => setMode('ONLINE')}
                    >
                      <span className="bk-mode-icon" aria-hidden>
                        ▤
                      </span>
                      <strong>Online</strong>
                      <span>Video consult from home</span>
                    </button>
                  )}
                </div>

                {mode === 'IN_PERSON' && (
                  <div className="bk-clinic-block">
                    <h3>Clinic</h3>
                    <div className="bk-clinic-list">
                      {doctor.clinics.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`bk-clinic-card ${clinicId === c.id ? 'active' : ''}`}
                          onClick={() => setClinicId(c.id)}
                        >
                          <strong>{c.name}</strong>
                          <span>{c.address}</span>
                          {c.fee != null && (
                            <em>
                              Clinic fee {doctor.currency} {Number(c.fee).toLocaleString()}
                            </em>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="bk-panel-title">Pick a date & time</h2>
                <p className="bk-panel-lead">
                  Showing slots for {mode === 'ONLINE' ? 'online' : 'in-person'} visits.
                </p>

                <div className="bk-date-row">
                  {dateChoices.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      className={`bk-date-chip ${date === d.value ? 'active' : ''}`}
                      onClick={() => {
                        setDate(d.value);
                        setSlot(null);
                      }}
                    >
                      <strong>{d.label}</strong>
                      <span>{d.sub}</span>
                    </button>
                  ))}
                </div>

                <label className="bk-date-input">
                  Or choose another date
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setSlot(null);
                    }}
                  />
                </label>

                <div className="bk-slots">
                  <h3>Available times</h3>
                  <SlotPicker slots={slots} selected={slot} onSelect={setSlot} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="bk-panel-title">Who is this visit for?</h2>
                <p className="bk-panel-lead">
                  {isAuthenticated
                    ? 'Book for yourself or a family member.'
                    : 'You will sign in with demo OTP 123456 before confirming.'}
                </p>
                <div className="bk-patient-list">
                  <button
                    type="button"
                    className={`bk-patient-card ${dependentId === '' ? 'active' : ''}`}
                    onClick={() => setDependentId('')}
                  >
                    <span className="bk-patient-avatar">{patient.user.fullName.charAt(0)}</span>
                    <span>
                      <strong>Myself</strong>
                      <em>{patient.user.fullName}</em>
                    </span>
                  </button>
                  {patient.dependents
                    .filter((d) => d.isActive)
                    .map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={`bk-patient-card ${dependentId === d.id ? 'active' : ''}`}
                        onClick={() => setDependentId(d.id)}
                      >
                        <span className="bk-patient-avatar">{d.fullName.charAt(0)}</span>
                        <span>
                          <strong>{d.fullName}</strong>
                          <em>{d.relation}</em>
                        </span>
                      </button>
                    ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="bk-panel-title">Confirm your booking</h2>
                <p className="bk-panel-lead">Review the details, then create the appointment.</p>
                <dl className="bk-summary">
                  <div>
                    <dt>Doctor</dt>
                    <dd>
                      {doctor.title}. {doctor.user.fullName}
                    </dd>
                  </div>
                  <div>
                    <dt>Mode</dt>
                    <dd>{mode === 'ONLINE' ? 'Online consult' : 'In person'}</dd>
                  </div>
                  {mode === 'IN_PERSON' && (
                    <div>
                      <dt>Clinic</dt>
                      <dd>{clinic?.name ?? '—'}</dd>
                    </div>
                  )}
                  <div>
                    <dt>When</dt>
                    <dd>{slot ? new Date(slot).toLocaleString('en-PK') : '—'}</dd>
                  </div>
                  <div>
                    <dt>Patient</dt>
                    <dd>{patientName}</dd>
                  </div>
                  <div className="bk-summary-total">
                    <dt>Total</dt>
                    <dd>
                      {doctor.currency} {Number(doctor.consultationFee).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <p className="bk-hold-note">
                  After create, status is <strong>PENDING_PAYMENT</strong> until you confirm payment.
                </p>
              </>
            )}

            {error && <p className="bk-error">{error}</p>}

            <div className="bk-actions">
              {step > 0 && (
                <button type="button" className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>
                  Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  Continue
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={submit}>
                  Create appointment
                </button>
              )}
              <Link href={`/doctors/${doctor.id}`} className="btn btn-ghost">
                Cancel
              </Link>
            </div>
          </div>

          <aside className="bk-aside">
            <div className="bk-aside-card">
              <p className="bk-aside-label">Your selection</p>
              <ul className="bk-aside-list">
                <li>
                  <span>Mode</span>
                  <strong>{mode === 'ONLINE' ? 'Online' : 'In person'}</strong>
                </li>
                {mode === 'IN_PERSON' && (
                  <li>
                    <span>Clinic</span>
                    <strong>{clinic?.name ?? '—'}</strong>
                  </li>
                )}
                <li>
                  <span>Date</span>
                  <strong>
                    {slot
                      ? new Date(slot).toLocaleDateString('en-PK', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })
                      : new Date(`${date}T12:00:00`).toLocaleDateString('en-PK', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                  </strong>
                </li>
                <li>
                  <span>Time</span>
                  <strong>
                    {slot
                      ? new Date(slot).toLocaleTimeString('en-PK', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Not selected'}
                  </strong>
                </li>
                <li>
                  <span>Patient</span>
                  <strong>{patientName}</strong>
                </li>
              </ul>
              <div className="bk-aside-total">
                <span>Due after confirm</span>
                <strong>
                  {doctor.currency} {Number(doctor.consultationFee).toLocaleString()}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <section className="page-section">
            <div className="container">
              <p className="entity-card-muted">Loading booking…</p>
            </div>
          </section>
        }
      >
        <BookContent />
      </Suspense>
    </AppShell>
  );
}
