'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import DoctorCard from '@/components/DoctorCard';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { getHospitalById } from '@/data';

export default function HospitalDetailPage() {
  const params = useParams<{ id: string }>();
  const hospital = getHospitalById(params.id).data;

  if (!hospital) {
    return (
      <AppShell>
        <section className="page-section">
          <div className="container">
            <EmptyState title="Hospital not found" actionHref="/hospitals" actionLabel="Back to hospitals" />
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Hospitals', href: '/hospitals' }, { label: hospital.name }]} />
          <PageHeader
            title={hospital.name}
            subtitle={`${hospital.type.replace('_', ' ')} · ${hospital.city.name}${hospital.area ? ` · ${hospital.area.name}` : ''}`}
          />
          <div className="detail-layout">
            <div className="detail-panel">
              <div className="chip-row" style={{ marginBottom: 16 }}>
                <span className="chip">★ {Number(hospital.avgRating).toFixed(1)} ({hospital.reviewCount})</span>
                <span className="chip">{hospital.verificationStatus}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{hospital.description}</p>
              <div className="detail-section">
                <h3>Address & contact</h3>
                <p className="entity-card-muted">{hospital.address}</p>
                {hospital.phone && <p className="entity-card-muted">Phone: {hospital.phone}</p>}
                {hospital.email && <p className="entity-card-muted">Email: {hospital.email}</p>}
              </div>
              <div className="detail-section">
                <h3>Facilities</h3>
                <div className="chip-row">
                  {hospital.facilities?.map((f) => <span key={f.id} className="chip">{f.name}</span>)}
                </div>
              </div>
              <div className="detail-section">
                <h3>Departments</h3>
                <ul>
                  {hospital.departments?.map((d) => (
                    <li key={d.id} className="entity-card-muted">{d.name} — {d.description}</li>
                  ))}
                </ul>
              </div>
              <div className="detail-section">
                <h3>Affiliated doctors</h3>
                <div className="entity-grid">
                  {hospital.doctors?.map((hd) => (
                    <div key={hd.id}>
                      <p className="chip" style={{ marginBottom: 8 }}>{hd.employmentType}{hd.department ? ` · ${hd.department.name}` : ''}</p>
                      <DoctorCard doctor={hd.doctor} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <aside className="side-panel">
              <h3 style={{ marginBottom: 12 }}>Book a doctor here</h3>
              <p className="entity-card-muted" style={{ marginBottom: 16 }}>
                Choose an affiliated doctor to start booking.
              </p>
              {hospital.doctors?.[0] && (
                <Link href={`/doctors/${hospital.doctors[0].doctorId}`} className="btn btn-primary" style={{ width: '100%' }}>
                  View top doctor
                </Link>
              )}
              <Link href={`/doctors?city=${hospital.city.slug}`} className="btn btn-outline" style={{ width: '100%', marginTop: 10 }}>
                More doctors in {hospital.city.name}
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
