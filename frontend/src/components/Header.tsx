'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Premium SVG icon components for Specialties in Header Dropdown
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
    <path d="M12 8.5h-2.5l-1.5 3.5-1.5-5.5-1 2H3" strokeWidth="1.5" />
  </svg>
);

const NeurologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2h1z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 15.5 2h-1z" />
    <path d="M6 12h12M12 9h4M8 15h4" />
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
    <circle cx="12" cy="13" r="1.5" />
  </svg>
);

const GastroenterologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a9 9 0 0 0-9 9c0 4.25 3.25 7 9 7s9-2.75 9-7a9 9 0 0 0-9-9z" />
    <path d="M12 7c-2 0-3.5 1.5-3.5 3.5S10 14 12 14s3.5-1.5 3.5-3.5S14 7 12 7z" />
  </svg>
);

const GeneralPhysicianIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PlasticSurgeonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a8 8 0 0 0 8-8c0-5.5-3-9-8-12-5 3-8 6.5-8 12a8 8 0 0 0 8 8z" />
    <path d="M4 14h16" />
  </svg>
);

const UrologistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8 2 5 5 5 9v5c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-4-3-7-7-7z" />
    <path d="M9 14h6" />
  </svg>
);

const PsychiatristIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const DROPDOWN_SPECIALTIES = [
  { name: 'Gynecologist', icon: <GynecologistIcon /> },
  { name: 'Dentist', icon: <DentistIcon /> },
  { name: 'Dermatologist', icon: <DermatologistIcon /> },
  { name: 'Cardiologist', icon: <CardiologistIcon /> },
  { name: 'Neurologist', icon: <NeurologistIcon /> },
  { name: 'ENT Specialist', icon: <EntIcon /> },
  { name: 'Pediatrician', icon: <PediatricianIcon /> },
  { name: 'Gastroenterologist', icon: <GastroenterologistIcon /> },
  { name: 'General Physician', icon: <GeneralPhysicianIcon /> },
  { name: 'Plastic Surgeon', icon: <PlasticSurgeonIcon /> },
  { name: 'Urologist', icon: <UrologistIcon /> },
  { name: 'Psychiatrist', icon: <PsychiatristIcon /> },
];

interface HeaderProps {
  selectedCity: string;
  onChangeCity: () => void;
}

export default function Header({ selectedCity, onChangeCity }: HeaderProps) {
  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Logo */}
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
            <span className="logo-subtitle">
              PAKISTAN'S #1 CLINIC PLATFORM
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li className="nav-item has-mega-menu">
              <Link href="#" className="nav-link">
                Doctors
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
              
              {/* Mega Dropdown Menu */}
              <div className="mega-menu">
                <div className="mega-menu-content">
                  <div className="mega-menu-left">
                    <h3 className="mega-menu-heading">Choose a speciality</h3>
                    <Link href="#" className="mega-menu-btn">View all speciality</Link>
                    <Link href="#" className="mega-menu-btn">Join as a Doctor</Link>
                  </div>
                  <div className="mega-menu-grid">
                    {DROPDOWN_SPECIALTIES.map((spec, index) => (
                      <Link key={index} href="#" className="mega-menu-card">
                        <div className="mega-menu-icon-container">
                          {spec.icon}
                        </div>
                        <span className="mega-menu-name">{spec.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-item">
              <Link href="#" className="nav-link">Hospitals</Link>
            </li>
            <li className="nav-item">
              <Link href="#" className="nav-link">
                More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Actions (Location & Phone) */}
        <div className="header-actions">
          <button className="location-btn" onClick={onChangeCity}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {selectedCity || 'Select City'}
          </button>
          
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
