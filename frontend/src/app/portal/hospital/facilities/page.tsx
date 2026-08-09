'use client';

import React, { useEffect, useState } from 'react';
import HospitalPortalLayout from '@/components/HospitalPortalLayout';
import { useAuth } from '@/lib/auth-context';
import { getHospitalProfile, newFacility, setHospitalFacilities } from '@/lib/hospital-portal-store';
import type { HospitalFacility } from '@/types';

export default function HospitalFacilitiesPage() {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<HospitalFacility[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.hospitalId) return;
    setFacilities(getHospitalProfile(user.hospitalId)?.facilities ?? []);
  }, [user?.hospitalId]);

  const save = () => {
    if (!user?.hospitalId) return;
    setHospitalFacilities(user.hospitalId, facilities);
    setMessage('Facilities saved.');
  };

  return (
    <HospitalPortalLayout title="Facilities">
      <div className="form-actions" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            if (!user?.hospitalId) return;
            setFacilities((p) => [...p, newFacility(user.hospitalId!)]);
          }}
        >
          Add facility
        </button>
        <button type="button" className="btn btn-primary" onClick={save}>Save</button>
      </div>
      {message && <p style={{ color: 'var(--primary-navy)', marginBottom: 12 }}>{message}</p>}
      <div className="entity-grid">
        {facilities.map((f) => (
          <article key={f.id} className="entity-card form-grid">
            <div className="form-field">
              <label>Name</label>
              <input
                value={f.name}
                onChange={(e) =>
                  setFacilities((p) => p.map((x) => (x.id === f.id ? { ...x, name: e.target.value } : x)))
                }
              />
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setFacilities((p) => p.filter((x) => x.id !== f.id))}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
      {facilities.length === 0 && <p className="empty-state">No facilities listed yet.</p>}
    </HospitalPortalLayout>
  );
}
