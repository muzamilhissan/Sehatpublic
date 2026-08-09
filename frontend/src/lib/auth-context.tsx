'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthRoleChoice, SessionUser } from '@/types';
import { DEMO_PATIENT } from '@/data/patient';
import { DOCTORS } from '@/data/doctors';
import { HOSPITALS } from '@/data/hospitals';

const STORAGE_KEY = 'sehatdoc_session';
const SIGNUPS_KEY = 'sehatdoc_signups';

export const DEMO_ACCOUNTS = {
  PATIENT: { phone: '03001234567', label: 'Customer (Ali Raza)' },
  DOCTOR: { phone: '03009876543', label: 'Doctor (Ayesha Khan)' },
  HOSPITAL_ADMIN: { phone: '03001112233', label: 'Hospital (Shaukat Khanum)' },
} as const;

function normalizePhone(phone: string): string {
  const n = phone.replace(/\s+/g, '');
  if (n.startsWith('+92')) return n;
  if (n.startsWith('92') && n.length === 12) return `+${n}`;
  if (n.startsWith('0')) return `+92${n.slice(1)}`;
  return n;
}

function phonesMatch(a: string, b: string): boolean {
  return normalizePhone(a) === normalizePhone(b);
}

interface SignupRecord {
  phone: string;
  fullName: string;
  role: AuthRoleChoice;
  doctorId?: string;
  hospitalId?: string;
  patientId?: string;
}

function loadSignups(): SignupRecord[] {
  try {
    const raw = localStorage.getItem(SIGNUPS_KEY);
    return raw ? (JSON.parse(raw) as SignupRecord[]) : [];
  } catch {
    return [];
  }
}

function saveSignups(list: SignupRecord[]) {
  try {
    localStorage.setItem(SIGNUPS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function homeForRole(role: AuthRoleChoice): string {
  if (role === 'DOCTOR') return '/portal/doctor';
  if (role === 'HOSPITAL_ADMIN') return '/portal/hospital';
  return '/account';
}

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  /** True after localStorage session has been read (avoids auth redirect flicker). */
  authReady: boolean;
  login: (phone: string, otp: string, role: AuthRoleChoice) => { ok: boolean; message?: string; redirect?: string };
  signup: (input: {
    phone: string;
    otp: string;
    fullName: string;
    role: AuthRoleChoice;
    extra?: Record<string, string>;
  }) => { ok: boolean; message?: string; redirect?: string };
  logout: () => void;
  homePath: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(session: SessionUser) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionUser;
        if (!parsed.activeRole) {
          parsed.activeRole = parsed.roles.includes('DOCTOR')
            ? 'DOCTOR'
            : parsed.roles.includes('HOSPITAL_ADMIN')
              ? 'HOSPITAL_ADMIN'
              : 'PATIENT';
        }
        setUser(parsed);
      }
    } catch {
      /* ignore */
    } finally {
      setAuthReady(true);
    }
  }, []);

  const login = (phone: string, otp: string, role: AuthRoleChoice) => {
    const normalized = phone.replace(/\s+/g, '');
    if (!/^\+?92\d{10}$|^03\d{9}$/.test(normalized)) {
      return { ok: false, message: 'Enter a valid Pakistani mobile number' };
    }
    if (otp !== '123456') {
      return { ok: false, message: 'Invalid OTP. Use 123456 for demo.' };
    }

    const e164 = normalizePhone(normalized);
    const signups = typeof window !== 'undefined' ? loadSignups() : [];

    if (role === 'PATIENT') {
      const custom = signups.find((s) => s.role === 'PATIENT' && phonesMatch(s.phone, e164));
      const isDemo = phonesMatch(DEMO_ACCOUNTS.PATIENT.phone, e164);
      if (!custom && !isDemo) {
        return { ok: false, message: 'No customer account found. Sign up first, or use 03001234567.' };
      }
      const session: SessionUser = {
        id: custom?.patientId ? `u-${custom.patientId}` : DEMO_PATIENT.userId,
        phone: e164,
        fullName: custom?.fullName ?? DEMO_PATIENT.user.fullName,
        roles: ['PATIENT'],
        activeRole: 'PATIENT',
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        patientId: custom?.patientId ?? DEMO_PATIENT.id,
      };
      setUser(session);
      persistSession(session);
      return { ok: true, redirect: homeForRole('PATIENT') };
    }

    if (role === 'DOCTOR') {
      const custom = signups.find((s) => s.role === 'DOCTOR' && phonesMatch(s.phone, e164));
      const isDemo = phonesMatch(DEMO_ACCOUNTS.DOCTOR.phone, e164);
      const doctor = custom?.doctorId
        ? DOCTORS.find((d) => d.id === custom.doctorId) ?? DOCTORS[0]
        : DOCTORS[0];
      if (!custom && !isDemo) {
        return { ok: false, message: 'No doctor account found. Sign up first, or use 03009876543.' };
      }
      const session: SessionUser = {
        id: doctor.userId,
        phone: e164,
        fullName: custom?.fullName ?? doctor.user.fullName,
        roles: ['DOCTOR', 'PATIENT'],
        activeRole: 'DOCTOR',
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        doctorId: custom?.doctorId ?? doctor.id,
      };
      setUser(session);
      persistSession(session);
      return { ok: true, redirect: homeForRole('DOCTOR') };
    }

    // HOSPITAL_ADMIN
    const custom = signups.find((s) => s.role === 'HOSPITAL_ADMIN' && phonesMatch(s.phone, e164));
    const isDemo = phonesMatch(DEMO_ACCOUNTS.HOSPITAL_ADMIN.phone, e164);
    const hospital = custom?.hospitalId
      ? HOSPITALS.find((h) => h.id === custom.hospitalId) ?? HOSPITALS[0]
      : HOSPITALS[0];
    if (!custom && !isDemo) {
      return { ok: false, message: 'No hospital account found. Sign up first, or use 03001112233.' };
    }
    const session: SessionUser = {
      id: `hosp-admin-${hospital.id}`,
      phone: e164,
      fullName: custom?.fullName ?? `${hospital.name} Admin`,
      roles: ['HOSPITAL_ADMIN'],
      activeRole: 'HOSPITAL_ADMIN',
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      hospitalId: custom?.hospitalId ?? hospital.id,
    };
    setUser(session);
    persistSession(session);
    return { ok: true, redirect: homeForRole('HOSPITAL_ADMIN') };
  };

  const signup = (input: {
    phone: string;
    otp: string;
    fullName: string;
    role: AuthRoleChoice;
    extra?: Record<string, string>;
  }) => {
    const normalized = input.phone.replace(/\s+/g, '');
    if (!input.fullName.trim()) return { ok: false, message: 'Full name is required' };
    if (!/^\+?92\d{10}$|^03\d{9}$/.test(normalized)) {
      return { ok: false, message: 'Enter a valid Pakistani mobile number' };
    }
    if (input.otp !== '123456') {
      return { ok: false, message: 'Invalid OTP. Use 123456 for demo.' };
    }

    const e164 = normalizePhone(normalized);
    const signups = loadSignups();
    if (signups.some((s) => s.role === input.role && phonesMatch(s.phone, e164))) {
      return { ok: false, message: 'Account already exists for this role. Please login.' };
    }

    if (input.role === 'PATIENT') {
      const patientId = `p-signup-${Date.now()}`;
      signups.push({ phone: e164, fullName: input.fullName.trim(), role: 'PATIENT', patientId });
      saveSignups(signups);
      const session: SessionUser = {
        id: `u-${patientId}`,
        phone: e164,
        fullName: input.fullName.trim(),
        roles: ['PATIENT'],
        activeRole: 'PATIENT',
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        patientId,
      };
      setUser(session);
      persistSession(session);
      return { ok: true, redirect: homeForRole('PATIENT') };
    }

    if (input.role === 'DOCTOR') {
      const doctorId = `doc-signup-${Date.now()}`;
      signups.push({ phone: e164, fullName: input.fullName.trim(), role: 'DOCTOR', doctorId });
      saveSignups(signups);
      // Seed portal store entry will be created on first portal load
      try {
        localStorage.setItem(
          `sehatdoc_doctor_draft_${doctorId}`,
          JSON.stringify({
            fullName: input.fullName.trim(),
            phone: e164,
            pmcNumber: input.extra?.pmcNumber ?? '',
            specialtySlug: input.extra?.specialtySlug ?? 'general-physician',
            citySlug: input.extra?.citySlug ?? 'lahore',
            consultationFee: input.extra?.consultationFee ?? '2000',
          }),
        );
      } catch {
        /* ignore */
      }
      const session: SessionUser = {
        id: `u-${doctorId}`,
        phone: e164,
        fullName: input.fullName.trim(),
        roles: ['DOCTOR', 'PATIENT'],
        activeRole: 'DOCTOR',
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        doctorId,
      };
      setUser(session);
      persistSession(session);
      return { ok: true, redirect: homeForRole('DOCTOR') };
    }

    const hospitalId = `hosp-signup-${Date.now()}`;
    signups.push({
      phone: e164,
      fullName: input.fullName.trim(),
      role: 'HOSPITAL_ADMIN',
      hospitalId,
    });
    saveSignups(signups);
    try {
      localStorage.setItem(
        `sehatdoc_hospital_draft_${hospitalId}`,
        JSON.stringify({
          adminName: input.fullName.trim(),
          phone: e164,
          hospitalName: input.extra?.hospitalName ?? `${input.fullName.trim()} Hospital`,
          citySlug: input.extra?.citySlug ?? 'lahore',
          type: input.extra?.type ?? 'HOSPITAL',
        }),
      );
    } catch {
      /* ignore */
    }
    const session: SessionUser = {
      id: `u-${hospitalId}`,
      phone: e164,
      fullName: input.fullName.trim(),
      roles: ['HOSPITAL_ADMIN'],
      activeRole: 'HOSPITAL_ADMIN',
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      hospitalId,
    };
    setUser(session);
    persistSession(session);
    return { ok: true, redirect: homeForRole('HOSPITAL_ADMIN') };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const homePath = user
    ? homeForRole(
        user.activeRole === 'DOCTOR' || user.activeRole === 'HOSPITAL_ADMIN'
          ? user.activeRole
          : 'PATIENT',
      )
    : '/';

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, authReady, login, signup, logout, homePath }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { homeForRole };
