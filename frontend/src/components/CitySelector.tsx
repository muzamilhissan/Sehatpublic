'use client';

import React from 'react';

interface CitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const POPULAR_CITIES = [
  {
    name: 'Lahore',
    icon: (
      <svg className="city-tile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Minar-e-Pakistan abstract vector */}
        <path d="M12 2L10 6H14L12 2Z" />
        <path d="M11 6H13V15H11V6Z" />
        <path d="M9 15H15V17H9V15Z" />
        <path d="M7 17H17V21H7V17Z" />
        <line x1="6" y1="21" x2="18" y2="21" />
      </svg>
    ),
  },
  {
    name: 'Karachi',
    icon: (
      <svg className="city-tile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Mazar-e-Quaid abstract vector dome */}
        <path d="M12 5C8.13 5 5 7.5 5 10V18H19V10C19 7.5 15.87 5 12 5Z" />
        <path d="M10 18V14C10 12.9 10.9 12 12 12C13.1 12 14 12.9 14 14V18" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <line x1="3" y1="21" x2="21" y2="21" />
      </svg>
    ),
  },
  {
    name: 'Islamabad',
    icon: (
      <svg className="city-tile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Faisal Mosque abstract vector minarets & roof */}
        <path d="M6 21L7 6M18 21L17 6" />
        <path d="M7 16L12 11L17 16" />
        <path d="M7 13L12 8L17 13" />
        <line x1="4" y1="21" x2="20" y2="21" />
      </svg>
    ),
  },
  {
    name: 'Faisalabad',
    icon: (
      <svg className="city-tile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Clock tower abstract */}
        <rect x="10" y="7" width="4" height="11" rx="1" />
        <path d="M9 18H15" />
        <circle cx="12" cy="10" r="1.5" />
        <path d="M11 4L12 2L13 4H11Z" />
        <line x1="6" y1="21" x2="18" y2="21" />
      </svg>
    ),
  },
  {
    name: 'Gujranwala',
    icon: (
      <svg className="city-tile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Wrestling / Monument icon representation */}
        <path d="M12 8C14.21 8 16 6.21 16 4C16 1.79 14.21 0 12 0C9.79 0 8 1.79 8 4C8 6.21 9.79 8 12 8Z" fill="currentColor" opacity="0.1" />
        <path d="M6 10C7.5 10 9 11.5 10 13L12 11L14 13C15 11.5 16.5 10 18 10C19.5 10 21 11.5 21 13V21H3V13C3 11.5 4.5 10 6 10Z" />
      </svg>
    ),
  },
  {
    name: 'Multan',
    icon: (
      <svg className="city-tile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Multan Tomb / Shrine blue dome shape */}
        <path d="M12 4C8.69 4 6 6.69 6 10C6 11.5 6.5 13 7.5 14L12 19L16.5 14C17.5 13 18 11.5 18 10C18 6.69 15.31 4 12 4Z" />
        <circle cx="12" cy="10" r="2" />
        <line x1="5" y1="21" x2="19" y2="21" />
      </svg>
    ),
  },
];

const ALL_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Gujranwala', 'Multan',
  'Peshawar', 'Rawalpindi', 'Quetta', 'Sialkot', 'Bahawalpur', 'Sargodha',
  'Sukkur', 'Larkana', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat'
];

export default function CitySelector({ isOpen, onClose, selectedCity, onSelectCity }: CitySelectorProps) {
  const handleCityClick = (cityName: string) => {
    onSelectCity(cityName);
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Change City</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-select-wrapper">
            <label className="modal-label" htmlFor="city-dropdown">
              Locations (webLayout):
            </label>
            <select
              id="city-dropdown"
              className="modal-select"
              value={selectedCity}
              onChange={(e) => handleCityClick(e.target.value)}
            >
              <option value="">Select Location</option>
              {ALL_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="popular-cities-section">
            <h4 className="popular-cities-title">Popular Cities</h4>
            <div className="cities-grid">
              {POPULAR_CITIES.map((city) => {
                const isActive = selectedCity === city.name;
                return (
                  <div
                    key={city.name}
                    className={`city-tile ${isActive ? 'city-tile-active' : ''}`}
                    onClick={() => handleCityClick(city.name)}
                  >
                    {city.icon}
                    <span className="city-tile-name">{city.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
