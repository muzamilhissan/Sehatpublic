'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import DoctorCard from '@/components/DoctorCard';
import HospitalCard from '@/components/HospitalCard';
import LabCard from '@/components/LabCard';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { searchAll } from '@/data';
import { useCity } from '@/lib/city-context';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { city } = useCity();
  const q = searchParams.get('q') ?? '';
  const citySlug = searchParams.get('city') ?? city.slug;
  const [query, setQuery] = useState(q);

  const results = useMemo(() => searchAll(q, citySlug).data, [q, citySlug]);
  const empty = !q || (results.doctors.length === 0 && results.hospitals.length === 0 && results.labs.length === 0 && results.specialties.length === 0);

  return (
    <section className="page-section">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />
        <PageHeader title="Search" subtitle="Find doctors, hospitals, labs, and specialties." />
        <div className="filter-bar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            onKeyDown={(e) => e.key === 'Enter' && router.push(`/search?q=${encodeURIComponent(query)}&city=${citySlug}`)}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => router.push(`/search?q=${encodeURIComponent(query)}&city=${citySlug}`)}
          >
            Search
          </button>
        </div>

        {empty ? (
          <EmptyState title={q ? 'No results' : 'Start typing to search'} hint="Try “cardiologist”, “Chughtai”, or a hospital name." />
        ) : (
          <>
            {results.specialties.length > 0 && (
              <div className="search-results-group">
                <h2>Specialties</h2>
                <div className="chip-row">
                  {results.specialties.map((s) => (
                    <Link key={s.id} href={`/doctors?specialty=${s.slug}&city=${citySlug}`} className="chip">
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.doctors.length > 0 && (
              <div className="search-results-group">
                <h2>Doctors</h2>
                <div className="entity-grid">
                  {results.doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
                </div>
              </div>
            )}
            {results.hospitals.length > 0 && (
              <div className="search-results-group">
                <h2>Hospitals</h2>
                <div className="entity-grid">
                  {results.hospitals.map((h) => <HospitalCard key={h.id} hospital={h} />)}
                </div>
              </div>
            )}
            {results.labs.length > 0 && (
              <div className="search-results-group">
                <h2>Labs</h2>
                <div className="entity-grid">
                  {results.labs.map((l) => <LabCard key={l.id} lab={l} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="container page-section">Searching…</div>}>
        <SearchContent />
      </Suspense>
    </AppShell>
  );
}
