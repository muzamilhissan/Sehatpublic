'use client';

import React from 'react';
import Link from 'next/link';
import type { Doctor } from '@/types';

function formatFee(fee: string, currency: string) {
  return `${currency} ${Number(fee).toLocaleString()}`;
}

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  const primary = doctor.specialties.find((s) => s.isPrimary)?.specialty ?? doctor.specialties[0]?.specialty;
  const clinic = doctor.clinics[0];

  return (
    <article className="entity-card">
      <div className="entity-card-top">
        <div className="avatar-circle">{doctor.user.fullName.charAt(0)}</div>
        <div className="entity-card-meta">
          <h3 className="entity-card-title">
            {doctor.title}. {doctor.user.fullName}
          </h3>
          <p className="entity-card-subtitle">{primary?.name ?? 'Specialist'}</p>
          <p className="entity-card-muted">
            {doctor.yearsExperience} yrs exp · {doctor.city?.name}
          </p>
        </div>
        <div className="rating-badge">
          ★ {Number(doctor.avgRating).toFixed(1)}
          <span>({doctor.reviewCount})</span>
        </div>
      </div>
      {clinic && <p className="entity-card-line">{clinic.name}</p>}
      <div className="entity-card-footer">
        <strong>{formatFee(doctor.consultationFee, doctor.currency)}</strong>
        <Link href={`/doctors/${doctor.id}`} className="btn btn-primary">
          View Profile
        </Link>
      </div>
    </article>
  );
}
