'use client';

import type {
  Appointment,
  Doctor,
  EmploymentType,
  Hospital,
  HospitalDepartment,
  HospitalDoctorLink,
  HospitalFacility,
  HospitalType,
} from '@/types';
import { HOSPITALS } from '@/data/hospitals';
import { DOCTORS } from '@/data/doctors';
import { getCityBySlug, getAreasByCityId } from '@/data/cities';
import { APPOINTMENTS } from '@/data/patient';
import { getSpecialtyBySlug, SPECIALTIES } from '@/data/specialties';

const OVERRIDES_KEY = 'sehatdoc_hospital_overrides';

type HospitalOverridesMap = Record<string, Hospital>;

function readOverrides(): HospitalOverridesMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as HospitalOverridesMap) : {};
  } catch {
    return {};
  }
}

function writeOverrides(map: HospitalOverridesMap) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
}

function buildFromDraft(hospitalId: string): Hospital | null {
  try {
    const raw = localStorage.getItem(`sehatdoc_hospital_draft_${hospitalId}`);
    if (!raw) return null;
    const draft = JSON.parse(raw) as {
      adminName: string;
      phone: string;
      hospitalName: string;
      citySlug: string;
      type: HospitalType;
    };
    const city = getCityBySlug(draft.citySlug) ?? getCityBySlug('lahore')!;
    const area = getAreasByCityId(city.id)[0] ?? null;
    return {
      id: hospitalId,
      name: draft.hospitalName,
      slug: draft.hospitalName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: draft.type || 'HOSPITAL',
      description: 'Newly registered facility — complete your profile.',
      phone: draft.phone,
      email: null,
      address: `${area?.name ?? 'Main'}, ${city.name}`,
      areaId: area?.id ?? null,
      cityId: city.id,
      lat: null,
      lng: null,
      verificationStatus: 'PENDING',
      avgRating: '0.00',
      reviewCount: 0,
      isActive: true,
      city,
      area,
      facilities: [],
      departments: [],
      doctors: [],
    };
  } catch {
    return null;
  }
}

export function getHospitalProfile(hospitalId: string): Hospital | null {
  const overrides = readOverrides();
  if (overrides[hospitalId]) return overrides[hospitalId];
  const base = HOSPITALS.find((h) => h.id === hospitalId);
  if (base) return structuredClone(base);
  const drafted = buildFromDraft(hospitalId);
  if (drafted) {
    overrides[hospitalId] = drafted;
    writeOverrides(overrides);
    return drafted;
  }
  return null;
}

export function saveHospitalProfile(hospital: Hospital): Hospital {
  const overrides = readOverrides();
  overrides[hospital.id] = hospital;
  writeOverrides(overrides);
  return hospital;
}

export function getHospitalOverride(hospitalId: string): Hospital | null {
  return readOverrides()[hospitalId] ?? null;
}

export function updateHospitalFields(hospitalId: string, patch: Partial<Hospital>): Hospital | null {
  const current = getHospitalProfile(hospitalId);
  if (!current) return null;
  return saveHospitalProfile({ ...current, ...patch });
}

export function setHospitalDepartments(hospitalId: string, departments: HospitalDepartment[]): Hospital | null {
  return updateHospitalFields(hospitalId, { departments });
}

export function setHospitalFacilities(hospitalId: string, facilities: HospitalFacility[]): Hospital | null {
  return updateHospitalFields(hospitalId, { facilities });
}

export function setHospitalDoctors(hospitalId: string, doctors: HospitalDoctorLink[]): Hospital | null {
  return updateHospitalFields(hospitalId, { doctors });
}

export function listHospitalAppointments(hospitalId: string): Appointment[] {
  const hospital = getHospitalProfile(hospitalId);
  if (!hospital) return [];
  const doctorIds = new Set((hospital.doctors ?? []).map((d) => d.doctorId));
  return APPOINTMENTS.filter((a) => doctorIds.has(a.doctorId));
}

export function newDepartment(hospitalId: string): HospitalDepartment {
  return {
    id: `dept-${Date.now()}`,
    hospitalId,
    name: 'New Department',
    description: '',
  };
}

export function newFacility(hospitalId: string): HospitalFacility {
  return {
    id: `fac-${Date.now()}`,
    hospitalId,
    name: 'New Facility',
  };
}

export function affiliateDoctor(
  hospitalId: string,
  doctorId: string,
  employmentType: EmploymentType = 'VISITING',
  departmentId: string | null = null,
): Hospital | null {
  const hospital = getHospitalProfile(hospitalId);
  const doctor = DOCTORS.find((d) => d.id === doctorId);
  if (!hospital || !doctor) return null;
  const existing = hospital.doctors ?? [];
  if (existing.some((d) => d.doctorId === doctorId)) return hospital;
  const department = hospital.departments?.find((d) => d.id === departmentId) ?? null;
  const link: HospitalDoctorLink = {
    id: `hd-${Date.now()}`,
    hospitalId,
    doctorId,
    departmentId,
    employmentType,
    isPrimary: existing.length === 0,
    department,
    doctor,
  };
  return setHospitalDoctors(hospitalId, [...existing, link]);
}

export function removeAffiliatedDoctor(hospitalId: string, linkId: string): Hospital | null {
  const hospital = getHospitalProfile(hospitalId);
  if (!hospital) return null;
  return setHospitalDoctors(
    hospitalId,
    (hospital.doctors ?? []).filter((d) => d.id !== linkId),
  );
}

/** Create a doctor that belongs to this hospital (not from marketplace catalog). */
export function addHospitalDoctor(
  hospitalId: string,
  input: {
    fullName: string;
    phone?: string;
    specialtySlug: string;
    consultationFee: string;
    yearsExperience: number;
    employmentType?: EmploymentType;
    departmentId?: string | null;
    pmcNumber?: string;
  },
): Hospital | null {
  const hospital = getHospitalProfile(hospitalId);
  if (!hospital) return null;

  const specialty = getSpecialtyBySlug(input.specialtySlug) ?? SPECIALTIES[0];
  const doctorId = `hosp-doc-${hospitalId.slice(-8)}-${Date.now()}`;
  const userId = `hosp-usr-${Date.now()}`;
  const existing = hospital.doctors ?? [];
  const department =
    hospital.departments?.find((d) => d.id === (input.departmentId ?? '')) ?? null;

  const doctor: Doctor = {
    id: doctorId,
    userId,
    pmcNumber: input.pmcNumber || null,
    title: 'Dr',
    bio: `Hospital physician at ${hospital.name}.`,
    yearsExperience: input.yearsExperience || 1,
    consultationFee: input.consultationFee || '2000',
    followupFee: null,
    currency: 'PKR',
    avgRating: '0.00',
    reviewCount: 0,
    completedConsults: 0,
    nextAvailableAt: null,
    verificationStatus: 'APPROVED',
    isAcceptingPatients: true,
    cityId: hospital.cityId,
    freeCancelHours: 2,
    user: {
      id: userId,
      phone: input.phone || hospital.phone || '+923000000000',
      email: null,
      fullName: input.fullName.trim(),
      avatarUrl: null,
      locale: 'en',
      timezone: 'Asia/Karachi',
      status: 'ACTIVE',
    },
    specialties: [
      {
        id: `${doctorId}-spec`,
        doctorId,
        specialtyId: specialty.id,
        isPrimary: true,
        specialty,
      },
    ],
    clinics: [
      {
        id: `${doctorId}-clinic`,
        doctorId,
        name: hospital.name,
        address: hospital.address,
        areaId: hospital.areaId,
        phone: hospital.phone,
        fee: input.consultationFee || '2000',
        lat: null,
        lng: null,
        isPrimary: true,
        isActive: true,
        area: hospital.area,
      },
    ],
    city: hospital.city,
    availabilities: [],
    educations: [],
    experiences: [],
    languages: [
      { id: `${doctorId}-lng-en`, doctorId, language: 'English' },
      { id: `${doctorId}-lng-ur`, doctorId, language: 'Urdu' },
    ],
  };

  const link: HospitalDoctorLink = {
    id: `hd-${Date.now()}`,
    hospitalId,
    doctorId,
    departmentId: department?.id ?? null,
    employmentType: input.employmentType ?? 'FULL_TIME',
    isPrimary: existing.length === 0,
    department,
    doctor,
  };

  return setHospitalDoctors(hospitalId, [...existing, link]);
}

export function updateHospitalDoctorLink(
  hospitalId: string,
  linkId: string,
  patch: {
    employmentType?: EmploymentType;
    departmentId?: string | null;
    fullName?: string;
    consultationFee?: string;
    specialtySlug?: string;
    phone?: string;
  },
): Hospital | null {
  const hospital = getHospitalProfile(hospitalId);
  if (!hospital) return null;
  const specialty = patch.specialtySlug
    ? getSpecialtyBySlug(patch.specialtySlug) ?? null
    : null;

  const next = (hospital.doctors ?? []).map((link) => {
    if (link.id !== linkId) return link;
    const department =
      patch.departmentId !== undefined
        ? hospital.departments?.find((d) => d.id === patch.departmentId) ?? null
        : link.department;
    const doctor = {
      ...link.doctor,
      consultationFee: patch.consultationFee ?? link.doctor.consultationFee,
      user: {
        ...link.doctor.user,
        fullName: patch.fullName ?? link.doctor.user.fullName,
        phone: patch.phone ?? link.doctor.user.phone,
      },
      specialties: specialty
        ? [
            {
              id: link.doctor.specialties[0]?.id ?? `${link.doctorId}-spec`,
              doctorId: link.doctorId,
              specialtyId: specialty.id,
              isPrimary: true,
              specialty,
            },
          ]
        : link.doctor.specialties,
    };
    return {
      ...link,
      employmentType: patch.employmentType ?? link.employmentType,
      departmentId: patch.departmentId !== undefined ? patch.departmentId : link.departmentId,
      department,
      doctor,
    };
  });

  return setHospitalDoctors(hospitalId, next);
}
