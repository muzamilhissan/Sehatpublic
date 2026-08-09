'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { getDropdownSpecialties } from '@/data';
import { useCity } from '@/lib/city-context';

const GynecologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
    <path d="M12 12V2M9 5h6M12 16v3M10 18h4" />
  </svg>
);
const DentistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.5 2 7 4.5 7 7c0 3.5 1.5 5.5 3 6.5C10.5 15 11 17 11 19c0 1.5.5 3 1 3s1-1.5 1-3c0-2 .5-4 1-5.5 1.5-1 3-3 3-6.5 0-2.5-1.5-5-5-5z" />
    <path d="M9 7c0-1.5 1-2 3-2s3 .5 3 2" />
  </svg>
);
const DermatologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-4a4 4 0 0 1 4-4z" />
    <path d="M3 18c0-3 3-4 5-4h8c2 0 5 1 5 4v4H3v-4z" />
  </svg>
);
const CardiologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const NeurologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2h1z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 15.5 2h-1z" />
  </svg>
);
const EntIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v20M5 5h14M8 10h8M6 15h12M4 20h16" />
  </svg>
);
const PediatricianIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5 22v-3a7 7 0 0 1 14 0v3" />
  </svg>
);
const GastroenterologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a9 9 0 0 0-9 9c0 4.25 3.25 7 9 7s9-2.75 9-7a9 9 0 0 0-9-9z" />
  </svg>
);
const GeneralPhysicianIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const PlasticSurgeonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a8 8 0 0 0 8-8c0-5.5-3-9-8-12-5 3-8 6.5-8 12a8 8 0 0 0 8 8z" />
  </svg>
);
const UrologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 5 5 5 9v5c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-4-3-7-7-7z" />
  </svg>
);
const PsychiatristIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
  </svg>
);

const ICON_MAP: Record<string, React.ReactNode> = {
  gynecologist: <GynecologistIcon />,
  dentist: <DentistIcon />,
  dermatologist: <DermatologistIcon />,
  cardiologist: <CardiologistIcon />,
  neurologist: <NeurologistIcon />,
  'ent-specialist': <EntIcon />,
  pediatrician: <PediatricianIcon />,
  gastroenterologist: <GastroenterologistIcon />,
  'general-physician': <GeneralPhysicianIcon />,
  'plastic-surgeon': <PlasticSurgeonIcon />,
  urologist: <UrologistIcon />,
  psychiatrist: <PsychiatristIcon />,
};

interface HeaderProps {
  selectedCity: string;
  onChangeCity: () => void;
}

export default function Header({ selectedCity, onChangeCity }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { city } = useCity();
  const specialties = getDropdownSpecialties();

  return (
    <header className="header-wrapper">
      <div className="container header-container">
        <Link href="/" className="logo-container group">
          <div className="logo-image-wrapper">
            <Image
              src="/logos/logo-optimized copy.png"
              alt="Sehat Doc Logo"
              width={38}
              height={38}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div className="logo-text-wrapper">
            <span className="logo-title">
              SEHAT<span>DOC</span>
            </span>
            <span className="logo-subtitle">PAKISTAN&apos;S #1 CLINIC PLATFORM</span>
          </div>
        </Link>

        <nav>
          <ul className="nav-links">
            <li className="nav-item has-mega-menu">
              <Link href={`/doctors?city=${city.slug}`} className="nav-link">
                Doctors
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
              <div className="mega-menu">
                <div className="mega-menu-content">
                  <div className="mega-menu-left">
                    <h3 className="mega-menu-heading">Choose a speciality</h3>
                    <Link href="/specialties" className="mega-menu-btn">View all speciality</Link>
                    <Link href="/auth/signup?role=DOCTOR" className="mega-menu-btn">Join as a Doctor</Link>
                  </div>
                  <div className="mega-menu-grid">
                    {specialties.map((spec) => (
                      <Link
                        key={spec.id}
                        href={`/doctors?specialty=${spec.slug}&city=${city.slug}`}
                        className="mega-menu-card"
                      >
                        <div className="mega-menu-icon-container">
                          {ICON_MAP[spec.slug] ?? <GeneralPhysicianIcon />}
                        </div>
                        <span className="mega-menu-name">{spec.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-item">
              <Link href={`/hospitals?city=${city.slug}`} className="nav-link">Hospitals</Link>
            </li>
            <li className="nav-item">
              <span className="nav-link" style={{ cursor: 'pointer' }}>
                More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
              <div className="nav-more-menu">
                <Link href="/consult">Online Consultation</Link>
                <Link href="/labs">Lab Tests</Link>
                <Link href="/medicines">Medicines</Link>
                <Link href="/offers">Offers</Link>
                <Link href="/auth/signup?role=HOSPITAL_ADMIN">Join as Hospital</Link>
                <Link href="/account">My Account</Link>
              </div>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <button className="location-btn" onClick={onChangeCity} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {selectedCity || 'Select City'}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                href={
                  user?.activeRole === 'DOCTOR'
                    ? '/portal/doctor'
                    : user?.activeRole === 'HOSPITAL_ADMIN'
                      ? '/portal/hospital'
                      : '/account'
                }
                className="phone-link"
                style={{ marginRight: 8 }}
              >
                {user?.activeRole === 'DOCTOR'
                  ? 'Doctor Portal'
                  : user?.activeRole === 'HOSPITAL_ADMIN'
                    ? 'Hospital Portal'
                    : user?.fullName?.split(' ')[0] ?? 'Account'}
              </Link>
              <button type="button" className="btn btn-outline" style={{ padding: '8px 12px' }} onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signup" className="btn btn-outline" style={{ padding: '8px 14px' }}>
                Sign up
              </Link>
              <Link href="/auth/login" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                Login
              </Link>
            </>
          )}

          <a href="tel:03107813247" className="phone-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            03107813247
          </a>
        </div>
      </div>
    </header>
  );
}
