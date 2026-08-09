'use client';

import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import CitySelector from './CitySelector';
import { useCity } from '@/lib/city-context';
import { CITIES } from '@/data/cities';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { city, setCity } = useCity();
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header selectedCity={city.name} onChangeCity={() => setIsCityModalOpen(true)} />
      <main style={{ flexGrow: 1 }}>{children}</main>
      <Footer />
      <a
        href="https://wa.me/923107813247"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Contact WhatsApp Support"
      >
        <svg className="whatsapp-icon" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 496l133.9-35.1c32.7 17.8 69.4 27.2 106.9 27.2 122.3 0 222-99.6 222-222 0-59.3-23-115.1-64.9-157.1zM223.9 446c-33.1 0-65.5-8.9-93.7-25.7l-6.7-4-79.6 20.9 21.3-77.6-4.4-7c-18.4-29.4-28.1-63.4-28.1-98.3 0-102.8 83.7-186.5 186.5-186.5 49.8 0 96.6 19.4 131.8 54.6 35.2 35.2 54.6 82 54.6 131.8 0 102.9-83.6 186.5-186.4 186.5zm107.1-146.5c-5.9-2.9-34.7-17.1-40.1-19.1-5.4-2-9.4-2.9-13.4 2.9-4 5.9-15.4 19.1-18.9 23-3.5 4-7 4.5-12.9 1.5-5.9-2.9-24.8-9.1-47.3-29.2-17.5-15.6-29.3-34.9-32.7-40.9-3.5-5.9-.4-9.1 2.6-12 2.7-2.6 5.9-6.9 8.9-10.3 2.9-3.4 4-5.9 5.9-9.8 2-4 1-7.4-.5-10.3-1.5-2.9-13.4-32.3-18.4-44.3-4.9-11.8-9.9-10.2-13.4-10.3-3.4-.1-7.4-.1-11.4-.1-4 0-10.4 1.5-15.8 7.4-5.4 5.9-20.8 20.3-20.8 49.5 0 29.2 21.3 57.5 24.3 61.4 3 3.9 41.9 63.9 101.4 89.6 14.2 6.1 25.2 9.8 33.9 12.6 14.2 4.5 27.2 3.9 37.4 2.4 11.4-1.7 34.7-14.2 39.6-27.9 4.9-13.8 4.9-25.6 3.4-27.9-1.4-2.3-5.4-3.8-11.3-6.7z" />
        </svg>
      </a>
      <CitySelector
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={city.name}
        onSelectCity={(name) => {
          const found = CITIES.find((c) => c.name === name);
          if (found) setCity(found);
        }}
      />
    </div>
  );
}
