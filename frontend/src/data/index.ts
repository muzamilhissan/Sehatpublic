import type {
  ApiEnvelope,
  Appointment,
  AppointmentMode,
  Doctor,
  DoctorListParams,
  Hospital,
  HospitalListParams,
  Lab,
  LabListParams,
  LabOrder,
  Medicine,
  Offer,
  Specialty,
} from '@/types';
import { CITIES, AREAS, getCityById, getCityBySlug, getAreasByCityId, POPULAR_CITY_SLUGS } from './cities';
import { SPECIALTIES, MAIN_SPECIALTY_SLUGS, DROPDOWN_SPECIALTY_SLUGS, getSpecialtyById, getSpecialtyBySlug } from './specialties';
import { DOCTORS } from './doctors';
import { HOSPITALS } from './hospitals';
import { LABS, LAB_TESTS } from './labs';
import { DEMO_PATIENT, APPOINTMENTS, addAppointment, updateAppointment, PAYMENT_INSTRUCTIONS } from './patient';
import { MEDICINES, OFFERS } from './medicines';

function paginate<T>(items: T[], page = 1, limit = 12): ApiEnvelope<T[]> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    success: true,
    data: items.slice(start, start + limit),
    meta: { page: safePage, limit, total, totalPages },
  };
}

function ok<T>(data: T): ApiEnvelope<T> {
  return { success: true, data };
}

export function getCities() {
  return ok(CITIES.filter((c) => c.isActive));
}

export function getPopularCities() {
  return ok(CITIES.filter((c) => POPULAR_CITY_SLUGS.includes(c.slug)));
}

export function getCityAreas(cityId: string) {
  return ok(getAreasByCityId(cityId));
}

export function getSpecialties(q?: string) {
  let list = SPECIALTIES.filter((s) => s.isActive);
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter((s) => s.name.toLowerCase().includes(qq) || s.slug.includes(qq));
  }
  return ok(list);
}

export function getMainSpecialties(): Specialty[] {
  return MAIN_SPECIALTY_SLUGS.map((slug) => getSpecialtyBySlug(slug)!).filter(Boolean);
}

export function getDropdownSpecialties(): Specialty[] {
  return DROPDOWN_SPECIALTY_SLUGS.map((slug) => getSpecialtyBySlug(slug)!).filter(Boolean);
}

export function getDoctors(params: DoctorListParams = {}) {
  const { q, cityId, citySlug, specialtyId, specialtySlug, mode, page = 1, limit = 12 } = params;
  let list = DOCTORS.filter((d) => d.verificationStatus === 'APPROVED' && d.isAcceptingPatients);

  const resolvedCityId = cityId || (citySlug ? getCityBySlug(citySlug)?.id : undefined);
  if (resolvedCityId) list = list.filter((d) => d.cityId === resolvedCityId);

  const resolvedSpecialtyId = specialtyId || (specialtySlug ? getSpecialtyBySlug(specialtySlug)?.id : undefined);
  if (resolvedSpecialtyId) {
    list = list.filter((d) => d.specialties.some((s) => s.specialtyId === resolvedSpecialtyId));
  }

  if (mode === 'ONLINE') {
    list = list.filter((d) =>
      d.availabilities?.some((a) => a.isActive && (a.mode === 'ONLINE' || a.mode === 'BOTH')),
    );
  } else if (mode === 'IN_PERSON') {
    list = list.filter((d) =>
      d.availabilities?.some((a) => a.isActive && (a.mode === 'CLINIC' || a.mode === 'BOTH')),
    );
  }

  if (q) {
    const qq = q.toLowerCase();
    list = list.filter(
      (d) =>
        d.user.fullName.toLowerCase().includes(qq) ||
        d.bio?.toLowerCase().includes(qq) ||
        d.specialties.some((s) => s.specialty.name.toLowerCase().includes(qq)) ||
        d.clinics.some((c) => c.name.toLowerCase().includes(qq)),
    );
  }

  list = [...list].sort((a, b) => Number(b.avgRating) - Number(a.avgRating));
  return paginate(list, page, limit);
}

export function getDoctorById(id: string): ApiEnvelope<Doctor | null> {
  return ok(DOCTORS.find((d) => d.id === id) ?? null);
}

/** Generate ISO slot starts for a doctor on a YYYY-MM-DD date */
export function getDoctorSlots(doctorId: string, date: string, mode?: AppointmentMode): ApiEnvelope<string[]> {
  const doctor = DOCTORS.find((d) => d.id === doctorId);
  if (!doctor?.availabilities) return ok([]);

  const day = new Date(`${date}T12:00:00`);
  if (Number.isNaN(day.getTime())) return ok([]);
  const dayOfWeek = day.getDay();

  let windows = doctor.availabilities.filter((a) => a.isActive && a.dayOfWeek === dayOfWeek);
  if (mode === 'ONLINE') {
    windows = windows.filter((a) => a.mode === 'ONLINE' || a.mode === 'BOTH');
  } else if (mode === 'IN_PERSON') {
    windows = windows.filter((a) => a.mode === 'CLINIC' || a.mode === 'BOTH');
  }

  const slots: string[] = [];
  const now = Date.now();

  for (const w of windows) {
    const [sh, sm] = w.startTime.split(':').map(Number);
    const [eh, em] = w.endTime.split(':').map(Number);
    const cursor = new Date(`${date}T00:00:00`);
    cursor.setHours(sh, sm, 0, 0);
    const end = new Date(`${date}T00:00:00`);
    end.setHours(eh, em, 0, 0);

    while (cursor < end) {
      if (cursor.getTime() > now) {
        const iso = cursor.toISOString();
        const taken = APPOINTMENTS.some(
          (a) =>
            a.doctorId === doctorId &&
            a.scheduledStart === iso &&
            !['CANCELLED', 'EXPIRED', 'NO_SHOW'].includes(a.status),
        );
        if (!taken) slots.push(iso);
      }
      cursor.setMinutes(cursor.getMinutes() + w.slotMinutes);
    }
  }

  return ok([...new Set(slots)].sort());
}

export function getHospitals(params: HospitalListParams = {}) {
  const { q, cityId, citySlug, page = 1, limit = 12 } = params;
  let list = HOSPITALS.filter((h) => h.isActive && h.verificationStatus === 'APPROVED');
  const resolvedCityId = cityId || (citySlug ? getCityBySlug(citySlug)?.id : undefined);
  if (resolvedCityId) list = list.filter((h) => h.cityId === resolvedCityId);
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter(
      (h) =>
        h.name.toLowerCase().includes(qq) ||
        h.address.toLowerCase().includes(qq) ||
        h.description?.toLowerCase().includes(qq),
    );
  }
  list = [...list].sort((a, b) => Number(b.avgRating) - Number(a.avgRating));
  return paginate(list, page, limit);
}

export function getHospitalById(id: string): ApiEnvelope<Hospital | null> {
  return ok(HOSPITALS.find((h) => h.id === id) ?? null);
}

export function getHospitalBySlug(slug: string): ApiEnvelope<Hospital | null> {
  return ok(HOSPITALS.find((h) => h.slug === slug) ?? null);
}

export function getLabs(params: LabListParams = {}) {
  const { q, cityId, citySlug, page = 1, limit = 12 } = params;
  let list = LABS.filter((l) => l.isActive);
  const resolvedCityId = cityId || (citySlug ? getCityBySlug(citySlug)?.id : undefined);
  if (resolvedCityId) list = list.filter((l) => l.cityId === resolvedCityId);
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter((l) => l.name.toLowerCase().includes(qq) || l.address.toLowerCase().includes(qq));
  }
  return paginate(list, page, limit);
}

export function getLabById(id: string): ApiEnvelope<Lab | null> {
  return ok(LABS.find((l) => l.id === id) ?? null);
}

export function getLabTests(q?: string) {
  let list = LAB_TESTS.filter((t) => t.isActive);
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter((t) => t.name.toLowerCase().includes(qq) || t.category?.toLowerCase().includes(qq));
  }
  return ok(list);
}

export function getMedicines(q?: string): ApiEnvelope<Medicine[]> {
  let list = MEDICINES;
  if (q) {
    const qq = q.toLowerCase();
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(qq) ||
        m.brand.toLowerCase().includes(qq) ||
        m.category.toLowerCase().includes(qq),
    );
  }
  return ok(list);
}

export function getMedicineById(id: string) {
  return ok(MEDICINES.find((m) => m.id === id) ?? null);
}

export function getOffers(): ApiEnvelope<Offer[]> {
  return ok(OFFERS.filter((o) => o.isActive));
}

export function getPaymentInstructions() {
  return ok(PAYMENT_INSTRUCTIONS.filter((p) => p.isActive));
}

export function getPatientMe() {
  return ok(DEMO_PATIENT);
}

export function getAppointments() {
  return ok(APPOINTMENTS);
}

export function getAppointmentById(id: string) {
  return ok(APPOINTMENTS.find((a) => a.id === id) ?? null);
}

export function createMockAppointment(input: {
  doctorId: string;
  mode: AppointmentMode;
  scheduledStart: string;
  clinicId?: string | null;
  dependentId?: string | null;
}): Appointment {
  const doctor = DOCTORS.find((d) => d.id === input.doctorId)!;
  const start = new Date(input.scheduledStart);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 15);
  const clinic = input.clinicId
    ? doctor.clinics.find((c) => c.id === input.clinicId) ?? null
    : input.mode === 'IN_PERSON'
      ? doctor.clinics[0] ?? null
      : null;
  const fee = clinic?.fee ?? doctor.consultationFee;
  const appointment: Appointment = {
    id: `a1111111-1111-1111-1111-${String(Date.now()).slice(-12)}`,
    patientId: DEMO_PATIENT.id,
    dependentId: input.dependentId ?? null,
    doctorId: doctor.id,
    hospitalId: null,
    clinicId: clinic?.id ?? null,
    mode: input.mode,
    status: 'PENDING_PAYMENT',
    scheduledStart: start.toISOString(),
    scheduledEnd: end.toISOString(),
    feeAmount: fee,
    discountAmount: '0',
    platformFee: '0',
    taxAmount: '0',
    totalAmount: fee,
    currency: 'PKR',
    paymentExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    cancelReason: null,
    doctor,
    patient: DEMO_PATIENT,
    dependent: input.dependentId
      ? DEMO_PATIENT.dependents.find((d) => d.id === input.dependentId) ?? null
      : null,
    clinic,
    hospital: null,
  };
  addAppointment(appointment);
  return appointment;
}

export function confirmMockPayment(appointmentId: string, method: 'CASH' | 'MANUAL_TRANSFER') {
  return updateAppointment(appointmentId, {
    status: method === 'CASH' ? 'CONFIRMED' : 'PENDING_PAYMENT',
  });
}

export function cancelMockAppointment(appointmentId: string, reason: string) {
  return updateAppointment(appointmentId, {
    status: 'CANCELLED',
    cancelReason: reason,
  });
}

export function createMockLabOrder(input: {
  labId: string;
  testIds: string[];
  collectionType: 'HOME' | 'WALK_IN';
}): LabOrder {
  const lab = LABS.find((l) => l.id === input.labId)!;
  const items = input.testIds.map((testId, i) => {
    const priceRow = lab.testPrices?.find((p) => p.labTestId === testId);
    const test = LAB_TESTS.find((t) => t.id === testId)!;
    return {
      id: `loi-${Date.now()}-${i}`,
      labOrderId: '',
      labTestId: testId,
      labPackageId: null,
      nameSnapshot: test.name,
      priceSnapshot: priceRow?.price ?? '0',
      currency: 'PKR',
    };
  });
  const fee = items.reduce((sum, it) => sum + Number(it.priceSnapshot), 0);
  const homeFee = input.collectionType === 'HOME' && lab.supportsHomeCollection ? 300 : 0;
  const order: LabOrder = {
    id: `lo-${Date.now()}`,
    patientId: DEMO_PATIENT.id,
    dependentId: null,
    labId: lab.id,
    status: 'BOOKED',
    collectionType: input.collectionType,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    feeAmount: String(fee),
    discountAmount: '0',
    totalAmount: String(fee + homeFee),
    currency: 'PKR',
    lab,
    items: items.map((it) => ({ ...it, labOrderId: `lo-${Date.now()}` })),
  };
  return order;
}

export function searchAll(q: string, citySlug?: string) {
  const qq = q.trim();
  if (!qq) {
    return ok({ doctors: [] as Doctor[], hospitals: [] as Hospital[], labs: [] as Lab[], specialties: [] as Specialty[] });
  }
  return ok({
    doctors: getDoctors({ q: qq, citySlug, limit: 8 }).data,
    hospitals: getHospitals({ q: qq, citySlug, limit: 6 }).data,
    labs: getLabs({ q: qq, citySlug, limit: 6 }).data,
    specialties: getSpecialties(qq).data.slice(0, 10),
  });
}

export {
  CITIES,
  AREAS,
  SPECIALTIES,
  DOCTORS,
  HOSPITALS,
  LABS,
  LAB_TESTS,
  MEDICINES,
  OFFERS,
  DEMO_PATIENT,
  APPOINTMENTS,
  PAYMENT_INSTRUCTIONS,
  getCityById,
  getCityBySlug,
  getSpecialtyById,
  getSpecialtyBySlug,
};
