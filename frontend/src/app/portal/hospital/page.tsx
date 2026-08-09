'use client';

import React, { useEffect, useState } from 'react';
import HospitalPortalLayout from '@/components/HospitalPortalLayout';
import { PortalQuickLink, PortalStatCard } from '@/components/PortalShell';
import { useAuth } from '@/lib/auth-context';
import { getHospitalProfile, listHospitalAppointments } from '@/lib/hospital-portal-store';
import type { Hospital } from '@/types';

export default function HospitalDashboardPage() {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [apptCount, setApptCount] = useState(0);

  useEffect(() => {
    if (!user?.hospitalId) return;
    const h = getHospitalProfile(user.hospitalId);
    setHospital(h);
    setApptCount(listHospitalAppointments(user.hospitalId).length);
  }, [user?.hospitalId]);

  return (
    <HospitalPortalLayout title="Hospital Dashboard">
      {!hospital ? (
        <p className="portal-empty">Loading…</p>
      ) : (
        <div className="portal-dash">
          <div className="portal-dash-intro">
            <p className="portal-dash-kicker">Facility overview</p>
            <h2 className="portal-dash-title">{hospital.name}</h2>
            <p className="portal-dash-sub">
              {hospital.city?.name}
              {hospital.area ? ` · ${hospital.area.name}` : ''}
              {hospital.address ? ` · ${hospital.address}` : ''}
            </p>
          </div>

          <div className="portal-stats">
            <PortalStatCard
              label="Verification"
              value={
                <span
                  className={`status-pill ${hospital.verificationStatus === 'APPROVED' ? 'CONFIRMED' : 'PENDING_PAYMENT'}`}
                >
                  {hospital.verificationStatus}
                </span>
              }
            />
            <PortalStatCard label="Type" value={hospital.type.replace('_', ' ')} />
            <PortalStatCard label="Departments" value={hospital.departments?.length ?? 0} />
            <PortalStatCard label="Facilities" value={hospital.facilities?.length ?? 0} />
            <PortalStatCard label="Doctors" value={hospital.doctors?.length ?? 0} />
            <PortalStatCard label="Appointments" value={apptCount} />
          </div>

          <div className="portal-section">
            <div className="portal-section-head">
              <h3>Quick actions</h3>
              <p>Jump into the areas you manage most often.</p>
            </div>
            <div className="portal-quick-grid">
              <PortalQuickLink
                href="/portal/hospital/profile"
                title="Hospital profile"
                description="Name, address, contact, and public description"
              />
              <PortalQuickLink
                href="/portal/hospital/departments"
                title="Departments"
                description="Organize clinical departments"
              />
              <PortalQuickLink
                href="/portal/hospital/facilities"
                title="Facilities"
                description="List equipment and amenities patients see"
              />
              <PortalQuickLink
                href="/portal/hospital/doctors"
                title="Hospital doctors"
                description="Add and manage doctors at your facility"
              />
              <PortalQuickLink
                href="/portal/hospital/appointments"
                title="Appointments"
                description="Bookings for doctors linked to this hospital"
              />
            </div>
          </div>
        </div>
      )}
    </HospitalPortalLayout>
  );
}
