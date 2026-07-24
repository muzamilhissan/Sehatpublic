'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  selectedCity: string;
  onChangeCity: () => void;
}

export default function Header({ selectedCity, onChangeCity }: HeaderProps) {
  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Logo */}
        <Link href="/" className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-teal)' }}>
            {/* Custom high-end medical heartbeat cross */}
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          sehat<span>doc</span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li className="nav-item">
              <Link href="#" className="nav-link">
                Doctors
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="#" className="nav-link">
                Online Consultation
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="#" className="nav-link">Hospitals</Link>
            </li>
            <li className="nav-item">
              <Link href="#" className="nav-link">
                Lab Tests
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="#" className="nav-link" style={{ 
                color: 'var(--text-light)', 
                backgroundColor: 'var(--primary-navy)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                Deals & Discounts
              </Link>
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
          
          <a href="tel:03171777509" className="phone-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            03171777509
          </a>
        </div>
      </div>
    </header>
  );
}
