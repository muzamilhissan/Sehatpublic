'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand-info">
            <Link href="/" className="footer-logo">
              sehat<span>doc</span>
            </Link>
            <p className="footer-brand-desc">
              Sehatdoc is a leading digital healthcare platform in Pakistan, connecting patients with the best certified doctors, hospitals, and laboratories for virtual and in-person medical support.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-icon" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="footer-social-icon" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" className="footer-social-icon" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <h4 className="footer-nav-title">Services</h4>
            <ul className="footer-links">
              <li><Link href="#" className="footer-link">Find a Doctor</Link></li>
              <li><Link href="#" className="footer-link">Online Consultation</Link></li>
              <li><Link href="#" className="footer-link">Book Lab Tests</Link></li>
              <li><Link href="#" className="footer-link">Hospitals List</Link></li>
              <li><Link href="#" className="footer-link">Order Medicine</Link></li>
            </ul>
          </div>

          {/* Column 2: Popular Cities */}
          <div>
            <h4 className="footer-nav-title">Popular Cities</h4>
            <ul className="footer-links">
              <li><Link href="#" className="footer-link">Doctors in Lahore</Link></li>
              <li><Link href="#" className="footer-link">Doctors in Karachi</Link></li>
              <li><Link href="#" className="footer-link">Doctors in Islamabad</Link></li>
              <li><Link href="#" className="footer-link">Doctors in Faisalabad</Link></li>
              <li><Link href="#" className="footer-link">Doctors in Multan</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="footer-nav-title">Contact Us</h4>
            <div className="footer-contact-item">
              <svg className="footer-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>12-B, Main Boulevard, Gulberg III, Lahore, Pakistan</span>
            </div>
            <div className="footer-contact-item">
              <svg className="footer-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>03171777509</span>
            </div>
            <div className="footer-contact-item">
              <svg className="footer-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>support@sehatdoc.com</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Sehatdoc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="#" className="footer-link">Privacy Policy</Link>
            <Link href="#" className="footer-link">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
