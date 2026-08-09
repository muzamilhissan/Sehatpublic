'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { City } from '@/types';
import { CITIES, getCityBySlug } from '@/data/cities';

const STORAGE_KEY = 'sehatdoc_city_slug';

interface CityContextValue {
  city: City;
  setCity: (city: City) => void;
  setCityBySlug: (slug: string) => void;
  cities: City[];
}

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City>(() => getCityBySlug('karachi') ?? CITIES[0]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = getCityBySlug(saved);
        if (found) setCityState(found);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setCity = (next: City) => {
    setCityState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next.slug);
    } catch {
      /* ignore */
    }
  };

  const setCityBySlug = (slug: string) => {
    const found = getCityBySlug(slug);
    if (found) setCity(found);
  };

  return (
    <CityContext.Provider value={{ city, setCity, setCityBySlug, cities: CITIES }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used within CityProvider');
  return ctx;
}
