'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState } from '@/components/ui';
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
            <EmptyState
              title="Appointment not found"
              actionHref="/account/appointments"
              actionLabel="My appointments"
            />
          </div>
        </section>
      </AppShell>
    );
  }

  const pay = (method: 'CASH' | 'MANUAL_TRANSFER') => {
    const updated = confirmMockPayment(appointment.id, method);
    if (updated) {
      setAppointment({ ...updated });
      setMessage(
        method === 'CASH'
          ? 'Cash selected — appointment confirmed.'
          : 'Transfer initiated — upload proof after paying (demo keeps PENDING_PAYMENT).',
      );
    }
  };

  const pending = appointment.status === 'PENDING_PAYMENT';
  const initial = appointment.doctor.user.fullName.charAt(0).toUpperCase();

  return (
    <AppShell>
      <div className="bk-page">
        <div className="bk-hero bk-hero-confirm">
          <div className="container bk-hero-inner">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Booking confirmation' }]} />
            <div className="bk-hero-row">
              <div className="bk-hero-doc">
                <div className="bk-avatar" aria-hidden>
                  {pending ? '…' : '✓'}
                </div>
                <div>
                  <p className="bk-kicker">{pending ? 'Almost done' : 'You’re booked'}</p>
                  <h1 className="bk-title">{pending ? 'Confirm payment' : 'Appointment confirmed'}</h1>
                  <p className="bk-sub">
                    {appointment.doctor.title}. {appointment.doctor.user.fullName}
                    <span aria-hidden>·</span>
                    {new Date(appointment.scheduledStart).toLocaleString('en-PK')}
                  </p>
                </div>
              </div>
              <span className={`bk-status status-pill ${appointment.status}`}>{appointment.status}</span>
            </div>
          </div>
        </div>

        <div className="container bk-body">
          <div className="bk-layout">
            <div className="bk-panel">
              <h2 className="bk-panel-title">Appointment details</h2>
              <dl className="bk-summary">
                <div>
                  <dt>Reference</dt>
                  <dd className="bk-mono">{appointment.id}</dd>
                </div>
                <div>
                  <dt>Doctor</dt>
                  <dd>
                    <span className="bk-inline-doc">
                      <span className="bk-mini-avatar">{initial}</span>
                      {appointment.doctor.title}. {appointment.doctor.user.fullName}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Mode</dt>
                  <dd>{appointment.mode === 'ONLINE' ? 'Online consult' : 'In person'}</dd>
                </div>
                {appointment.clinic && (
                  <div>
                    <dt>Clinic</dt>
                    <dd>{appointment.clinic.name}</dd>
                  </div>
                )}
                {appointment.dependent && (
                  <div>
                    <dt>Patient</dt>
                    <dd>{appointment.dependent.fullName}</dd>
                  </div>
                )}
                <div>
                  <dt>When</dt>
                  <dd>{new Date(appointment.scheduledStart).toLocaleString('en-PK')}</dd>
                </div>
                <div className="bk-summary-total">
                  <dt>Amount</dt>
                  <dd>
                    {appointment.currency} {Number(appointment.totalAmount).toLocaleString()}
                  </dd>
                </div>
              </dl>

              {appointment.paymentExpiresAt && pending && (
                <p className="bk-hold-note">
                  Payment hold expires{' '}
                  <strong>{new Date(appointment.paymentExpiresAt).toLocaleString('en-PK')}</strong>
                </p>
              )}

              {pending && (
                <div className="bk-pay">
                  <h3>Pay to confirm</h3>
                  <div className="bk-pay-actions">
                    <button type="button" className="btn btn-primary" onClick={() => pay('CASH')}>
                      Pay cash at clinic
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => pay('MANUAL_TRANSFER')}
                    >
                      Manual transfer
                    </button>
                  </div>
                  <div className="bk-pay-list">
                    {instructions.map((ins) => (
                      <article key={ins.id} className="bk-pay-card">
                        <strong>
                          {ins.channel} — {ins.accountTitle}
                        </strong>
                        <p>
                          {ins.accountNumber}
                          {ins.bankName ? ` · ${ins.bankName}` : ''}
                        </p>
                        <p>{ins.instructions}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {message && <p className="bk-success">{message}</p>}

              <div className="bk-actions">
                <Link href="/account/appointments" className="btn btn-primary">
                  My appointments
                </Link>
                <Link href="/" className="btn btn-outline">
                  Home
                </Link>
              </div>
            </div>

            <aside className="bk-aside">
              <div className="bk-aside-card">
                <p className="bk-aside-label">Next steps</p>
                <ol className="bk-next-steps">
                  <li className={!pending ? 'done' : ''}>Appointment created</li>
                  <li className={!pending ? 'done' : 'current'}>
                    {pending ? 'Confirm payment' : 'Payment received'}
                  </li>
                  <li>Attend your visit</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
