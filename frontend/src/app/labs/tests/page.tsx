'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { getLabTests } from '@/data';

export default function LabTestsPage() {
  const [q, setQ] = useState('');
  const tests = useMemo(() => getLabTests(q).data, [q]);

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Labs', href: '/labs' }, { label: 'Tests' }]} />
          <PageHeader title="Lab test catalog" subtitle="Schema-shaped LabTest records used across partner labs." />
          <div className="filter-bar">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tests" />
            <Link href="/lab-orders/new" className="btn btn-primary">Order selected tests</Link>
          </div>
          {tests.length === 0 ? (
            <EmptyState title="No tests found" />
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Sample</th>
                  <th>Turnaround</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div className="entity-card-muted">{t.description}</div>
                    </td>
                    <td>{t.category}</td>
                    <td>{t.sampleType ?? '—'}</td>
                    <td>{t.turnaroundHours ? `${t.turnaroundHours}h` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppShell>
  );
}
