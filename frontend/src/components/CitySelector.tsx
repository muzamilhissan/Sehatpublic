'use client';

import React from 'react';
import { CITIES, POPULAR_CITY_SLUGS } from '@/data/cities';

interface CitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const POPULAR = CITIES.filter((c) => POPULAR_CITY_SLUGS.includes(c.slug));

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
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal" type="button">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-select-wrapper">
            <label className="modal-label" htmlFor="city-dropdown">
              Locations
            </label>
            <select
              id="city-dropdown"
              className="modal-select"
              value={selectedCity}
              onChange={(e) => handleCityClick(e.target.value)}
            >
              <option value="">Select Location</option>
              {CITIES.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="popular-cities-section">
            <h4 className="popular-cities-title">Popular Cities</h4>
            <div className="cities-grid">
              {POPULAR.map((city) => {
                const isActive = selectedCity === city.name;
                return (
                  <div
                    key={city.id}
                    className={`city-tile ${isActive ? 'city-tile-active' : ''}`}
                    onClick={() => handleCityClick(city.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCityClick(city.name)}
                  >
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
