'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { getSpecialties } from '@/data';
import { useCity } from '@/lib/city-context';

export default function SpecialtiesPage() {
  const { city } = useCity();
  const [q, setQ] = useState('');
  const specialties = useMemo(() => getSpecialties(q).data, [q]);

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Specialties' }]} />
          <PageHeader title="All Medical Specialties" subtitle="Select a specialty to find verified doctors near you." />
          <div className="filter-bar">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type here to search any specialty..." />
          </div>
          {specialties.length === 0 ? (
            <EmptyState title="No specialties found" hint="Try a different keyword." />
          ) : (
            <div className="specialty-list-grid">
              {specialties.map((s) => (
                <Link
                  key={s.id}
                  href={`/doctors?specialty=${s.slug}&city=${city.slug}`}
                  className="specialty-row-card"
                >
                  <div className="specialty-row-icon-wrapper">
                    <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{s.name.charAt(0)}</span>
                  </div>
                  <span className="specialty-row-title">{s.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
