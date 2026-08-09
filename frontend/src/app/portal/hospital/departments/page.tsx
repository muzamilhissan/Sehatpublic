'use client';

import React, { useEffect, useState } from 'react';
import HospitalPortalLayout from '@/components/HospitalPortalLayout';
import { useAuth } from '@/lib/auth-context';
import { getHospitalProfile, newDepartment, setHospitalDepartments } from '@/lib/hospital-portal-store';
import type { HospitalDepartment } from '@/types';

export default function HospitalDepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<HospitalDepartment[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.hospitalId) return;
    setDepartments(getHospitalProfile(user.hospitalId)?.departments ?? []);
  }, [user?.hospitalId]);

  const save = () => {
    if (!user?.hospitalId) return;
    setHospitalDepartments(user.hospitalId, departments);
    setMessage('Departments saved.');
  };

  return (
    <HospitalPortalLayout title="Departments">
      <div className="form-actions" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            if (!user?.hospitalId) return;
            setDepartments((p) => [...p, newDepartment(user.hospitalId!)]);
          }}
        >
          Add department
        </button>
        <button type="button" className="btn btn-primary" onClick={save}>Save</button>
      </div>
      {message && <p style={{ color: 'var(--primary-navy)', marginBottom: 12 }}>{message}</p>}
      <div className="entity-grid">
        {departments.map((d) => (
          <article key={d.id} className="entity-card form-grid">
            <div className="form-field">
              <label>Name</label>
              <input
                value={d.name}
                onChange={(e) =>
                  setDepartments((p) => p.map((x) => (x.id === d.id ? { ...x, name: e.target.value } : x)))
                }
              />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea
                rows={2}
                value={d.description ?? ''}
                onChange={(e) =>
                  setDepartments((p) =>
                    p.map((x) => (x.id === d.id ? { ...x, description: e.target.value } : x)),
                  )
                }
              />
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setDepartments((p) => p.filter((x) => x.id !== d.id))}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
      {departments.length === 0 && <p className="empty-state">No departments yet.</p>}
    </HospitalPortalLayout>
  );
}
