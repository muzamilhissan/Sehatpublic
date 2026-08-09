'use client';

import React from 'react';
import Link from 'next/link';

export function EmptyState({ title, hint, actionHref, actionLabel }: {
  title: string;
  hint?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn-primary" style={{ marginTop: 16 }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          {i < items.length - 1 && <span className="breadcrumb-sep">/</span>}
        </span>
      ))}
    </nav>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn btn-outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        className="btn btn-outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export function SlotPicker({
  slots,
  selected,
  onSelect,
}: {
  slots: string[];
  selected: string | null;
  onSelect: (iso: string) => void;
}) {
  if (slots.length === 0) {
    return <p className="entity-card-muted">No slots available for this date.</p>;
  }
  return (
    <div className="slot-grid">
      {slots.map((iso) => {
        const time = new Date(iso).toLocaleTimeString('en-PK', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return (
          <button
            key={iso}
            type="button"
            className={`slot-chip ${selected === iso ? 'active' : ''}`}
            onClick={() => onSelect(iso)}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  );
}
