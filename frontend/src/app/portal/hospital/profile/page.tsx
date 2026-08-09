'use client';

import React, { useEffect, useState } from 'react';
import HospitalPortalLayout from '@/components/HospitalPortalLayout';
import { useAuth } from '@/lib/auth-context';
import { getHospitalProfile, saveHospitalProfile } from '@/lib/hospital-portal-store';
import { CITIES, getAreasByCityId } from '@/data/cities';
import type { Hospital, HospitalType } from '@/types';

export default function HospitalProfilePage() {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.hospitalId) return;
    setHospital(getHospitalProfile(user.hospitalId));
  }, [user?.hospitalId]);

  const areas = hospital ? getAreasByCityId(hospital.cityId) : [];

  const save = () => {
    if (!hospital) return;
    const city = CITIES.find((c) => c.id === hospital.cityId) ?? hospital.city;
    const area = areas.find((a) => a.id === hospital.areaId) ?? null;
    const next = { ...hospital, city, area };
    saveHospitalProfile(next);
    setHospital(next);
    setMessage('Hospital profile saved.');
  };

  if (!hospital) {
    return (
      <HospitalPortalLayout title="Profile">
        <p className="entity-card-muted">Loading…</p>
      </HospitalPortalLayout>
    );
  }

  return (
    <HospitalPortalLayout title="Hospital Profile">
      <div className="detail-panel form-grid" style={{ maxWidth: 720 }}>
        <div className="form-field">
          <label>Name</label>
          <input value={hospital.name} onChange={(e) => setHospital({ ...hospital, name: e.target.value })} />
        </div>
        <div className="form-field">
          <label>Type</label>
          <select
            value={hospital.type}
            onChange={(e) => setHospital({ ...hospital, type: e.target.value as HospitalType })}
          >
            <option value="HOSPITAL">HOSPITAL</option>
            <option value="CLINIC">CLINIC</option>
            <option value="MEDICAL_CENTER">MEDICAL_CENTER</option>
          </select>
        </div>
        <div className="form-field">
          <label>Description</label>
          <textarea
            rows={4}
            value={hospital.description ?? ''}
            onChange={(e) => setHospital({ ...hospital, description: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label>Phone</label>
          <input value={hospital.phone ?? ''} onChange={(e) => setHospital({ ...hospital, phone: e.target.value || null })} />
        </div>
        <div className="form-field">
          <label>Email</label>
          <input value={hospital.email ?? ''} onChange={(e) => setHospital({ ...hospital, email: e.target.value || null })} />
        </div>
        <div className="form-field">
          <label>Address</label>
          <textarea rows={2} value={hospital.address} onChange={(e) => setHospital({ ...hospital, address: e.target.value })} />
        </div>
        <div className="form-field">
          <label>City</label>
          <select
            value={hospital.cityId}
            onChange={(e) => setHospital({ ...hospital, cityId: e.target.value, areaId: null })}
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Area</label>
          <select
            value={hospital.areaId ?? ''}
            onChange={(e) => setHospital({ ...hospital, areaId: e.target.value || null })}
          >
            <option value="">None</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <p className="entity-card-muted">Verification: {hospital.verificationStatus}</p>
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={save}>Save profile</button>
        </div>
        {message && <p style={{ color: 'var(--primary-navy)' }}>{message}</p>}
      </div>
    </HospitalPortalLayout>
  );
}
