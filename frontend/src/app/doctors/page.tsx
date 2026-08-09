'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import DoctorCard from '@/components/DoctorCard';
import { Breadcrumbs, EmptyState, PageHeader, Pagination } from '@/components/ui';
import { getDoctors, getSpecialties, CITIES } from '@/data';
import { useCity } from '@/lib/city-context';
import type { AppointmentMode } from '@/types';

function DoctorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { city, setCityBySlug } = useCity();

  const q = searchParams.get('q') ?? '';
  const specialty = searchParams.get('specialty') ?? '';
  const citySlug = searchParams.get('city') ?? city.slug;
  const mode = (searchParams.get('mode') as AppointmentMode | null) ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');

  const [query, setQuery] = useState(q);

  React.useEffect(() => {
    if (searchParams.get('city')) setCityBySlug(searchParams.get('city')!);
  }, [searchParams, setCityBySlug]);

  const result = useMemo(
    () =>
      getDoctors({
        q,
        citySlug,
        specialtySlug: specialty || undefined,
        mode,
        page,
        limit: 9,
      }),
    [q, citySlug, specialty, mode, page],
  );

  const specialties = getSpecialties().data;

  const updateParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    if (!('page' in patch)) params.delete('page');
    router.push(`/doctors?${params.toString()}`);
  };

  return (
    <section className="page-section">
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Doctors' },
          ]}
        />
        <PageHeader
          title={`Doctors in ${CITIES.find((c) => c.slug === citySlug)?.name ?? city.name}`}
          subtitle="Browse verified specialists. Fees, ratings, and availability match the Sehatdoc booking schema."
        />

        <div className="filter-bar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctor or clinic"
            onKeyDown={(e) => e.key === 'Enter' && updateParams({ q: query || null })}
          />
          <select
            value={citySlug}
            onChange={(e) => updateParams({ city: e.target.value })}
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={specialty}
            onChange={(e) => updateParams({ specialty: e.target.value || null })}
          >
            <option value="">All specialties</option>
            {specialties.slice(0, 40).map((s) => (
              <option key={s.id} value={s.slug}>{s.name}</option>
            ))}
          </select>
          <select
            value={mode ?? ''}
            onChange={(e) => updateParams({ mode: e.target.value || null })}
          >
            <option value="">Any mode</option>
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In-person</option>
          </select>
          <button className="btn btn-primary" type="button" onClick={() => updateParams({ q: query || null })}>
            Search
          </button>
        </div>

        {result.data.length === 0 ? (
          <EmptyState title="No doctors found" hint="Try another city or specialty." actionHref="/specialties" actionLabel="Browse specialties" />
        ) : (
          <>
            <p className="entity-card-muted" style={{ marginBottom: 16 }}>
              Showing {result.data.length} of {result.meta?.total} doctors
            </p>
            <div className="entity-grid">
              {result.data.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
            <Pagination
              page={result.meta!.page}
              totalPages={result.meta!.totalPages}
              onPageChange={(p) => updateParams({ page: String(p) })}
            />
          </>
        )}
      </div>
    </section>
  );
}

export default function DoctorsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="container page-section">Loading doctors…</div>}>
        <DoctorsContent />
      </Suspense>
    </AppShell>
  );
}
