'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, PageHeader } from '@/components/ui';
import { createMockLabOrder, getLabById, getLabs, LAB_TESTS } from '@/data';
import { useCity } from '@/lib/city-context';
import type { CollectionType, LabOrder } from '@/types';

function LabOrderContent() {
  const searchParams = useSearchParams();
  const { city } = useCity();
  const labs = useMemo(() => getLabs({ citySlug: city.slug, limit: 50 }).data, [city.slug]);
  const [labId, setLabId] = useState(searchParams.get('labId') ?? labs[0]?.id ?? '');
  const [selected, setSelected] = useState<string[]>([]);
  const [collectionType, setCollectionType] = useState<CollectionType>('HOME');
  const [order, setOrder] = useState<LabOrder | null>(null);

  const lab = getLabById(labId).data;

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = () => {
    if (!labId || selected.length === 0) return;
    setOrder(createMockLabOrder({ labId, testIds: selected, collectionType }));
  };

  if (order) {
    return (
      <div className="detail-panel">
        <h2>Lab order placed</h2>
        <p className="chip" style={{ margin: '12px 0' }}><span className={`status-pill ${order.status}`}>{order.status}</span></p>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Lab:</strong> {order.lab.name}</p>
        <p><strong>Collection:</strong> {order.collectionType}</p>
        <p><strong>Total:</strong> {order.currency} {Number(order.totalAmount).toLocaleString()}</p>
        <ul>
          {order.items.map((it) => (
            <li key={it.id} className="entity-card-muted">{it.nameSnapshot} — {it.currency} {it.priceSnapshot}</li>
          ))}
        </ul>
        <div className="form-actions">
          <Link href="/labs" className="btn btn-primary">Back to labs</Link>
          <Link href="/account" className="btn btn-outline">Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-panel form-grid">
      <div className="form-field">
        <label>Lab</label>
        <select value={labId} onChange={(e) => setLabId(e.target.value)}>
          {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>
      <div className="form-field">
        <label>Collection type</label>
        <select value={collectionType} onChange={(e) => setCollectionType(e.target.value as CollectionType)}>
          <option value="HOME" disabled={!lab?.supportsHomeCollection}>HOME</option>
          <option value="WALK_IN">WALK_IN</option>
        </select>
      </div>
      <div className="form-field">
        <label>Select tests</label>
        <div className="chip-row">
          {LAB_TESTS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`slot-chip ${selected.includes(t.id) ? 'active' : ''}`}
              onClick={() => toggle(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-primary" disabled={!selected.length} onClick={submit}>
          Place lab order
        </button>
      </div>
    </div>
  );
}

export default function NewLabOrderPage() {
  return (
    <AppShell>
      <section className="page-section">
        <div className="container" style={{ maxWidth: 800 }}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Labs', href: '/labs' }, { label: 'New order' }]} />
          <PageHeader title="New lab order" subtitle="Creates a mock LabOrder with fee snapshots." />
          <Suspense fallback={<p>Loading…</p>}>
            <LabOrderContent />
          </Suspense>
        </div>
      </section>
    </AppShell>
  );
}
