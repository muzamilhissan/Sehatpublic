'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import LabCard from '@/components/LabCard';
import { Breadcrumbs, EmptyState, PageHeader, Pagination } from '@/components/ui';
import { getLabs, CITIES } from '@/data';
import { useCity } from '@/lib/city-context';

function LabsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { city } = useCity();
  const q = searchParams.get('q') ?? '';
  const citySlug = searchParams.get('city') ?? city.slug;
  const page = Number(searchParams.get('page') ?? '1');
  const [query, setQuery] = useState(q);
  const result = useMemo(() => getLabs({ q, citySlug, page, limit: 9 }), [q, citySlug, page]);

  const updateParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    if (!('page' in patch)) params.delete('page');
    router.push(`/labs?${params.toString()}`);
  };

  return (
    <section className="page-section">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Labs' }]} />
        <PageHeader title="Book Lab Tests" subtitle="Partner labs with home collection and walk-in options." />
        <div className="filter-bar">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search labs" onKeyDown={(e) => e.key === 'Enter' && updateParams({ q: query || null })} />
          <select value={citySlug} onChange={(e) => updateParams({ city: e.target.value })}>
            {CITIES.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <Link href="/labs/tests" className="btn btn-outline">Browse tests</Link>
          <Link href="/lab-orders/new" className="btn btn-primary">New lab order</Link>
        </div>
        {result.data.length === 0 ? (
          <EmptyState title="No labs found" />
        ) : (
          <>
            <div className="entity-grid">
              {result.data.map((lab) => <LabCard key={lab.id} lab={lab} />)}
            </div>
            <Pagination page={result.meta!.page} totalPages={result.meta!.totalPages} onPageChange={(p) => updateParams({ page: String(p) })} />
          </>
        )}
      </div>
    </section>
  );
}

export default function LabsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="container page-section">Loading…</div>}>
        <LabsContent />
      </Suspense>
    </AppShell>
  );
}
