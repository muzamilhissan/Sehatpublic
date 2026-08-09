'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { confirmMockPayment, getAppointmentById, getPaymentInstructions } from '@/data';

export default function BookingConfirmationPage() {
  const params = useParams<{ appointmentId: string }>();
  const [appointment, setAppointment] = useState(() => getAppointmentById(params.appointmentId).data);
  const instructions = getPaymentInstructions().data;
  const [message, setMessage] = useState('');

  if (!appointment) {
    return (
      <AppShell>
        <section className="page-section">
          <div className="container">
            <EmptyState title="Appointment not found" actionHref="/account/appointments" actionLabel="My appointments" />
          </div>
        </section>
      </AppShell>
    );
  }

  const pay = (method: 'CASH' | 'MANUAL_TRANSFER') => {
    const updated = confirmMockPayment(appointment.id, method);
    if (updated) {
      setAppointment({ ...updated });
      setMessage(method === 'CASH' ? 'Cash selected — appointment CONFIRMED.' : 'Transfer initiated — upload proof after paying (demo keeps PENDING_PAYMENT).');
    }
  };

  return (
    <AppShell>
      <section className="page-section">
        <div className="container" style={{ maxWidth: 800 }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Booking confirmation' }]} />
          <PageHeader title="Appointment created" subtitle="Matches Nest appointment + payment initiate flow (mock)." />

          <div className="detail-panel">
            <div className="chip-row" style={{ marginBottom: 16 }}>
              <span className={`status-pill ${appointment.status}`}>{appointment.status}</span>
              <span className="chip">{appointment.mode}</span>
            </div>
            <p><strong>ID:</strong> {appointment.id}</p>
            <p><strong>Doctor:</strong> {appointment.doctor.title}. {appointment.doctor.user.fullName}</p>
            <p><strong>When:</strong> {new Date(appointment.scheduledStart).toLocaleString('en-PK')}</p>
            {appointment.clinic && <p><strong>Clinic:</strong> {appointment.clinic.name}</p>}
            {appointment.dependent && <p><strong>Dependent:</strong> {appointment.dependent.fullName}</p>}
            <p><strong>Fee snapshot:</strong> {appointment.currency} {Number(appointment.totalAmount).toLocaleString()}</p>
            {appointment.paymentExpiresAt && (
              <p className="entity-card-muted">Payment hold expires: {new Date(appointment.paymentExpiresAt).toLocaleString('en-PK')}</p>
            )}

            {appointment.status === 'PENDING_PAYMENT' && (
              <div className="detail-section">
                <h3>Pay to confirm</h3>
                <div className="form-actions">
                  <button type="button" className="btn btn-primary" onClick={() => pay('CASH')}>Pay cash at clinic</button>
                  <button type="button" className="btn btn-outline" onClick={() => pay('MANUAL_TRANSFER')}>Manual transfer</button>
                </div>
                <div style={{ marginTop: 16 }}>
                  {instructions.map((ins) => (
                    <div key={ins.id} style={{ marginBottom: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                      <strong>{ins.channel}</strong> — {ins.accountTitle}
                      <p className="entity-card-muted">{ins.accountNumber}{ins.bankName ? ` · ${ins.bankName}` : ''}</p>
                      <p className="entity-card-muted">{ins.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message && <p style={{ color: 'var(--primary-navy)', marginTop: 12 }}>{message}</p>}

            <div className="form-actions">
              <Link href="/account/appointments" className="btn btn-primary">My appointments</Link>
              <Link href="/" className="btn btn-outline">Home</Link>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
