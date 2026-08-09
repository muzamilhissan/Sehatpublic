'use client';

import React, { useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, EmptyState, PageHeader } from '@/components/ui';
import { getMedicines } from '@/data';
import type { Medicine } from '@/types';

export default function MedicinesPage() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Medicine | null>(null);
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const medicines = useMemo(() => getMedicines(q).data, [q]);

  const addToCart = (m: Medicine) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === m.id);
      if (existing) return prev.map((c) => (c.id === m.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id: m.id, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, line) => {
    const med = medicines.find((m) => m.id === line.id) ?? getMedicines().data.find((m) => m.id === line.id);
    return sum + Number(med?.price ?? 0) * line.qty;
  }, 0);

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Medicines' }]} />
          <PageHeader
            title="Order Medicines"
            subtitle="Frontend-only health store catalog (no Prisma medicine model in v1)."
          />
          <div className="filter-bar">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines" />
            <span className="chip">Cart: {cart.reduce((n, c) => n + c.qty, 0)} · PKR {cartTotal.toLocaleString()}</span>
          </div>
          {medicines.length === 0 ? (
            <EmptyState title="No medicines found" />
          ) : (
            <div className="entity-grid">
              {medicines.map((m) => (
                <article key={m.id} className="entity-card">
                  <h3 className="entity-card-title">{m.name}</h3>
                  <p className="entity-card-subtitle">{m.brand} · {m.form}{m.strength ? ` · ${m.strength}` : ''}</p>
                  <p className="entity-card-muted">{m.description}</p>
                  <div className="chip-row">
                    <span className="chip">{m.category}</span>
                    {m.requiresRx && <span className="chip">Requires Rx</span>}
                    {!m.inStock && <span className="chip">Out of stock</span>}
                  </div>
                  <div className="entity-card-footer">
                    <strong>{m.currency} {Number(m.price).toLocaleString()}</strong>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-outline" onClick={() => setSelected(m)}>Details</button>
                      <button type="button" className="btn btn-primary" disabled={!m.inStock} onClick={() => addToCart(m)}>Add</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {selected && (
            <div className="detail-panel" style={{ marginTop: 24 }}>
              <h3>{selected.name}</h3>
              <p className="entity-card-muted">{selected.description}</p>
              <p>Brand: {selected.brand}</p>
              <p>Form: {selected.form} {selected.strength}</p>
              <p>Price: {selected.currency} {selected.price}</p>
              <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setSelected(null)}>Close</button>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
