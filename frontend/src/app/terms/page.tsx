'use client';

import React from 'react';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, PageHeader } from '@/components/ui';

export default function TermsPage() {
  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />
          <PageHeader title="Terms of Service" subtitle="Rules for using the Sehatdoc marketplace." />
          <div className="legal-content">
            <p>Last updated: August 9, 2026</p>
            <h2>Service</h2>
            <p>Sehatdoc connects patients with doctors, hospitals, and labs. We are not an emergency service. Call local emergency numbers for urgent care.</p>
            <h2>Bookings & payments</h2>
            <p>Appointments may require payment confirmation (cash or manual transfer). Unpaid holds may expire according to paymentExpiresAt.</p>
            <h2>Cancellations</h2>
            <p>Free cancellation windows follow each doctor&apos;s freeCancelHours setting.</p>
            <h2>Provider verification</h2>
            <p>Listed doctors and facilities must pass verificationStatus APPROVED before appearing in public search.</p>
            <h2>Contact</h2>
            <p>support@sehatdoc.com · 03107813247</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
