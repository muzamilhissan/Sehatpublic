'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader, SlotPicker } from '@/components/ui';
import { createMockAppointment, getDoctorById, getDoctorSlots, getPatientMe } from '@/data';
import { useAuth } from '@/lib/auth-context';
import type { AppointmentMode } from '@/types';

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
  const [dependentId, setDependentId] = useState<string>('');
  const [error, setError] = useState('');

  const slots = useMemo(
    () => (doctor ? getDoctorSlots(doctor.id, date, mode).data : []),
    [doctor, date, mode],
  );

  if (!doctor) {
    return <EmptyState title="Doctor not found" actionHref="/doctors" actionLabel="Browse doctors" />;
  }

  const steps = ['Mode', 'Schedule', 'Patient', 'Confirm'];

  const canOnline = doctor.availabilities?.some((a) => a.mode === 'ONLINE' || a.mode === 'BOTH');
  const canClinic = doctor.availabilities?.some((a) => a.mode === 'CLINIC' || a.mode === 'BOTH');

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
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Doctors', href: '/doctors' },
          { label: doctor.user.fullName, href: `/doctors/${doctor.id}` },
          { label: 'Book' },
        ]}
      />
      <PageHeader
        title={`Book with ${doctor.title}. ${doctor.user.fullName}`}
        subtitle={`${doctor.currency} ${Number(doctor.consultationFee).toLocaleString()} · Free cancel ${doctor.freeCancelHours}h before`}
      />

      <div className="stepper">
        {steps.map((label, i) => (
          <div key={label} className={`stepper-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
            {i + 1}. {label}
          </div>
        ))}
      </div>

      <div className="detail-panel">
        {step === 0 && (
          <div className="form-grid">
            <div className="form-field">
              <label>Appointment mode</label>
              <div className="chip-row">
                {canClinic && (
                  <button type="button" className={`slot-chip ${mode === 'IN_PERSON' ? 'active' : ''}`} onClick={() => setMode('IN_PERSON')}>
                    IN_PERSON
                  </button>
                )}
                {canOnline && (
                  <button type="button" className={`slot-chip ${mode === 'ONLINE' ? 'active' : ''}`} onClick={() => setMode('ONLINE')}>
                    ONLINE
                  </button>
                )}
              </div>
            </div>
            {mode === 'IN_PERSON' && (
              <div className="form-field">
                <label>Clinic</label>
                <select value={clinicId} onChange={(e) => setClinicId(e.target.value)}>
                  {doctor.clinics.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.address}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="form-grid">
            <div className="form-field">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlot(null); }} />
            </div>
            <div className="form-field">
              <label>Available slots</label>
              <SlotPicker slots={slots} selected={slot} onSelect={setSlot} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid">
            {!isAuthenticated && (
              <p className="entity-card-muted">
                You will be asked to login (demo OTP <strong>123456</strong>) before confirming.
              </p>
            )}
            <div className="form-field">
              <label>Book for</label>
              <select value={dependentId} onChange={(e) => setDependentId(e.target.value)}>
                <option value="">Myself — {patient.user.fullName}</option>
                {patient.dependents.filter((d) => d.isActive).map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName} ({d.relation})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-grid">
            <p><strong>Doctor:</strong> {doctor.title}. {doctor.user.fullName}</p>
            <p><strong>Mode:</strong> {mode}</p>
            {mode === 'IN_PERSON' && (
              <p><strong>Clinic:</strong> {doctor.clinics.find((c) => c.id === clinicId)?.name}</p>
            )}
            <p><strong>Slot:</strong> {slot ? new Date(slot).toLocaleString('en-PK') : '—'}</p>
            <p><strong>Patient:</strong> {dependentId ? patient.dependents.find((d) => d.id === dependentId)?.fullName : patient.user.fullName}</p>
            <p><strong>Total:</strong> {doctor.currency} {Number(doctor.consultationFee).toLocaleString()}</p>
            <p className="entity-card-muted">Status after create: PENDING_PAYMENT (payment hold via paymentExpiresAt).</p>
          </div>
        )}

        {error && <p style={{ color: '#b91c1c', marginTop: 12 }}>{error}</p>}

        <div className="form-actions">
          {step > 0 && (
            <button type="button" className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>Back</button>
          )}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={goNext}>Continue</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={submit}>Create appointment</button>
          )}
          <Link href={`/doctors/${doctor.id}`} className="btn btn-outline">Cancel</Link>
        </div>
      </div>
    </>
  );
}

export default function BookPage() {
  return (
    <AppShell>
      <section className="page-section">
        <div className="container" style={{ maxWidth: 800 }}>
          <Suspense fallback={<p>Loading booking…</p>}>
            <BookContent />
          </Suspense>
        </div>
      </section>
    </AppShell>
  );
}
