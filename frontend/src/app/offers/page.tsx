'use client';

import React from 'react';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, PageHeader } from '@/components/ui';
import { getOffers } from '@/data';

export default function OffersPage() {
  const offers = getOffers().data;

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Offers' }]} />
          <PageHeader title="Discounts & Offers" subtitle="Active medical savings you can apply during booking." />
          <div className="entity-grid">
            {offers.map((o) => (
              <article key={o.id} className="entity-card">
                <div className="chip-row">
                  <span className="chip">{o.code}</span>
                  <span className="chip">{o.appliesTo}</span>
                </div>
                <h3 className="entity-card-title">{o.title}</h3>
                <p className="entity-card-muted">{o.description}</p>
                <p>
                  <strong>
                    {o.discountPercent != null
                      ? `${o.discountPercent}% off`
                      : `${o.currency} ${o.discountAmount} off`}
                  </strong>
                </p>
                <p className="entity-card-muted">Valid until {o.validUntil}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
