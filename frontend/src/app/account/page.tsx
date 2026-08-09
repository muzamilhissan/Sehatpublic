'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, PageHeader } from '@/components/ui';
import { getPatientMe } from '@/data';
import { useAuth } from '@/lib/auth-context';

export default function AccountPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const patient = getPatientMe().data;

  if (!isAuthenticated) {
    return (
      <AppShell>
        <section className="page-section">
          <div className="container" style={{ maxWidth: 560 }}>
            <PageHeader title="My Account" subtitle="Login to view your profile and appointments." />
            <Link href="/auth/login?next=/account" className="btn btn-primary">Login</Link>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Account' }]} />
          <PageHeader title={`Hello, ${user?.fullName}`} subtitle="Patient profile from schema-shaped demo data." />
          <div className="detail-layout">
            <div className="detail-panel">
              <h3>Profile</h3>
              <p><strong>Phone:</strong> {patient.user.phone}</p>
              <p><strong>Email:</strong> {patient.user.email}</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              <p><strong>DOB:</strong> {patient.dateOfBirth}</p>
              <p><strong>Blood group:</strong> {patient.bloodGroup}</p>
              <p><strong>City:</strong> {patient.city?.name}</p>
              <div className="detail-section">
                <h3>Default address</h3>
                {patient.addresses.filter((a) => a.isDefault).map((a) => (
                  <p key={a.id} className="entity-card-muted">
                    {a.label}: {a.addressLine1}, {a.area?.name}, {a.city?.name}
                  </p>
                ))}
              </div>
            </div>
            <aside className="side-panel">
              <Link href="/account/appointments" className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }}>Appointments</Link>
              <Link href="/account/dependents" className="btn btn-outline" style={{ width: '100%', marginBottom: 10 }}>Dependents</Link>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={() => { logout(); router.push('/'); }}
              >
                Logout
              </button>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
