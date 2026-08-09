'use client';

import React, { useEffect, useState } from 'react';
import HospitalPortalLayout from '@/components/HospitalPortalLayout';
import { useAuth } from '@/lib/auth-context';
import { listHospitalAppointments } from '@/lib/hospital-portal-store';
import type { Appointment } from '@/types';

export default function HospitalAppointmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user?.hospitalId) return;
    setItems(listHospitalAppointments(user.hospitalId));
  }, [user?.hospitalId]);

  return (
    <HospitalPortalLayout title="Appointments">
      <p className="entity-card-muted" style={{ marginBottom: 16 }}>
        Bookings for doctors affiliated with your hospital.
      </p>
      {items.length === 0 ? (
        <div className="empty-state">No appointments for affiliated doctors yet.</div>
      ) : (
        <div className="entity-grid">
          {items.map((a) => (
            <article key={a.id} className="entity-card">
              <div className="chip-row">
                <span className={`status-pill ${a.status}`}>{a.status}</span>
                <span className="chip">{a.mode}</span>
              </div>
              <h3 className="entity-card-title">
                {a.doctor.title}. {a.doctor.user.fullName}
              </h3>
              <p className="entity-card-muted">Patient: {a.patient.user.fullName}</p>
              <p className="entity-card-muted">{new Date(a.scheduledStart).toLocaleString('en-PK')}</p>
              <p><strong>{a.currency} {Number(a.totalAmount).toLocaleString()}</strong></p>
            </article>
          ))}
        </div>
      )}
    </HospitalPortalLayout>
  );
}
