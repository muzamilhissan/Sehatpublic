/** Schema-mirrored types matching Nest/Prisma public API shapes */

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type AppRole = 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'LAB_ADMIN' | 'PLATFORM_ADMIN' | 'SUPPORT';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type VerificationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type HospitalType = 'HOSPITAL' | 'CLINIC' | 'MEDICAL_CENTER';
export type EmploymentType = 'FULL_TIME' | 'VISITING' | 'CONSULTANT';
export type AvailabilityMode = 'ONLINE' | 'CLINIC' | 'BOTH';
export type AppointmentMode = 'ONLINE' | 'IN_PERSON';
export type AppointmentStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED'
  | 'RESCHEDULED';
export type DependentRelation =
  | 'SPOUSE'
  | 'CHILD'
  | 'PARENT'
  | 'SIBLING'
  | 'OTHER';
export type CollectionType = 'HOME' | 'WALK_IN';
export type LabOrderStatus =
  | 'PENDING_PAYMENT'
  | 'BOOKED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'REPORTED'
  | 'CANCELLED'
  | 'EXPIRED';
export type PaymentMethod = 'CASH' | 'MANUAL_TRANSFER' | 'JAZZCASH' | 'EASYPAISA' | 'CARD' | 'WALLET';
export type PaymentAccountChannel = 'BANK' | 'JAZZCASH' | 'EASYPAISA' | 'OTHER';
export type PaymentStatus =
  | 'INITIATED'
  | 'AWAITING_PROOF'
  | 'PENDING_VERIFICATION'
  | 'PAID'
  | 'PROOF_REJECTED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIAL_REFUND';

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Area {
  id: string;
  cityId: string;
  name: string;
  slug: string;
}

export interface Specialty {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface PublicUser {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
  status: UserStatus;
}

export interface DoctorSpecialtyLink {
  id: string;
  doctorId: string;
  specialtyId: string;
  isPrimary: boolean;
  specialty: Specialty;
}

export interface DoctorClinic {
  id: string;
  doctorId: string;
  name: string;
  address: string;
  areaId: string | null;
  phone: string | null;
  fee: string | null;
  lat: string | null;
  lng: string | null;
  isPrimary: boolean;
  isActive: boolean;
  area?: Area | null;
}

export type DocumentType =
  | 'PMC_CERTIFICATE'
  | 'CNIC_FRONT'
  | 'CNIC_BACK'
  | 'DEGREE'
  | 'EXPERIENCE_LETTER'
  | 'HOSPITAL_LICENSE'
  | 'LAB_LICENSE'
  | 'OTHER';

export type DocumentStatus = 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface DoctorEducation {
  id: string;
  doctorId: string;
  degree: string;
  institute: string;
  yearFrom: number | null;
  yearTo: number | null;
  sortOrder: number;
}

export interface DoctorExperience {
  id: string;
  doctorId: string;
  organization: string;
  roleTitle: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

export interface DoctorLanguage {
  id: string;
  doctorId: string;
  language: string;
}

export interface DoctorDocument {
  id: string;
  doctorId: string;
  type: DocumentType;
  status: DocumentStatus;
  storageKey: string;
  fileName: string;
  mimeType: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  mode: AvailabilityMode;
  clinicId: string | null;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  pmcNumber: string | null;
  title: string;
  bio: string | null;
  yearsExperience: number;
  consultationFee: string;
  followupFee: string | null;
  currency: string;
  avgRating: string;
  reviewCount: number;
  completedConsults: number;
  nextAvailableAt: string | null;
  verificationStatus: VerificationStatus;
  isAcceptingPatients: boolean;
  cityId: string | null;
  freeCancelHours: number;
  user: PublicUser;
  specialties: DoctorSpecialtyLink[];
  clinics: DoctorClinic[];
  city: City | null;
  availabilities?: DoctorAvailability[];
  educations?: DoctorEducation[];
  experiences?: DoctorExperience[];
  languages?: DoctorLanguage[];
  documents?: DoctorDocument[];
}

export interface HospitalFacility {
  id: string;
  hospitalId: string;
  name: string;
}

export interface HospitalDepartment {
  id: string;
  hospitalId: string;
  name: string;
  description: string | null;
}

export interface HospitalDoctorLink {
  id: string;
  hospitalId: string;
  doctorId: string;
  departmentId: string | null;
  employmentType: EmploymentType;
  isPrimary: boolean;
  department?: HospitalDepartment | null;
  doctor: Doctor;
}

export interface Hospital {
  id: string;
  name: string;
  slug: string;
  type: HospitalType;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  areaId: string | null;
  cityId: string;
  lat: string | null;
  lng: string | null;
  verificationStatus: VerificationStatus;
  avgRating: string;
  reviewCount: number;
  isActive: boolean;
  city: City;
  area: Area | null;
  facilities?: HospitalFacility[];
  departments?: HospitalDepartment[];
  doctors?: HospitalDoctorLink[];
}

export interface PatientDependent {
  id: string;
  patientId: string;
  fullName: string;
  relation: DependentRelation;
  dateOfBirth: string | null;
  gender: Gender | null;
  bloodGroup: string | null;
  cnic: string | null;
  isActive: boolean;
}

export interface PatientAddress {
  id: string;
  patientId: string;
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  areaId: string | null;
  cityId: string;
  isDefault: boolean;
  city?: City;
  area?: Area | null;
}

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  bloodGroup: string | null;
  cnic: string | null;
  cityId: string | null;
  user: PublicUser;
  city: City | null;
  dependents: PatientDependent[];
  addresses: PatientAddress[];
}

export interface Appointment {
  id: string;
  patientId: string;
  dependentId: string | null;
  doctorId: string;
  hospitalId: string | null;
  clinicId: string | null;
  mode: AppointmentMode;
  status: AppointmentStatus;
  scheduledStart: string;
  scheduledEnd: string;
  feeAmount: string;
  discountAmount: string;
  platformFee: string;
  taxAmount: string;
  totalAmount: string;
  currency: string;
  paymentExpiresAt: string | null;
  cancelReason: string | null;
  doctor: Doctor;
  patient: Patient;
  dependent: PatientDependent | null;
  clinic: DoctorClinic | null;
  hospital: Hospital | null;
}

export interface LabBranch {
  id: string;
  labId: string;
  name: string;
  address: string;
  areaId: string | null;
  phone: string | null;
  isPrimary: boolean;
}

export interface LabTest {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  sampleType: string | null;
  turnaroundHours: number | null;
  isActive: boolean;
}

export interface LabTestPrice {
  id: string;
  labId: string;
  labTestId: string;
  price: string;
  currency: string;
  homeCollectionFee: string | null;
  labTest: LabTest;
}

export interface LabPackage {
  id: string;
  labId: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  isActive: boolean;
}

export interface Lab {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  cityId: string;
  areaId: string | null;
  avgRating: string;
  reviewCount: number;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  supportsHomeCollection: boolean;
  city: City;
  area: Area | null;
  branches?: LabBranch[];
  testPrices?: LabTestPrice[];
  packages?: LabPackage[];
}

export interface LabOrderItem {
  id: string;
  labOrderId: string;
  labTestId: string | null;
  labPackageId: string | null;
  nameSnapshot: string;
  priceSnapshot: string;
  currency: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  dependentId: string | null;
  labId: string;
  status: LabOrderStatus;
  collectionType: CollectionType;
  scheduledAt: string | null;
  feeAmount: string;
  discountAmount: string;
  totalAmount: string;
  currency: string;
  lab: Lab;
  items: LabOrderItem[];
}

export interface PaymentInstruction {
  id: string;
  channel: PaymentAccountChannel;
  accountTitle: string;
  accountNumber: string;
  bankName: string | null;
  iban: string | null;
  instructions: string;
  isActive: boolean;
  sortOrder: number;
}

/** Frontend-only medicine catalog (no Prisma model in v1) */
export interface Medicine {
  id: string;
  name: string;
  brand: string;
  price: string;
  currency: string;
  form: string;
  strength: string | null;
  requiresRx: boolean;
  category: string;
  description: string;
  inStock: boolean;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number | null;
  discountAmount: string | null;
  currency: string;
  appliesTo: 'APPOINTMENT' | 'LAB_ORDER' | 'MEDICINE' | 'ALL';
  validUntil: string;
  isActive: boolean;
}

export interface SessionUser {
  id: string;
  phone: string;
  fullName: string;
  roles: AppRole[];
  activeRole: AppRole;
  accessToken: string;
  refreshToken: string;
  patientId?: string;
  doctorId?: string;
  hospitalId?: string;
}

export type AuthRoleChoice = 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN';

export interface DoctorListParams {
  q?: string;
  cityId?: string;
  citySlug?: string;
  specialtyId?: string;
  specialtySlug?: string;
  mode?: AppointmentMode | 'ONLINE' | 'IN_PERSON';
  page?: number;
  limit?: number;
}

export interface HospitalListParams {
  q?: string;
  cityId?: string;
  citySlug?: string;
  page?: number;
  limit?: number;
}

export interface LabListParams {
  q?: string;
  cityId?: string;
  citySlug?: string;
  page?: number;
  limit?: number;
}
