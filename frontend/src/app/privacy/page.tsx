'use client';

import React from 'react';
import AppShell from '@/components/AppShell';
import { Breadcrumbs, PageHeader } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <AppShell>
      <section className="page-section">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
          <PageHeader title="Privacy Policy" subtitle="How Sehatdoc handles patient and provider data." />
          <div className="legal-content">
            <p>Last updated: August 9, 2026</p>
            <h2>Information we collect</h2>
            <p>We collect account details such as phone number, name, appointment history, dependents, and payment proofs required to fulfil bookings.</p>
            <h2>How we use information</h2>
            <p>Data is used to schedule appointments, process payments, deliver lab reports, and improve marketplace reliability.</p>
            <h2>Sharing</h2>
            <p>Relevant booking details are shared with the selected doctor, hospital, or lab only as needed to deliver care.</p>
            <h2>Security</h2>
            <p>Access tokens, OTP challenges, and documents are protected using industry-standard practices described in our backend security design.</p>
            <h2>Contact</h2>
            <p>Questions: support@sehatdoc.com or 03107813247.</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
