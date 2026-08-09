'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { DEMO_PATIENT } from '@/data/patient';
import { useAuth } from '@/lib/auth-context';
import type { DependentRelation, Gender, PatientDependent } from '@/types';

export default function DependentsPage() {
  const { isAuthenticated } = useAuth();
  const [dependents, setDependents] = useState<PatientDependent[]>([...DEMO_PATIENT.dependents]);
  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState<DependentRelation>('CHILD');
  const [gender, setGender] = useState<Gender>('MALE');

  if (!isAuthenticated) {
    return (
      <AppShell>
        <section className="page-section">
          <div className="container">
            <EmptyState title="Login required" actionHref="/auth/login?next=/account/dependents" actionLabel="Login" />
          </div>
        </section>
      </AppShell>
    );
  }

  const add = () => {
    if (!fullName.trim()) return;
    const next: PatientDependent = {
      id: `pd-local-${Date.now()}`,
      patientId: DEMO_PATIENT.id,
      fullName: fullName.trim(),
      relation,
      dateOfBirth: null,
      gender,
      bloodGroup: null,
      cnic: null,
      isActive: true,
    };
    setDependents((prev) => [...prev, next]);
    DEMO_PATIENT.dependents.push(next);
    setFullName('');
  };

  const deactivate = (id: string) => {
    setDependents((prev) => prev.map((d) => (d.id === id ? { ...d, isActive: false } : d)));
    const target = DEMO_PATIENT.dependents.find((d) => d.id === id);
    if (target) target.isActive = false;
  };

  return (
    <AppShell>
      <section className="page-section">
        <div className="container" style={{ maxWidth: 800 }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'Dependents' }]} />
          <PageHeader title="Family members" subtitle="PatientDependent records for family booking." />

          <div className="detail-panel form-grid" style={{ marginBottom: 24 }}>
            <div className="form-field">
              <label>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Relation</label>
              <select value={relation} onChange={(e) => setRelation(e.target.value as DependentRelation)}>
                {['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
                {['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={add}>Add dependent</button>
          </div>

          <div className="entity-grid">
            {dependents.map((d) => (
              <article key={d.id} className="entity-card">
                <h3 className="entity-card-title">{d.fullName}</h3>
                <p className="entity-card-subtitle">{d.relation} · {d.gender}</p>
                <span className="chip">{d.isActive ? 'Active' : 'Inactive'}</span>
                {d.isActive && (
                  <button type="button" className="btn btn-outline" onClick={() => deactivate(d.id)}>Deactivate</button>
                )}
              </article>
            ))}
          </div>
          <div className="form-actions">
            <Link href="/account" className="btn btn-outline">Back to account</Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
