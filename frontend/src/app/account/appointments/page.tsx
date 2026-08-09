'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { cancelMockAppointment, getAppointments } from '@/data';
import { useAuth } from '@/lib/auth-context';
import type { Appointment } from '@/types';

export default function AppointmentsPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Appointment[]>(() => getAppointments().data);

  if (!isAuthenticated) {
    return (
      <AppShell>
        <section className="page-section">
          <div className="container">
            <EmptyState title="Login required" hint="View and manage your appointments after login." actionHref="/auth/login?next=/account/appointments" actionLabel="Login" />
          </div>
        </section>
      </AppShell>
    );
  }

  const cancel = (id: string) => {
    cancelMockAppointment(id, 'Cancelled by patient');
    setItems(getAppointments().data);
  };

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'Appointments' }]} />
          <PageHeader title="My appointments" subtitle="Statuses follow AppointmentStatus enum." />
          {items.length === 0 ? (
            <EmptyState title="No appointments" actionHref="/doctors" actionLabel="Book a doctor" />
          ) : (
            <div className="entity-grid">
              {items.map((a) => (
                <article key={a.id} className="entity-card">
                  <div className="chip-row">
                    <span className={`status-pill ${a.status}`}>{a.status}</span>
                    <span className="chip">{a.mode}</span>
                  </div>
                  <h3 className="entity-card-title">{a.doctor.title}. {a.doctor.user.fullName}</h3>
                  <p className="entity-card-muted">{new Date(a.scheduledStart).toLocaleString('en-PK')}</p>
                  {a.clinic && <p className="entity-card-muted">{a.clinic.name}</p>}
                  {a.dependent && <p className="entity-card-muted">For: {a.dependent.fullName}</p>}
                  <p><strong>{a.currency} {Number(a.totalAmount).toLocaleString()}</strong></p>
                  <div className="entity-card-footer">
                    <Link href={`/book/confirmation/${a.id}`} className="btn btn-outline">Details</Link>
                    {!['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(a.status) && (
                      <button type="button" className="btn btn-outline" onClick={() => cancel(a.id)}>Cancel</button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
