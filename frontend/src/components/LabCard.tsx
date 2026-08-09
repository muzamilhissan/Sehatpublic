'use client';

import React from 'react';
import Link from 'next/link';
import type { Lab } from '@/types';

export default function LabCard({ lab }: { lab: Lab }) {
  return (
    <article className="entity-card">
      <div className="entity-card-top">
        <div className="avatar-circle lab-avatar">L</div>
        <div className="entity-card-meta">
          <h3 className="entity-card-title">{lab.name}</h3>
          <p className="entity-card-subtitle">{lab.city.name}</p>
          <p className="entity-card-muted">{lab.address}</p>
        </div>
        <div className="rating-badge">
          ★ {Number(lab.avgRating).toFixed(1)}
          <span>({lab.reviewCount})</span>
        </div>
      </div>
      <div className="entity-card-footer">
        <span className="chip">{lab.supportsHomeCollection ? 'Home collection' : 'Walk-in only'}</span>
        <Link href={`/labs/${lab.id}`} className="btn btn-primary">
          View Lab
        </Link>
      </div>
    </article>
  );
}
