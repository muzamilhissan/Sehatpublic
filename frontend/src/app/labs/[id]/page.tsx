'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { getLabById } from '@/data';

export default function LabDetailPage() {
  const params = useParams<{ id: string }>();
  const lab = getLabById(params.id).data;

  if (!lab) {
    return (
      <AppShell>
        <section className="page-section">
          <div className="container">
            <EmptyState title="Lab not found" actionHref="/labs" actionLabel="Back to labs" />
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Labs', href: '/labs' }, { label: lab.name }]} />
          <PageHeader title={lab.name} subtitle={`${lab.city.name} · ★ ${Number(lab.avgRating).toFixed(1)} (${lab.reviewCount})`} />
          <div className="detail-layout">
            <div className="detail-panel">
              <p style={{ color: 'var(--text-muted)' }}>{lab.description}</p>
              <div className="detail-section">
                <h3>Contact</h3>
                <p className="entity-card-muted">{lab.address}</p>
                {lab.phone && <p className="entity-card-muted">{lab.phone}</p>}
              </div>
              <div className="detail-section">
                <h3>Test prices</h3>
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>TAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lab.testPrices?.map((tp) => (
                      <tr key={tp.id}>
                        <td>{tp.labTest.name}</td>
                        <td>{tp.labTest.category}</td>
                        <td>{tp.currency} {Number(tp.price).toLocaleString()}</td>
                        <td>{tp.labTest.turnaroundHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="detail-section">
                <h3>Packages</h3>
                <div className="entity-grid">
                  {lab.packages?.map((pkg) => (
                    <article key={pkg.id} className="entity-card">
                      <h3 className="entity-card-title">{pkg.name}</h3>
                      <p className="entity-card-muted">{pkg.description}</p>
                      <strong>{pkg.currency} {Number(pkg.price).toLocaleString()}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </div>
            <aside className="side-panel">
              <span className="chip">{lab.supportsHomeCollection ? 'Home collection available' : 'Walk-in only'}</span>
              <Link href={`/lab-orders/new?labId=${lab.id}`} className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
                Book tests here
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
