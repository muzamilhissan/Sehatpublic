'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SessionUser } from '@/types';
import { DEMO_PATIENT } from '@/data/patient';

const STORAGE_KEY = 'sehatdoc_session';

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  login: (phone: string, otp: string) => { ok: boolean; message?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as SessionUser);
    } catch {
      /* ignore */
    }
  }, []);

  const login = (phone: string, otp: string) => {
    const normalized = phone.replace(/\s+/g, '');
    if (!/^\+?92\d{10}$|^03\d{9}$/.test(normalized)) {
      return { ok: false, message: 'Enter a valid Pakistani mobile number' };
    }
    if (otp !== '123456') {
      return { ok: false, message: 'Invalid OTP. Use 123456 for demo.' };
    }
    const session: SessionUser = {
      id: DEMO_PATIENT.userId,
      phone: normalized.startsWith('+') ? normalized : `+92${normalized.slice(1)}`,
      fullName: DEMO_PATIENT.user.fullName,
      roles: ['PATIENT'],
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      patientId: DEMO_PATIENT.id,
    };
    setUser(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
