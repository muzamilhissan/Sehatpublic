'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';

/** Legacy join route — sends doctors to role-aware signup. */
export default function DoctorRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/signup?role=DOCTOR');
  }, [router]);

  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <p className="entity-card-muted">Redirecting to doctor signup…</p>
        </div>
      </section>
    </AppShell>
  );
}
