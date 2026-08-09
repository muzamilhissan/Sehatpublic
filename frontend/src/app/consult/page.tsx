'use client';

import React, { useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import DoctorCard from '@/components/DoctorCard';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { getDoctors, CITIES } from '@/data';
import { useCity } from '@/lib/city-context';

export default function ConsultPage() {
  const { city } = useCity();
  const [citySlug, setCitySlug] = useState(city.slug);
  const [q, setQ] = useState('');

  const result = useMemo(
    () => getDoctors({ q, citySlug, mode: 'ONLINE', limit: 24 }),
    [q, citySlug],
  );

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Online Consultation' }]} />
          <PageHeader
            title="Consult Doctor Online"
            subtitle="Doctors accepting ONLINE availability mode. Book a video slot without leaving home."
          />
          <div className="filter-bar">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search online doctors" />
            <select value={citySlug} onChange={(e) => setCitySlug(e.target.value)}>
              {CITIES.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          {result.data.length === 0 ? (
            <EmptyState title="No online doctors found" actionHref="/doctors" actionLabel="Browse all doctors" />
          ) : (
            <div className="entity-grid">
              {result.data.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
