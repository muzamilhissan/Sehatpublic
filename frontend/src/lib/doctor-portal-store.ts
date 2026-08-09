'use client';

import type {
  AvailabilityMode,
  Doctor,
  DoctorAvailability,
  DoctorClinic,
  DoctorDocument,
  DoctorEducation,
  DoctorExperience,
  DoctorLanguage,
  DoctorSpecialtyLink,
} from '@/types';
import { DOCTORS } from '@/data/doctors';
import { getCityBySlug, getAreasByCityId } from '@/data/cities';
import { getSpecialtyBySlug, SPECIALTIES } from '@/data/specialties';
import { APPOINTMENTS, updateAppointment } from '@/data/patient';
import type { Appointment, AppointmentStatus } from '@/types';

const OVERRIDES_KEY = 'sehatdoc_doctor_overrides';

type DoctorOverridesMap = Record<string, Doctor>;

function readOverrides(): DoctorOverridesMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as DoctorOverridesMap) : {};
  } catch {
    return {};
  }
}

function writeOverrides(map: DoctorOverridesMap) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
}

function buildFromDraft(doctorId: string): Doctor | null {
  try {
    const raw = localStorage.getItem(`sehatdoc_doctor_draft_${doctorId}`);
    if (!raw) return null;
    const draft = JSON.parse(raw) as {
      fullName: string;
      phone: string;
      pmcNumber: string;
      specialtySlug: string;
      citySlug: string;
      consultationFee: string;
    };
    const city = getCityBySlug(draft.citySlug) ?? getCityBySlug('lahore')!;
    const specialty = getSpecialtyBySlug(draft.specialtySlug) ?? SPECIALTIES[0];
    const area = getAreasByCityId(city.id)[0] ?? null;
    const clinicId = `${doctorId}-clinic-1`;
    const specialtyLink: DoctorSpecialtyLink = {
      id: `${doctorId}-spec-1`,
      doctorId,
      specialtyId: specialty.id,
      isPrimary: true,
      specialty,
    };
    const clinic: DoctorClinic = {
      id: clinicId,
      doctorId,
      name: `${draft.fullName} Clinic`,
      address: `${area?.name ?? 'Main'}, ${city.name}`,
      areaId: area?.id ?? null,
      phone: draft.phone,
      fee: draft.consultationFee,
      lat: null,
      lng: null,
      isPrimary: true,
      isActive: true,
      area,
    };
    return {
      id: doctorId,
      userId: `u-${doctorId}`,
      pmcNumber: draft.pmcNumber || null,
      title: 'Dr',
      bio: 'New doctor on Sehatdoc — complete your profile.',
      yearsExperience: 1,
      consultationFee: draft.consultationFee || '2000',
      followupFee: null,
      currency: 'PKR',
      avgRating: '0.00',
      reviewCount: 0,
      completedConsults: 0,
      nextAvailableAt: null,
      verificationStatus: 'PENDING',
      isAcceptingPatients: false,
      cityId: city.id,
      freeCancelHours: 2,
      user: {
        id: `u-${doctorId}`,
        phone: draft.phone,
        email: null,
        fullName: draft.fullName,
        avatarUrl: null,
        locale: 'en',
        timezone: 'Asia/Karachi',
        status: 'ACTIVE',
      },
      specialties: [specialtyLink],
      clinics: [clinic],
      city,
      availabilities: [
        {
          id: `${doctorId}-avl-1`,
          doctorId,
          dayOfWeek: 1,
          startTime: '10:00',
          endTime: '13:00',
          slotMinutes: 15,
          mode: 'BOTH',
          clinicId,
          isActive: true,
        },
      ],
      educations: [],
      experiences: [],
      languages: [
        { id: `${doctorId}-lng-1`, doctorId, language: 'English' },
        { id: `${doctorId}-lng-2`, doctorId, language: 'Urdu' },
      ],
    };
  } catch {
    return null;
  }
}

export function getDoctorProfile(doctorId: string): Doctor | null {
  const overrides = readOverrides();
  if (overrides[doctorId]) return overrides[doctorId];
  const base = DOCTORS.find((d) => d.id === doctorId);
  if (base) return structuredClone(base);
  const drafted = buildFromDraft(doctorId);
  if (drafted) {
    overrides[doctorId] = drafted;
    writeOverrides(overrides);
    return drafted;
  }
  return null;
}

export function saveDoctorProfile(doctor: Doctor): Doctor {
  const overrides = readOverrides();
  overrides[doctor.id] = doctor;
  writeOverrides(overrides);
  return doctor;
}

export function getDoctorOverride(doctorId: string): Doctor | null {
  return readOverrides()[doctorId] ?? null;
}

export function getAllDoctorOverrides(): DoctorOverridesMap {
  return readOverrides();
}

export function updateDoctorFields(doctorId: string, patch: Partial<Doctor>): Doctor | null {
  const current = getDoctorProfile(doctorId);
  if (!current) return null;
  const next = { ...current, ...patch };
  if (patch.user) next.user = { ...current.user, ...patch.user };
  return saveDoctorProfile(next);
}

export function setDoctorClinics(doctorId: string, clinics: DoctorClinic[]): Doctor | null {
  return updateDoctorFields(doctorId, { clinics });
}

export function setDoctorAvailability(doctorId: string, availabilities: DoctorAvailability[]): Doctor | null {
  return updateDoctorFields(doctorId, { availabilities });
}

export function setDoctorCredentials(
  doctorId: string,
  data: {
    pmcNumber?: string | null;
    yearsExperience?: number;
    educations?: DoctorEducation[];
    experiences?: DoctorExperience[];
    languages?: DoctorLanguage[];
    documents?: DoctorDocument[];
  },
): Doctor | null {
  return updateDoctorFields(doctorId, data);
}

export function getDoctorAppointments(doctorId: string): Appointment[] {
  return APPOINTMENTS.filter((a) => a.doctorId === doctorId || getDoctorOverride(doctorId)?.id === a.doctorId);
}

/** Include appointments for fixture doctor when logged in as demo doctor 0 */
export function listAppointmentsForPortalDoctor(doctorId: string): Appointment[] {
  const fixtureIds = new Set(DOCTORS.map((d) => d.id));
  if (fixtureIds.has(doctorId)) {
    return APPOINTMENTS.filter((a) => a.doctorId === doctorId);
  }
  // New signups: show empty or any tagged
  return APPOINTMENTS.filter((a) => a.doctorId === doctorId);
}

export function setDoctorAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Appointment | undefined {
  return updateAppointment(appointmentId, {
    status,
    cancelReason: status === 'CANCELLED' ? 'Cancelled by doctor' : null,
  });
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function newClinic(doctorId: string): DoctorClinic {
  const doctor = getDoctorProfile(doctorId);
  const city = doctor?.city;
  const area = city ? getAreasByCityId(city.id)[0] : null;
  return {
    id: `clinic-${Date.now()}`,
    doctorId,
    name: 'New Clinic',
    address: city ? `${city.name}` : '',
    areaId: area?.id ?? null,
    phone: doctor?.user.phone ?? null,
    fee: doctor?.consultationFee ?? '0',
    lat: null,
    lng: null,
    isPrimary: false,
    isActive: true,
    area: area ?? null,
  };
}

export function newAvailability(doctorId: string, clinicId: string | null): DoctorAvailability {
  return {
    id: `avl-${Date.now()}`,
    doctorId,
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '14:00',
    slotMinutes: 15,
    mode: 'CLINIC' as AvailabilityMode,
    clinicId,
    isActive: true,
  };
}
