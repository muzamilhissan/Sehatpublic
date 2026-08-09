'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import HospitalCard from '@/components/HospitalCard';
import { Breadcrumbs, EmptyState, PageHeader, Pagination } from '@/components/ui';
import { getHospitals, CITIES } from '@/data';
import { useCity } from '@/lib/city-context';

function HospitalsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { city } = useCity();
  const q = searchParams.get('q') ?? '';
  const citySlug = searchParams.get('city') ?? city.slug;
  const page = Number(searchParams.get('page') ?? '1');
  const [query, setQuery] = useState(q);

  const result = useMemo(() => getHospitals({ q, citySlug, page, limit: 9 }), [q, citySlug, page]);

  const updateParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    if (!('page' in patch)) params.delete('page');
    router.push(`/hospitals?${params.toString()}`);
  };

  return (
    <section className="page-section">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Hospitals' }]} />
        <PageHeader title="Hospitals & Medical Centres" subtitle="Approved facilities with departments, facilities, and affiliated doctors." />
        <div className="filter-bar">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hospitals" onKeyDown={(e) => e.key === 'Enter' && updateParams({ q: query || null })} />
          <select value={citySlug} onChange={(e) => updateParams({ city: e.target.value })}>
            <option value="">All cities</option>
            {CITIES.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" type="button" onClick={() => updateParams({ q: query || null })}>Search</button>
        </div>
        {result.data.length === 0 ? (
          <EmptyState title="No hospitals found" hint="Try another city." />
        ) : (
          <>
            <div className="entity-grid">
              {result.data.map((h) => <HospitalCard key={h.id} hospital={h} />)}
            </div>
            <Pagination page={result.meta!.page} totalPages={result.meta!.totalPages} onPageChange={(p) => updateParams({ page: String(p) })} />
          </>
        )}
      </div>
    </section>
  );
}

export default function HospitalsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="container page-section">Loading…</div>}>
        <HospitalsContent />
      </Suspense>
    </AppShell>
  );
}
