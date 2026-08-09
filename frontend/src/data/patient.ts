import type {
  Appointment,
  Patient,
  PatientAddress,
  PatientDependent,
  PaymentInstruction,
} from '@/types';
import { getCityBySlug, AREAS } from './cities';
import { DOCTORS } from './doctors';

const karachi = getCityBySlug('karachi')!;
const pechs = AREAS.find((a) => a.slug === 'pechs')!;

export const DEMO_PATIENT: Patient = {
  id: 'p1111111-1111-1111-1111-111111111001',
  userId: 'u1111111-1111-1111-1111-111111111001',
  dateOfBirth: '1992-05-14',
  gender: 'MALE',
  bloodGroup: 'B+',
  cnic: '42101-1234567-1',
  cityId: karachi.id,
  user: {
    id: 'u1111111-1111-1111-1111-111111111001',
    phone: '+923001234567',
    email: 'ali.patient@sehatdoc.demo',
    fullName: 'Ali Raza',
    avatarUrl: null,
    locale: 'en',
    timezone: 'Asia/Karachi',
    status: 'ACTIVE',
  },
  city: karachi,
  dependents: [
    {
      id: 'pd111111-1111-1111-1111-111111111001',
      patientId: 'p1111111-1111-1111-1111-111111111001',
      fullName: 'Sara Raza',
      relation: 'SPOUSE',
      dateOfBirth: '1994-08-20',
      gender: 'FEMALE',
      bloodGroup: 'A+',
      cnic: null,
      isActive: true,
    },
    {
      id: 'pd111111-1111-1111-1111-111111111002',
      patientId: 'p1111111-1111-1111-1111-111111111001',
      fullName: 'Ahmed Raza',
      relation: 'CHILD',
      dateOfBirth: '2018-03-02',
      gender: 'MALE',
      bloodGroup: 'B+',
      cnic: null,
      isActive: true,
    },
  ] as PatientDependent[],
  addresses: [
    {
      id: 'pa111111-1111-1111-1111-111111111001',
      patientId: 'p1111111-1111-1111-1111-111111111001',
      label: 'Home',
      addressLine1: '12-B, Block 2, PECHS',
      addressLine2: null,
      areaId: pechs.id,
      cityId: karachi.id,
      isDefault: true,
      city: karachi,
      area: pechs,
    },
  ] as PatientAddress[],
};

function makeAppointment(
  n: number,
  doctorIndex: number,
  status: Appointment['status'],
  mode: Appointment['mode'],
  daysFromNow: number,
  dependentId: string | null = null,
): Appointment {
  const doctor = DOCTORS[doctorIndex];
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  start.setHours(mode === 'ONLINE' ? 10 : 17, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 15);
  const fee = doctor.consultationFee;
  const clinic = mode === 'IN_PERSON' ? doctor.clinics[0] : null;

  return {
    id: `a1111111-1111-1111-1111-${String(n).padStart(12, '0')}`,
    patientId: DEMO_PATIENT.id,
    dependentId,
    doctorId: doctor.id,
    hospitalId: null,
    clinicId: clinic?.id ?? null,
    mode,
    status,
    scheduledStart: start.toISOString(),
    scheduledEnd: end.toISOString(),
    feeAmount: fee,
    discountAmount: '0',
    platformFee: '0',
    taxAmount: '0',
    totalAmount: fee,
    currency: 'PKR',
    paymentExpiresAt: status === 'PENDING_PAYMENT' ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null,
    cancelReason: status === 'CANCELLED' ? 'Schedule conflict' : null,
    doctor,
    patient: DEMO_PATIENT,
    dependent: dependentId ? DEMO_PATIENT.dependents.find((d) => d.id === dependentId) ?? null : null,
    clinic,
    hospital: null,
  };
}

/** Mutable store for mock bookings created in-session */
export let APPOINTMENTS: Appointment[] = [
  makeAppointment(1, 2, 'CONFIRMED', 'IN_PERSON', 2),
  makeAppointment(2, 7, 'PENDING_PAYMENT', 'ONLINE', 1),
  makeAppointment(3, 3, 'COMPLETED', 'IN_PERSON', -10, 'pd111111-1111-1111-1111-111111111002'),
  makeAppointment(4, 11, 'CANCELLED', 'ONLINE', -3),
];

export function addAppointment(appointment: Appointment): void {
  APPOINTMENTS = [appointment, ...APPOINTMENTS];
}

export function updateAppointment(id: string, patch: Partial<Appointment>): Appointment | undefined {
  const idx = APPOINTMENTS.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  APPOINTMENTS[idx] = { ...APPOINTMENTS[idx], ...patch };
  return APPOINTMENTS[idx];
}

export const PAYMENT_INSTRUCTIONS: PaymentInstruction[] = [
  {
    id: 'pi111111-1111-1111-1111-111111111001',
    channel: 'JAZZCASH',
    accountTitle: 'Sehatdoc Payments',
    accountNumber: '03001234567',
    bankName: null,
    iban: null,
    instructions: 'Transfer the exact booking amount. Put your booking ID in the note, then upload the screenshot.',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'pi111111-1111-1111-1111-111111111002',
    channel: 'BANK',
    accountTitle: 'Sehatdoc Pvt Ltd',
    accountNumber: '0123456789',
    bankName: 'HBL',
    iban: 'PK00HABB0000000123456789',
    instructions: 'Bank transfer / IBFT. Use booking ID as reference, then upload proof.',
    isActive: true,
    sortOrder: 2,
  },
];
