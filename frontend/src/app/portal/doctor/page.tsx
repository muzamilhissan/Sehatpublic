'use client';

import React, { useEffect, useState } from 'react';
import DoctorPortalLayout from '@/components/DoctorPortalLayout';
import { PortalQuickLink, PortalStatCard } from '@/components/PortalShell';
import { useAuth } from '@/lib/auth-context';
import { getDoctorProfile, listAppointmentsForPortalDoctor } from '@/lib/doctor-portal-store';
import type { Doctor } from '@/types';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [apptCount, setApptCount] = useState(0);

  useEffect(() => {
    if (!user?.doctorId) return;
    const d = getDoctorProfile(user.doctorId);
    setDoctor(d);
    setApptCount(listAppointmentsForPortalDoctor(user.doctorId).length);
  }, [user?.doctorId]);

  return (
    <DoctorPortalLayout title="Doctor Dashboard">
      {!doctor ? (
        <p className="portal-empty">Loading profile…</p>
      ) : (
        <div className="portal-dash">
          <div className="portal-dash-intro">
            <p className="portal-dash-kicker">Practice overview</p>
            <h2 className="portal-dash-title">
              Welcome back, {doctor.title}. {doctor.user.fullName}
            </h2>
            <p className="portal-dash-sub">
              {doctor.city?.name}
              {' · '}
              {doctor.isAcceptingPatients ? 'Accepting patients' : 'Bookings paused'}
            </p>
          </div>

          <div className="portal-stats">
            <PortalStatCard
              label="Verification"
              value={
                <span
                  className={`status-pill ${doctor.verificationStatus === 'APPROVED' ? 'CONFIRMED' : 'PENDING_PAYMENT'}`}
                >
                  {doctor.verificationStatus}
                </span>
              }
            />
            <PortalStatCard
              label="Accepting patients"
              value={doctor.isAcceptingPatients ? 'Yes' : 'No'}
            />
            <PortalStatCard
              label="Consultation fee"
              value={`${doctor.currency} ${Number(doctor.consultationFee).toLocaleString()}`}
            />
            <PortalStatCard label="Appointments" value={apptCount} />
            <PortalStatCard label="Clinics" value={doctor.clinics.length} />
            <PortalStatCard label="Rating" value={`★ ${Number(doctor.avgRating).toFixed(1)}`} />
          </div>

          <div className="portal-section">
            <div className="portal-section-head">
              <h3>Quick actions</h3>
              <p>Keep your public profile and schedule up to date.</p>
            </div>
            <div className="portal-quick-grid">
              <PortalQuickLink
                href="/portal/doctor/profile"
                title="Edit profile"
                description="Bio, fees, specialties, and city"
              />
              <PortalQuickLink
                href="/portal/doctor/clinics"
                title="Manage clinics"
                description={`${doctor.clinics.length} active location${doctor.clinics.length === 1 ? '' : 's'}`}
              />
              <PortalQuickLink
                href="/portal/doctor/availability"
                title="Set availability"
                description={`${doctor.availabilities?.length ?? 0} weekly windows`}
              />
              <PortalQuickLink
                href="/portal/doctor/credentials"
                title="Credentials"
                description="Education, experience, and languages"
              />
              <PortalQuickLink
                href="/portal/doctor/appointments"
                title="Appointment inbox"
                description="View and update booking status"
              />
            </div>
          </div>
        </div>
      )}
    </DoctorPortalLayout>
  );
}
