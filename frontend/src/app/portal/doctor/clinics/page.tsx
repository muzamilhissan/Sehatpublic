'use client';

import React, { useEffect, useState } from 'react';
import DoctorPortalLayout from '@/components/DoctorPortalLayout';
import { useAuth } from '@/lib/auth-context';
import { getDoctorProfile, newClinic, setDoctorClinics } from '@/lib/doctor-portal-store';
import type { DoctorClinic } from '@/types';

export default function DoctorClinicsPage() {
  const { user } = useAuth();
  const [clinics, setClinics] = useState<DoctorClinic[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.doctorId) return;
    const d = getDoctorProfile(user.doctorId);
    setClinics(d?.clinics ?? []);
  }, [user?.doctorId]);

  const save = () => {
    if (!user?.doctorId) return;
    setDoctorClinics(user.doctorId, clinics);
    setMessage('Clinics saved.');
  };

  const update = (id: string, patch: Partial<DoctorClinic>) => {
    setClinics((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const remove = (id: string) => {
    setClinics((prev) => prev.filter((c) => c.id !== id));
  };

  const add = () => {
    if (!user?.doctorId) return;
    setClinics((prev) => [...prev, newClinic(user.doctorId!)]);
  };

  return (
    <DoctorPortalLayout title="Clinics">
      <div className="form-actions" style={{ marginBottom: 16 }}>
        <button type="button" className="btn btn-outline" onClick={add}>Add clinic</button>
        <button type="button" className="btn btn-primary" onClick={save}>Save all</button>
      </div>
      {message && <p style={{ color: 'var(--primary-navy)', marginBottom: 12 }}>{message}</p>}
      <div className="entity-grid">
        {clinics.map((c) => (
          <article key={c.id} className="entity-card form-grid">
            <div className="form-field">
              <label>Name</label>
              <input value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Address</label>
              <textarea rows={2} value={c.address} onChange={(e) => update(c.id, { address: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input value={c.phone ?? ''} onChange={(e) => update(c.id, { phone: e.target.value || null })} />
            </div>
            <div className="form-field">
              <label>Fee</label>
              <input value={c.fee ?? ''} onChange={(e) => update(c.id, { fee: e.target.value || null })} />
            </div>
            <div className="cred-entry-top" style={{ marginTop: 8, marginBottom: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={c.isPrimary}
                    onChange={(e) =>
                      setClinics((prev) =>
                        prev.map((x) => ({
                          ...x,
                          isPrimary: x.id === c.id ? e.target.checked : e.target.checked ? false : x.isPrimary,
                        })),
                      )
                    }
                    style={{ marginRight: 8 }}
                  />
                  Primary clinic
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={c.isActive}
                    onChange={(e) => update(c.id, { isActive: e.target.checked })}
                    style={{ marginRight: 8 }}
                  />
                  Active
                </label>
              </div>
              <button type="button" className="cred-remove-link" onClick={() => remove(c.id)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      {clinics.length === 0 && <p className="empty-state">No clinics yet. Add your first location.</p>}
    </DoctorPortalLayout>
  );
}
