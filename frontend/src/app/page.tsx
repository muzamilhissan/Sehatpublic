'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { getMainSpecialties } from '@/data';
import { useCity } from '@/lib/city-context';

const ICON_PATHS: Record<string, React.ReactNode> = {
  gynecologist: <path d="M12 22a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 12V2M9 5h6" />,
  gastroenterologist: <path d="M12 3a9 9 0 0 0-9 9c0 4.25 3.25 7 9 7s9-2.75 9-7a9 9 0 0 0-9-9z" />,
  dentist: <path d="M12 2C8.5 2 7 4.5 7 7c0 3.5 1.5 5.5 3 6.5C10.5 15 11 17 11 19c0 1.5.5 3 1 3s1-1.5 1-3c0-2 .5-4 1-5.5 1.5-1 3-3 3-6.5 0-2.5-1.5-5-5-5z" />,
  dermatologist: <path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-4a4 4 0 0 1 4-4zM3 18c0-3 3-4 5-4h8c2 0 5 1 5 4v4H3v-4z" />,
  cardiologist: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  neurologist: <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2h1z" />,
  'ent-specialist': <path d="M10 2v20M5 5h14M8 10h8M6 15h12M4 20h16" />,
  pediatrician: <><circle cx="12" cy="7" r="4" /><path d="M5 22v-3a7 7 0 0 1 14 0v3" /></>,
  urologist: <path d="M12 2C8 2 5 5 5 9v5c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-4-3-7-7-7z" />,
};

export default function Home() {
  const { city } = useCity();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const specialties = getMainSpecialties();

  const onSearch = () => {
    const q = searchQuery.trim();
    router.push(`/search?q=${encodeURIComponent(q)}&city=${city.slug}`);
  };

  return (
    <AppShell>
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            We Help You To Find The Best Doctors And Hospitals In {city.name}
          </h1>
          <p className="hero-subtitle">
            Search, verify credentials, consult online, or book in-person appointments instantly.
          </p>
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder={`Search for doctors, labs, hospitals, specialties in ${city.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              />
            </div>
            <button className="search-button" type="button" onClick={onSearch}>Search</button>
          </div>
        </div>
      </section>

      <section className="section-wrapper">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Choose Our Top Rated Doctors from The Specialties Below!</h2>
            <p className="section-subtitle">Connect with experienced professionals across specialized branches of medicine.</p>
          </div>
          <div className="specialty-grid">
            {specialties.map((spec) => (
              <Link
                href={`/doctors?specialty=${spec.slug}&city=${city.slug}`}
                key={spec.id}
                className="specialty-card"
              >
                <div className="specialty-icon-container">
                  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {ICON_PATHS[spec.slug] ?? <path d="M12 8v8M8 12h8" />}
                  </svg>
                </div>
                <span className="specialty-name">{spec.name}</span>
              </Link>
            ))}
          </div>
          <div className="view-all-container">
            <Link href="/specialties" className="btn btn-outline">View All Specialties</Link>
          </div>
        </div>
      </section>

      <section className="section-wrapper" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sehatdoc! One Stop Solution for Your Health Care Needs</h2>
            <p className="section-subtitle">Quality healthcare options simplified for you and your family.</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="service-title">Book Your Appointment</h3>
              <p className="service-description">
                Choose from verified doctors across top medical clinics and consult in-person.
              </p>
              <Link href={`/doctors?city=${city.slug}`} className="service-btn service-primary-btn">Book Now</Link>
            </div>
            <div className="service-card">
              <div className="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15.6 11.6L22 7v10l-6.4-4.6z" />
                  <rect x="2" y="5" width="14" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <h3 className="service-title">Consult Doctor Now</h3>
              <p className="service-description">
                Skip the waiting room. Connect with certified doctors via secure online video consultations.
              </p>
              <Link href="/consult" className="service-btn service-primary-btn">Consult Now</Link>
            </div>
            <div className="service-card">
              <div className="service-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 21H2V3h10v18M12 7h6v14M16 11h2M16 15h2" />
                </svg>
              </div>
              <h3 className="service-title">Find Best Hospitals</h3>
              <p className="service-description">
                Locate top healthcare institutions and hospitals near your region with direct emergency lines.
              </p>
              <Link href={`/hospitals?city=${city.slug}`} className="service-btn service-primary-btn">Find Now</Link>
            </div>
          </div>

          <div className="secondary-services-row">
            <Link href="/labs" className="secondary-service-bar">
              <div className="secondary-service-info">
                <svg className="secondary-service-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 2v8L4.35 19.6a1 1 0 0 0 .85 1.4h13.6a1 1 0 0 0 .85-1.4L14 10V2" />
                  <line x1="8.5" y1="2" x2="15.5" y2="2" />
                </svg>
                <div>
                  <h4 className="secondary-service-title">Book Lab Tests</h4>
                  <p className="secondary-service-subtitle">Get professional testing at home. Save up to 20% OFF.</p>
                </div>
              </div>
              <span className="secondary-service-link">Book Test &rarr;</span>
            </Link>
            <Link href="/medicines" className="secondary-service-bar">
              <div className="secondary-service-info">
                <svg className="secondary-service-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                  <path d="M12 7v10M7 12h10" />
                </svg>
                <div>
                  <h4 className="secondary-service-title">Order Medicines</h4>
                  <p className="secondary-service-subtitle">Upload prescriptions for quick home delivery.</p>
                </div>
              </div>
              <span className="secondary-service-link">Order Now &rarr;</span>
            </Link>
            <Link href="/offers" className="secondary-service-bar">
              <div className="secondary-service-info">
                <svg className="secondary-service-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                <div>
                  <h4 className="secondary-service-title">Discounts & Offers</h4>
                  <p className="secondary-service-subtitle">Check exclusive active medical savings.</p>
                </div>
              </div>
              <span className="secondary-service-link">View All &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="join-doctor-section">
        <div className="container join-doctor-container">
          <div className="join-doctor-image">
            <Image
              src="/doctors_heart_collage.png"
              alt="Join Sehatdoc as a Doctor"
              width={420}
              height={420}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="join-doctor-info">
            <h2 className="join-doctor-title">Join SehatDoc As A Doctor</h2>
            <p className="join-doctor-subtitle">Reach Millions Of Patients</p>
            <ul className="join-doctor-bullets">
              <li><span className="bullet-arrow">&rsaquo;</span> Get more appointments through real patients</li>
              <li><span className="bullet-arrow">&rsaquo;</span> Build your online presence with free digital market</li>
              <li><span className="bullet-arrow">&rsaquo;</span> Get your own branded software for better customer experience</li>
            </ul>
            <Link href="/auth/signup?role=DOCTOR" className="btn join-doctor-btn">Signup Now</Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
