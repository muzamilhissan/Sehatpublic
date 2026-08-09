'use client';

import React from 'react';
import PortalShell from '@/components/PortalShell';

const NAV = [
  { href: '/portal/doctor', label: 'Dashboard' },
  { href: '/portal/doctor/profile', label: 'Profile' },
  { href: '/portal/doctor/clinics', label: 'Clinics' },
  { href: '/portal/doctor/availability', label: 'Availability' },
  { href: '/portal/doctor/credentials', label: 'Credentials' },
  { href: '/portal/doctor/appointments', label: 'Appointments' },
];

export default function DoctorPortalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PortalShell title={title} requiredRole="DOCTOR" nav={NAV}>
      {children}
    </PortalShell>
  );
}
