'use client';

import React from 'react';
import Link from 'next/link';
import type { Hospital } from '@/types';

export default function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <article className="entity-card">
      <div className="entity-card-top">
        <div className="avatar-circle hospital-avatar">H</div>
        <div className="entity-card-meta">
          <h3 className="entity-card-title">{hospital.name}</h3>
          <p className="entity-card-subtitle">
            {hospital.type.replace('_', ' ')} · {hospital.city.name}
          </p>
          <p className="entity-card-muted">{hospital.area?.name ?? hospital.address}</p>
        </div>
        <div className="rating-badge">
          ★ {Number(hospital.avgRating).toFixed(1)}
          <span>({hospital.reviewCount})</span>
        </div>
      </div>
      <p className="entity-card-line">{hospital.description}</p>
      <div className="entity-card-footer">
        <span className="chip">{hospital.facilities?.length ?? 0} facilities</span>
        <Link href={`/hospitals/${hospital.id}`} className="btn btn-primary">
          View Hospital
        </Link>
      </div>
    </article>
  );
}
