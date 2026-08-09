'use client';

import React from 'react';
import PortalShell from '@/components/PortalShell';

const NAV = [
  { href: '/portal/hospital', label: 'Dashboard' },
  { href: '/portal/hospital/profile', label: 'Profile' },
  { href: '/portal/hospital/departments', label: 'Departments' },
  { href: '/portal/hospital/facilities', label: 'Facilities' },
  { href: '/portal/hospital/doctors', label: 'Doctors' },
  { href: '/portal/hospital/appointments', label: 'Appointments' },
];

export default function HospitalPortalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <PortalShell title={title} requiredRole="HOSPITAL_ADMIN" nav={NAV}>
      {children}
    </PortalShell>
  );
}
