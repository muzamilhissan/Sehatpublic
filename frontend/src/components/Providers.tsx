'use client';

import React from 'react';
import { CityProvider } from '@/lib/city-context';
import { AuthProvider } from '@/lib/auth-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CityProvider>
      <AuthProvider>{children}</AuthProvider>
    </CityProvider>
  );
}
