'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CitySelector from '../components/CitySelector';

// Premium SVG icon components for Specialties
const GynecologistIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
    <path d="M12 12V2M9 5h6M12 16v3M10 18h4" />
  </svg>
);

const DentistIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C8.5 2 7 4.5 7 7c0 3.5 1.5 5.5 3 6.5C10.5 15 11 17 11 19c0 1.5.5 3 1 3s1-1.5 1-3c0-2 .5-4 1-5.5 1.5-1 3-3 3-6.5 0-2.5-1.5-5-5-5z" />
    <path d="M9 7c0-1.5 1-2 3-2s3 .5 3 2" />
  </svg>
);

const DermatologistIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-4a4 4 0 0 1 4-4z" />
    <path d="M3 18c0-3 3-4 5-4h8c2 0 5 1 5 4v4H3v-4z" />
  </svg>
);

const CardiologistIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 8.5h-2.5l-1.5 3.5-1.5-5.5-1 2H3" strokeWidth="1.5" />
  </svg>
);

const GastroenterologistIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3a9 9 0 0 0-9 9c0 4.25 3.25 7 9 7s9-2.75 9-7a9 9 0 0 0-9-9z" />
    <path d="M12 7c-2 0-3.5 1.5-3.5 3.5S10 14 12 14s3.5-1.5 3.5-3.5S14 7 12 7z" />
  </svg>
);

const NeurologistIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2h1z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 15.5 2h-1z" />
    <path d="M6 12h12M12 9h4M8 15h4" />
  </svg>
);

const EntIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 2v20M5 5h14M8 10h8M6 15h12M4 20h16" />
  </svg>
);

const PediatricianIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="7" r="4" />
    <path d="M5 22v-3a7 7 0 0 1 14 0v3" />
    <circle cx="12" cy="13" r="1.5" />
  </svg>
);

const UrologistIcon = () => (
  <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C8 2 5 5 5 9v5c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-4-3-7-7-7z" />
    <path d="M9 14h6" />
  </svg>
);

// Complete Directory of specialties (displayed on View All)
const ALL_SPECIALTIES = [
  'Gynecologist', 'Dermatologist', 'Gastroenterologist', 'Urologist',
  'Cardiologist', 'Neurologist', 'Psychiatrist', 'General Physician',
  'Dentist', 'Oral and maxillofacial surgeon', 'Internal Medicine Specialist', 'Audiometrist',
  'Infertility Consultant', 'Dietitian', 'Thoracic Surgeon', 'Male Infertility Specialist',
  'Aesthetic Medicine Specialist', 'Maternal Fetal Medicine Specialist', 'Reproductive Endocrinologist', 'Family Medicine',
  'Regenerative Medicine', 'paediatrics', 'Female Reproductive Health', 'Alternative Medicine Practitioner',
  'Tibb Specialist', 'Spinal Surgeon', 'Orthodontist', 'Breast Surgeon',
  'Anesthesia', 'Child Specialist', 'Diabetologist', 'Hepatologist',
  'Aesthetic Physician', 'Implant Specialist', 'Medical Specialist', 'Trauma Surgeon',
  'Pediatric Gastroenterologist', 'General Laparoscopic surgeon', 'Infectious Disease Specialist', 'Lasik Surgeon',
  'Pulmonologist', 'Allergy specialist', 'Sexologist', 'Cosmetic Surgeon',
  'ENT Surgeon', 'Internal Medicine', 'Chiropractor', 'Pediatric Cardiologist',
  'Pediatric Orthopedic Surgeon', 'Lung Surgeon', 'Pediatric Radiologist', 'Speech Therapist',
  'Andrologist', 'Implantologist', 'Pain Management Specialist', 'Hematologist',
  'Fitness', 'Skin Disorders', 'Herbal Practitioner', 'Physiotherapist',
  'Neurosurgeon', 'Endodontist', 'Nephrologist', 'Homeopathy',
  'Audiologist', 'General/Medicine', 'Vascular Surgeon', 'Dental Surgeon',
  'Family Physician', 'Anesthetic', 'Acupuncturist', 'General Surgeon',
  'Endocrinologist', 'Oncologist', 'Herbalist', 'Pediatric Neuro Physician',
  'Sonologist', 'General Practitioner', 'Medical Officer', 'Physician',
  'Psychologist', 'Eye Specialist', 'Eye Surgeon', 'Endourologist',
  'Liver Specialist', 'Obstetrician', 'Cosmetologist', 'Anesthesiologist'
];

// Hash function to convert specialty names into numerical keys
function getHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// 30 distinct inner medical SVG paths
const INNER_SYMBOLS = [
  // 1. Classic Medical Cross
  <path key="i1" d="M12 8v8M8 12h8" strokeWidth="2" strokeLinecap="round" />,
  // 2. Pulse Wave
  <path key="i2" d="M4 12h3l2-7 2 14 2-10 2 6h5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  // 3. Heart
  <path key="i3" d="M12 8.5c-.8-1.5-2.5-2-4-1.5s-2.5 2-2.2 3.8c.5 2.5 3 4.7 6.2 7.2c3.2-2.5 5.7-4.7 6.2-7.2c.3-1.8-1-3.3-2.5-3.8s-3.2 0-4 1.5z" strokeWidth="2" strokeLinecap="round" />,
  // 4. Stethoscope Node
  <path key="i4" d="M12 7c-2 0-3 1-3 3v4c0 2 1.5 3.5 3 3.5s3-1.5 3-3.5v-4c0-2-1-3-3-3z M9 9V7a3 3 0 0 1 6 0v2" strokeWidth="2" strokeLinecap="round" />,
  // 5. Droplet
  <path key="i5" d="M12 5c0 0-5 4.5-5 8.5a5 5 0 0 0 10 0C17 9.5 12 5 12 5z" strokeWidth="2" strokeLinecap="round" />,
  // 6. Medical Star
  <path key="i6" d="M12 6v12M7 9.5l10 5M7 14.5l10-5" strokeWidth="2" strokeLinecap="round" />,
  // 7. DNA Helix
  <path key="i7" d="M6 8c3 0 5 8 8 8M6 16c3 0 5-8 8-8 M6 8v8 M10 9v6 M14 8v8" strokeWidth="1.8" strokeLinecap="round" />,
  // 8. Microscope
  <path key="i8" d="M12 6c1.5 0 3 1.5 3 3.5v3.5M8 17h8M9 13.5h6" strokeWidth="2" strokeLinecap="round" />,
  // 9. Herbal Leaf
  <path key="i9" d="M12 6c4 0 5 3 5 6s-2 6-5 6s-5-3-5-6s1-6 5-6z M7 12h10" strokeWidth="1.8" strokeLinecap="round" />,
  // 10. Tooth
  <path key="i10" d="M7 7c0-1.5 1-2 3-2c1.5 0 2 1 2 2c0-1 1-2 2.5-2c2 0 2.5 1 2.5 2c0 3.5-1.5 5-2 7c-.5 2-.5 4-1.5 4c-1 0-1-1.5-1.5-2.5c-.5 1-1.5 2.5-2.5 2.5c-1 0-1-2-1.5-4c-.5-2-2-3.5-2-7z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  // 11. Capsule
  <rect key="i11" x="9" y="6" width="6" height="12" rx="3" strokeWidth="2" strokeLinecap="round" />,
  // 12. Shield outline
  <path key="i12" d="M12 6c1.5 1 3.5 1 5 1v5c0 3-2 5.5-5 6.5c-3-1-5-3.5-5-6.5V7c1.5 0 3.5 0 5-1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  // 13. Eye
  <path key="i13" d="M5 12s3-5 7-5s7 5 7 5s-3 5-7 5s-7-5-7-5z M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0" strokeWidth="1.8" strokeLinecap="round" />,
  // 14. Nodes Network
  <path key="i14" d="M9 12a3 3 0 1 1 6 0a3 3 0 0 1-6 0z M6 12h3M15 12h3M12 6v3M12 15v3" strokeWidth="2" strokeLinecap="round" />,
  // 15. Thermometer
  <path key="i15" d="M11 6h2v9a2 2 0 1 1-2 0V6z M10 16.5h4" strokeWidth="2" strokeLinecap="round" />,
  // 16. Syringe
  <path key="i16" d="M11 5h2v10h-2V5z M12 2v3M9 15h6M12 15v4" strokeWidth="2" strokeLinecap="round" />,
  // 17. Bone outline
  <path key="i17" d="M8 8c-1-1.5-3 0-2 1.5c1 1.5 4 1 6 1s5 .5 6-1c1-1.5-1-3-2-1.5s-2 1-4 1s-3-.5-4-1z" strokeWidth="1.8" strokeLinecap="round" />,
  // 18. Clipboard
  <path key="i18" d="M9 7h6v11H9V7z M10 5h4" strokeWidth="1.8" strokeLinecap="round" />,
  // 19. First aid kit
  <rect key="i19" x="7" y="9" width="10" height="9" rx="1.5" strokeWidth="1.8" />,
  // 20. Flask abstract
  <path key="i20" d="M12 5h0M9.5 7h5M12 7v5L8 18h8l-4-6V7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  // 21. Pill shape
  <circle key="i21" cx="12" cy="12" r="5" strokeWidth="2" />,
  // 22. Target / Reticle
  <path key="i22" d="M12 9v6M9 12h6" strokeWidth="1.8" strokeLinecap="round" />,
  // 23. Staff waves
  <path key="i23" d="M12 5v14M9 8c2 0 3 2 3 4s-1 4-3 4 M15 8c-2 0-3 2-3 4s1 4 3 4" strokeWidth="1.8" strokeLinecap="round" />,
  // 24. Bandage abstract
  <path key="i24" d="M7 7l10 10M17 7L7 17" strokeWidth="2" strokeLinecap="round" />,
  // 25. Atom dot
  <circle key="i25" cx="12" cy="12" r="2" fill="currentColor" />,
  // 26. Sun abstract
  <circle key="i26" cx="12" cy="12" r="3" strokeWidth="2" />,
  // 27. Test tube
  <path key="i27" d="M10 5h4v11a2 2 0 0 1-4 0V5z" strokeWidth="2" strokeLinecap="round" />,
  // 28. Scale balanced
  <path key="i28" d="M6 12h12M12 6v12" strokeWidth="2" strokeLinecap="round" />,
  // 29. Lung outline
  <path key="i29" d="M9 10c-1.5 0-3 1.5-3 3.5S8.5 17 9 17 M15 10c1.5 0 3 1.5 3 3.5S15.5 17 15 17" strokeWidth="2" strokeLinecap="round" />,
  // 30. Cancer ribbon
  <path key="i30" d="M9 17c1.5-3.5 3-7.5 3-10s-1.5-2-3 0s1.5 6.5 3 10M15 17c-1.5-3.5-3-7.5-3-10s1.5-2 3 0s-1.5 6.5-3 10" strokeWidth="1.8" strokeLinecap="round" />
];

function getOuterContainer(index: number) {
  switch (index) {
    case 0:
      return <circle key="c" cx="12" cy="12" r="10" strokeWidth="1.5" opacity="0.35" />;
    case 1:
      return <path key="s" d="M12 2L4 5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12V5l-8-3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />;
    case 2:
      return <path key="h" d="M12 2l8 4.5v9l-8 4.5-8-4.5v-9z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />;
    default:
      return <rect key="r" x="3" y="3" width="18" height="18" rx="4" strokeWidth="1.5" opacity="0.35" />;
  }
}

const SPECIALTY_ICON_MAP: Record<string, React.ReactNode> = {};
const usedCombos = new Set<string>();

ALL_SPECIALTIES.forEach((specialty) => {
  const hash = getHash(specialty);
  let symbolIndex = hash % INNER_SYMBOLS.length;
  let containerIndex = (hash >> 2) % 4;
  let comboKey = `${symbolIndex}-${containerIndex}`;
  let attempts = 0;
  
  // Resolve collision by incrementing indices
  while (usedCombos.has(comboKey) && attempts < 150) {
    symbolIndex = (symbolIndex + 1) % INNER_SYMBOLS.length;
    if (symbolIndex === 0) {
      containerIndex = (containerIndex + 1) % 4;
    }
    comboKey = `${symbolIndex}-${containerIndex}`;
    attempts++;
  }
  
  usedCombos.add(comboKey);
  
  SPECIALTY_ICON_MAP[specialty.toLowerCase()] = (
    <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {getOuterContainer(containerIndex)}
      {INNER_SYMBOLS[symbolIndex]}
    </svg>
  );
});

function getSpecialtyIcon(specialty: string) {
  const normalized = specialty.toLowerCase();
  if (SPECIALTY_ICON_MAP[normalized]) {
    return SPECIALTY_ICON_MAP[normalized];
  }
  
  const hash = getHash(specialty);
  const symbolIndex = hash % INNER_SYMBOLS.length;
  const containerIndex = (hash >> 2) % 4;
  return (
    <svg className="specialty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {getOuterContainer(containerIndex)}
      {INNER_SYMBOLS[symbolIndex]}
    </svg>
  );
}

// Initial List of top-rated specialties shown on home screen
const MAIN_SPECIALTIES = [
  { name: 'Gynecologist', icon: <GynecologistIcon /> },
  { name: 'Gastroenterologist', icon: <GastroenterologistIcon /> },
  { name: 'Dentist', icon: <DentistIcon /> },
  { name: 'Dermatologist', icon: <DermatologistIcon /> },
  { name: 'Cardiologist', icon: <CardiologistIcon /> },
  { name: 'Neurologist', icon: <NeurologistIcon /> },
  { name: 'ENT Specialist', icon: <EntIcon /> },
  { name: 'Pediatrician', icon: <PediatricianIcon /> },
  { name: 'Urologist', icon: <UrologistIcon /> },
];

export default function Home() {
  const [selectedCity, setSelectedCity] = useState('Karachi');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtySearchQuery, setSpecialtySearchQuery] = useState('');

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
  };

  const filteredSpecialties = ALL_SPECIALTIES.filter((specialty) =>
    specialty.toLowerCase().includes(specialtySearchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header component */}
      <Header
        selectedCity={selectedCity}
        onChangeCity={() => setIsCityModalOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        
        {/* Hero Banner Section */}
        <section className="hero-section">
          <div className="container">
            <h1 className="hero-title">
              We Help You To Find The Best Doctors And Hospitals In {selectedCity}
            </h1>
            <p className="hero-subtitle">
              Search, verify credentials, consult online, or book in-person appointments instantly.
            </p>
            
            {/* Search Box */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder={`Search for doctors, labs, lab tests, health store, hospitals, specialties, services, diseases in ${selectedCity}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="search-button">Search</button>
            </div>
          </div>
        </section>

        {/* Dynamic Section: Show Main Categories OR All Specialties Directory */}
        {!showAllSpecialties ? (
          <>
            {/* 1. Specialties Category Grid */}
            <section className="section-wrapper">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">Choose Our Top Rated Doctors from The Specialties Below!</h2>
                  <p className="section-subtitle">Connect with experienced professionals across specialized branches of medicine.</p>
                </div>

                <div className="specialty-grid">
                  {MAIN_SPECIALTIES.map((spec) => (
                    <a href="#" key={spec.name} className="specialty-card">
                      <div className="specialty-icon-container">
                        {spec.icon}
                      </div>
                      <span className="specialty-name">{spec.name}</span>
                    </a>
                  ))}
                </div>

                <div className="view-all-container">
                  <button className="btn btn-outline" onClick={() => setShowAllSpecialties(true)}>
                    View All Specialties
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Core Healthcare Needs / Services Grid */}
            <section className="section-wrapper" style={{ backgroundColor: '#f1f5f9' }}>
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">Sehatdoc! One Stop Solution for Your Health Care Needs</h2>
                  <p className="section-subtitle">Quality healthcare options simplified for you and your family.</p>
                </div>

                <div className="services-grid">
                  {/* Appointment Card */}
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
                      Choose from over 20,000+ verified doctors across top medical clinics and consult in-person.
                    </p>
                    <a href="#" className="service-btn service-primary-btn">Book Now</a>
                  </div>

                  {/* Consultation Card */}
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
                    <a href="#" className="service-btn service-primary-btn">Consult Now</a>
                  </div>

                  {/* Hospital Search Card */}
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
                    <a href="#" className="service-btn service-primary-btn">Find Now</a>
                  </div>
                </div>

                {/* Secondary Horizontal Bars */}
                <div className="secondary-services-row">
                  {/* Lab Test bar */}
                  <a href="#" className="secondary-service-bar">
                    <div className="secondary-service-info">
                      <svg className="secondary-service-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 2v8L4.35 19.6a1 1 0 0 0 .85 1.4h13.6a1 1 0 0 0 .85-1.4L14 10V2" />
                        <line x1="8.5" y1="2" x2="15.5" y2="2" />
                        <line x1="6" y1="17" x2="18" y2="17" />
                      </svg>
                      <div>
                        <h4 className="secondary-service-title">Book Lab Tests</h4>
                        <p className="secondary-service-subtitle">Get professional testing at home. Save up to 20% OFF.</p>
                      </div>
                    </div>
                    <span className="secondary-service-link">Book Test &rarr;</span>
                  </a>

                  {/* Order Medicine bar */}
                  <a href="#" className="secondary-service-bar">
                    <div className="secondary-service-info">
                      <svg className="secondary-service-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4.5 16.5c-1.5 1.25-2.5 3-2.5 5v.5h20v-.5c0-2-1-3.75-2.5-5" />
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        <path d="M12 7v10M7 12h10" />
                      </svg>
                      <div>
                        <h4 className="secondary-service-title">Order Medicines</h4>
                        <p className="secondary-service-subtitle">Upload prescriptions for quick home delivery.</p>
                      </div>
                    </div>
                    <span className="secondary-service-link">Order Now &rarr;</span>
                  </a>

                  {/* Discounts bar */}
                  <a href="#" className="secondary-service-bar">
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
                  </a>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* View All Specialties Full Page Directory Layout */
          <section className="section-wrapper">
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div>
                  <button className="btn btn-outline" style={{ display: 'inline-flex', gap: '8px', padding: '8px 16px' }} onClick={() => setShowAllSpecialties(false)}>
                    &larr; Back to Home
                  </button>
                  <h2 className="section-title" style={{ marginTop: '20px', textAlign: 'left' }}>All Medical Specialties</h2>
                </div>
              </div>

              <div className="specialty-list-wrapper">
                <input
                  type="text"
                  className="specialty-search-bar"
                  placeholder="Type here to search any specialty..."
                  value={specialtySearchQuery}
                  onChange={(e) => setSpecialtySearchQuery(e.target.value)}
                />

                <div className="specialty-list-grid">
                  {filteredSpecialties.map((specialty, idx) => {
                    const iconElement = getSpecialtyIcon(specialty);
                    
                    return (
                      <a href="#" key={`${specialty}-${idx}`} className="specialty-row-card">
                        <div className="specialty-row-icon-wrapper">
                          {iconElement}
                        </div>
                        <span className="specialty-row-title">{specialty}</span>
                      </a>
                    );
                  })}
                </div>

                {filteredSpecialties.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    No specialties found matching "{specialtySearchQuery}"
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Join as a Doctor CTA Section */}
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
              <li>
                <span className="bullet-arrow">&rsaquo;</span> Get more appointments through real patients
              </li>
              <li>
                <span className="bullet-arrow">&rsaquo;</span> Build your online presence with free digital market
              </li>
              <li>
                <span className="bullet-arrow">&rsaquo;</span> Get your own branded software for better customer experience
              </li>
            </ul>
            <a href="#" className="btn join-doctor-btn">Signup Now</a>
          </div>
        </div>
      </section>

      {/* Footer component */}
      <Footer />

      {/* Floating WhatsApp Support Button */}
      <a href="https://wa.me/923107813247" target="_blank" rel="noopener noreferrer" className="whatsapp-float" aria-label="Contact WhatsApp Support">
        <svg className="whatsapp-icon" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 496l133.9-35.1c32.7 17.8 69.4 27.2 106.9 27.2 122.3 0 222-99.6 222-222 0-59.3-23-115.1-64.9-157.1zM223.9 446c-33.1 0-65.5-8.9-93.7-25.7l-6.7-4-79.6 20.9 21.3-77.6-4.4-7c-18.4-29.4-28.1-63.4-28.1-98.3 0-102.8 83.7-186.5 186.5-186.5 49.8 0 96.6 19.4 131.8 54.6 35.2 35.2 54.6 82 54.6 131.8 0 102.9-83.6 186.5-186.4 186.5zm107.1-146.5c-5.9-2.9-34.7-17.1-40.1-19.1-5.4-2-9.4-2.9-13.4 2.9-4 5.9-15.4 19.1-18.9 23-3.5 4-7 4.5-12.9 1.5-5.9-2.9-24.8-9.1-47.3-29.2-17.5-15.6-29.3-34.9-32.7-40.9-3.5-5.9-.4-9.1 2.6-12 2.7-2.6 5.9-6.9 8.9-10.3 2.9-3.4 4-5.9 5.9-9.8 2-4 1-7.4-.5-10.3-1.5-2.9-13.4-32.3-18.4-44.3-4.9-11.8-9.9-10.2-13.4-10.3-3.4-.1-7.4-.1-11.4-.1-4 0-10.4 1.5-15.8 7.4-5.4 5.9-20.8 20.3-20.8 49.5 0 29.2 21.3 57.5 24.3 61.4 3 3.9 41.9 63.9 101.4 89.6 14.2 6.1 25.2 9.8 33.9 12.6 14.2 4.5 27.2 3.9 37.4 2.4 11.4-1.7 34.7-14.2 39.6-27.9 4.9-13.8 4.9-25.6 3.4-27.9-1.4-2.3-5.4-3.8-11.3-6.7z" />
        </svg>
      </a>

      {/* Change City modal dialog */}
      <CitySelector
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
      />
    </div>
  );
}
