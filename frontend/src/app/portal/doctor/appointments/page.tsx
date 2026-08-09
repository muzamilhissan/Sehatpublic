'use client';

import React, { useEffect, useState } from 'react';
import DoctorPortalLayout from '@/components/DoctorPortalLayout';
import { useAuth } from '@/lib/auth-context';
import {
  listAppointmentsForPortalDoctor,
  setDoctorAppointmentStatus,
} from '@/lib/doctor-portal-store';
import type { Appointment, AppointmentStatus } from '@/types';

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);

  const refresh = () => {
    if (!user?.doctorId) return;
    setItems(listAppointmentsForPortalDoctor(user.doctorId));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.doctorId]);

  const setStatus = (id: string, status: AppointmentStatus) => {
    setDoctorAppointmentStatus(id, status);
    refresh();
  };

  return (
    <DoctorPortalLayout title="Appointments">
      {items.length === 0 ? (
        <div className="empty-state">No appointments for your practice yet.</div>
      ) : (
        <div className="entity-grid">
          {items.map((a) => (
            <article key={a.id} className="entity-card">
              <div className="chip-row">
                <span className={`status-pill ${a.status}`}>{a.status}</span>
                <span className="chip">{a.mode}</span>
              </div>
              <h3 className="entity-card-title">{a.patient.user.fullName}</h3>
              {a.dependent && <p className="entity-card-muted">Dependent: {a.dependent.fullName}</p>}
              <p className="entity-card-muted">{new Date(a.scheduledStart).toLocaleString('en-PK')}</p>
              {a.clinic && <p className="entity-card-muted">{a.clinic.name}</p>}
              <p><strong>{a.currency} {Number(a.totalAmount).toLocaleString()}</strong></p>
              <div className="form-actions">
                {a.status === 'PENDING_PAYMENT' && (
                  <button type="button" className="btn btn-primary" onClick={() => setStatus(a.id, 'CONFIRMED')}>
                    Confirm
                  </button>
                )}
                {a.status === 'CONFIRMED' && (
                  <button type="button" className="btn btn-primary" onClick={() => setStatus(a.id, 'COMPLETED')}>
                    Complete
                  </button>
                )}
                {!['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(a.status) && (
                  <button type="button" className="btn btn-outline" onClick={() => setStatus(a.id, 'CANCELLED')}>
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </DoctorPortalLayout>
  );
}
