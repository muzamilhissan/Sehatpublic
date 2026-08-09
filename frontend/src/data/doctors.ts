import type {
  AvailabilityMode,
  Doctor,
  DoctorAvailability,
  DoctorClinic,
  DoctorEducation,
  DoctorExperience,
  DoctorLanguage,
  DoctorSpecialtyLink,
  PublicUser,
} from '@/types';
import { CITIES, AREAS, getCityBySlug } from './cities';
import { getSpecialtyBySlug } from './specialties';

function uid(n: number, prefix: string): string {
  return `${prefix}-${String(n).padStart(12, '0')}`.replace(
    /^([a-z]+)-/,
    (_, p) => {
      const map: Record<string, string> = {
        doc: '44444444-4444-4444-4444',
        usr: '55555555-5555-5555-5555',
        cln: '66666666-6666-6666-6666',
        dsp: '77777777-7777-7777-7777',
        edu: '88888888-8888-8888-8888',
        exp: '99999999-9999-9999-9999',
        lng: 'aaaaaaaa-aaaa-aaaa-aaaa',
        avl: 'bbbbbbbb-bbbb-bbbb-bbbb',
      };
      return `${map[p]}-`;
    },
  );
}

type DoctorSeed = {
  n: number;
  name: string;
  phone: string;
  city: string;
  specialty: string;
  secondary?: string;
  fee: number;
  followup?: number;
  years: number;
  rating: number;
  reviews: number;
  consults: number;
  bio: string;
  pmc: string;
  clinicName: string;
  clinicArea: string;
  modes: AvailabilityMode[];
};

const SEEDS: DoctorSeed[] = [
  { n: 1, name: 'Ayesha Khan', phone: '+923001000001', city: 'lahore', specialty: 'gynecologist', fee: 2500, followup: 1500, years: 12, rating: 4.9, reviews: 320, consults: 2100, bio: 'Consultant gynecologist specializing in high-risk pregnancy and infertility.', pmc: 'PMC-10001', clinicName: 'Ayesha Women Clinic', clinicArea: 'gulberg', modes: ['BOTH'] },
  { n: 2, name: 'Hassan Ali', phone: '+923001000002', city: 'lahore', specialty: 'cardiologist', fee: 3500, followup: 2000, years: 18, rating: 4.8, reviews: 410, consults: 3400, bio: 'Interventional cardiologist with focus on preventive heart care.', pmc: 'PMC-10002', clinicName: 'Heart Care Centre', clinicArea: 'dha', modes: ['BOTH'] },
  { n: 3, name: 'Sara Malik', phone: '+923001000003', city: 'karachi', specialty: 'dermatologist', fee: 2000, followup: 1200, years: 9, rating: 4.7, reviews: 280, consults: 1900, bio: 'Dermatologist for acne, eczema, and aesthetic skin procedures.', pmc: 'PMC-10003', clinicName: 'Glow Skin Clinic', clinicArea: 'clifton', modes: ['BOTH'] },
  { n: 4, name: 'Imran Qureshi', phone: '+923001000004', city: 'karachi', specialty: 'pediatrician', secondary: 'child-specialist', fee: 1800, years: 14, rating: 4.9, reviews: 500, consults: 4200, bio: 'Child specialist offering newborn to adolescent care.', pmc: 'PMC-10004', clinicName: 'Little Stars Pediatrics', clinicArea: 'pechs', modes: ['CLINIC', 'ONLINE'] },
  { n: 5, name: 'Nadia Rehman', phone: '+923001000005', city: 'islamabad', specialty: 'neurologist', fee: 4000, followup: 2500, years: 16, rating: 4.8, reviews: 190, consults: 1500, bio: 'Neurologist treating migraines, epilepsy, and stroke recovery.', pmc: 'PMC-10005', clinicName: 'Neuro Care Islamabad', clinicArea: 'f-7', modes: ['BOTH'] },
  { n: 6, name: 'Bilal Ahmed', phone: '+923001000006', city: 'islamabad', specialty: 'orthopedic', fee: 3000, years: 11, rating: 4.6, reviews: 150, consults: 1200, bio: 'Orthopedic surgeon for sports injuries and joint replacement.', pmc: 'PMC-10006', clinicName: 'Bone & Joint Clinic', clinicArea: 'g-11', modes: ['CLINIC'] },
  { n: 7, name: 'Fatima Zahra', phone: '+923001000007', city: 'lahore', specialty: 'ent-specialist', fee: 2200, years: 10, rating: 4.7, reviews: 210, consults: 1600, bio: 'ENT specialist for sinus, hearing, and throat disorders.', pmc: 'PMC-10007', clinicName: 'Clear ENT Clinic', clinicArea: 'johar-town', modes: ['BOTH'] },
  { n: 8, name: 'Omar Farooq', phone: '+923001000008', city: 'karachi', specialty: 'general-physician', fee: 1500, years: 8, rating: 4.5, reviews: 340, consults: 2800, bio: 'Family physician for acute and chronic primary care.', pmc: 'PMC-10008', clinicName: 'City GP Clinic', clinicArea: 'gulshan-e-iqbal', modes: ['BOTH'] },
  { n: 9, name: 'Mehwish Tariq', phone: '+923001000009', city: 'rawalpindi', specialty: 'dentist', fee: 1200, years: 7, rating: 4.8, reviews: 260, consults: 1800, bio: 'Cosmetic and restorative dentist with gentle care approach.', pmc: 'PMC-10009', clinicName: 'Smile Dental Studio', clinicArea: 'saddar', modes: ['CLINIC'] },
  { n: 10, name: 'Kashif Raza', phone: '+923001000010', city: 'faisalabad', specialty: 'urologist', fee: 2800, years: 13, rating: 4.6, reviews: 120, consults: 980, bio: 'Urologist specializing in kidney stones and prostate health.', pmc: 'PMC-10010', clinicName: 'Uro Health Clinic', clinicArea: 'madina-town', modes: ['BOTH'] },
  { n: 11, name: 'Hina Shah', phone: '+923001000011', city: 'multan', specialty: 'gastroenterologist', fee: 2600, years: 15, rating: 4.7, reviews: 175, consults: 1400, bio: 'GI consultant for IBS, liver disease, and endoscopy.', pmc: 'PMC-10011', clinicName: 'Digestive Health Centre', clinicArea: 'cantt', modes: ['BOTH'] },
  { n: 12, name: 'Usman Ghani', phone: '+923001000012', city: 'lahore', specialty: 'psychiatrist', fee: 3000, years: 12, rating: 4.9, reviews: 220, consults: 1700, bio: 'Psychiatrist for anxiety, depression, and adult ADHD.', pmc: 'PMC-10012', clinicName: 'Mind Wellness Clinic', clinicArea: 'model-town', modes: ['ONLINE'] },
  { n: 13, name: 'Rabia Noor', phone: '+923001000013', city: 'karachi', specialty: 'endocrinologist', secondary: 'diabetologist', fee: 3200, years: 14, rating: 4.8, reviews: 300, consults: 2500, bio: 'Endocrinologist and diabetologist for thyroid and diabetes care.', pmc: 'PMC-10013', clinicName: 'Hormone & Diabetes Clinic', clinicArea: 'clifton', modes: ['BOTH'] },
  { n: 14, name: 'Zainab Iqbal', phone: '+923001000014', city: 'islamabad', specialty: 'ophthalmologist', secondary: 'eye-specialist', fee: 2500, years: 11, rating: 4.7, reviews: 180, consults: 1300, bio: 'Eye specialist for cataracts, glaucoma, and refractive errors.', pmc: 'PMC-10014', clinicName: 'Vision Care Hospital Clinic', clinicArea: 'f-7', modes: ['CLINIC'] },
  { n: 15, name: 'Tariq Mehmood', phone: '+923001000015', city: 'lahore', specialty: 'pulmonologist', fee: 2700, years: 17, rating: 4.6, reviews: 140, consults: 1100, bio: 'Chest specialist for asthma, COPD, and sleep apnea.', pmc: 'PMC-10015', clinicName: 'Breath Easy Chest Clinic', clinicArea: 'dha', modes: ['BOTH'] },
  { n: 16, name: 'Sana Javed', phone: '+923001000016', city: 'karachi', specialty: 'plastic-surgeon', fee: 5000, years: 10, rating: 4.8, reviews: 95, consults: 700, bio: 'Plastic and reconstructive surgeon with aesthetic focus.', pmc: 'PMC-10016', clinicName: 'Aesthetic Surgery Studio', clinicArea: 'clifton', modes: ['CLINIC'] },
  { n: 17, name: 'Asad Butt', phone: '+923001000017', city: 'rawalpindi', specialty: 'general-surgeon', fee: 3500, years: 19, rating: 4.5, reviews: 110, consults: 900, bio: 'General and laparoscopic surgeon for elective and emergency cases.', pmc: 'PMC-10017', clinicName: 'Surgical Care Unit', clinicArea: 'saddar', modes: ['CLINIC'] },
  { n: 18, name: 'Mariam Siddiqui', phone: '+923001000018', city: 'islamabad', specialty: 'dietitian', fee: 1500, years: 6, rating: 4.9, reviews: 240, consults: 1600, bio: 'Clinical dietitian for weight management and PCOS nutrition.', pmc: 'PMC-10018', clinicName: 'NutriLife Studio', clinicArea: 'g-11', modes: ['ONLINE'] },
  { n: 19, name: 'Farhan Saleem', phone: '+923001000019', city: 'faisalabad', specialty: 'cardiologist', fee: 3000, years: 12, rating: 4.6, reviews: 130, consults: 1000, bio: 'Cardiologist offering ECG, echo, and hypertension clinics.', pmc: 'PMC-10019', clinicName: 'Faisalabad Heart Clinic', clinicArea: 'madina-town', modes: ['BOTH'] },
  { n: 20, name: 'Amina Bukhari', phone: '+923001000020', city: 'multan', specialty: 'gynecologist', fee: 2200, years: 9, rating: 4.7, reviews: 160, consults: 1200, bio: 'Obstetrician and gynecologist for prenatal and postnatal care.', pmc: 'PMC-10020', clinicName: 'Mother Care Clinic', clinicArea: 'cantt', modes: ['BOTH'] },
  { n: 21, name: 'Naveed Akhtar', phone: '+923001000021', city: 'lahore', specialty: 'nephrologist', fee: 3400, years: 15, rating: 4.5, reviews: 100, consults: 850, bio: 'Nephrologist managing CKD, dialysis planning, and hypertension.', pmc: 'PMC-10021', clinicName: 'Kidney Care Lahore', clinicArea: 'gulberg', modes: ['BOTH'] },
  { n: 22, name: 'Iqra Hussain', phone: '+923001000022', city: 'karachi', specialty: 'physiotherapist', fee: 1800, years: 8, rating: 4.8, reviews: 200, consults: 1500, bio: 'Physiotherapist for sports rehab and chronic pain.', pmc: 'PMC-10022', clinicName: 'MoveWell Physio', clinicArea: 'pechs', modes: ['CLINIC'] },
  { n: 23, name: 'Shahid Anwar', phone: '+923001000023', city: 'islamabad', specialty: 'oncologist', fee: 4500, years: 20, rating: 4.9, reviews: 80, consults: 600, bio: 'Medical oncologist with multidisciplinary cancer care.', pmc: 'PMC-10023', clinicName: 'Hope Oncology Clinic', clinicArea: 'f-7', modes: ['BOTH'] },
  { n: 24, name: 'Lubna Chaudhry', phone: '+923001000024', city: 'lahore', specialty: 'dermatologist', fee: 2100, years: 11, rating: 4.7, reviews: 290, consults: 2000, bio: 'Dermatologist for hair loss, psoriasis, and laser treatments.', pmc: 'PMC-10024', clinicName: 'SkinSense Clinic', clinicArea: 'johar-town', modes: ['BOTH'] },
];

function buildDoctor(seed: DoctorSeed): Doctor {
  const city = getCityBySlug(seed.city)!;
  const specialty = getSpecialtyBySlug(seed.specialty)!;
  const secondary = seed.secondary ? getSpecialtyBySlug(seed.secondary) : undefined;
  const area = AREAS.find((a) => a.slug === seed.clinicArea && a.cityId === city.id) ?? AREAS.find((a) => a.cityId === city.id)!;

  const doctorId = uid(seed.n, 'doc');
  const userId = uid(seed.n, 'usr');
  const clinicId = uid(seed.n, 'cln');

  const user: PublicUser = {
    id: userId,
    phone: seed.phone,
    email: `${seed.name.toLowerCase().replace(/\s+/g, '.')}@sehatdoc.demo`,
    fullName: seed.name,
    avatarUrl: null,
    locale: 'en',
    timezone: 'Asia/Karachi',
    status: 'ACTIVE',
  };

  const specialties: DoctorSpecialtyLink[] = [
    {
      id: uid(seed.n * 10 + 1, 'dsp'),
      doctorId,
      specialtyId: specialty.id,
      isPrimary: true,
      specialty,
    },
  ];
  if (secondary) {
    specialties.push({
      id: uid(seed.n * 10 + 2, 'dsp'),
      doctorId,
      specialtyId: secondary.id,
      isPrimary: false,
      specialty: secondary,
    });
  }

  const clinics: DoctorClinic[] = [
    {
      id: clinicId,
      doctorId,
      name: seed.clinicName,
      address: `${seed.clinicName}, ${area.name}, ${city.name}`,
      areaId: area.id,
      phone: seed.phone,
      fee: String(seed.fee),
      lat: null,
      lng: null,
      isPrimary: true,
      isActive: true,
      area,
    },
  ];

  const educations: DoctorEducation[] = [
    {
      id: uid(seed.n, 'edu'),
      doctorId,
      degree: 'MBBS',
      institute: city.slug === 'karachi' ? 'Dow University of Health Sciences' : 'King Edward Medical University',
      yearFrom: 2000 + (seed.n % 8),
      yearTo: 2005 + (seed.n % 8),
      sortOrder: 0,
    },
    {
      id: uid(seed.n + 100, 'edu'),
      doctorId,
      degree: 'FCPS',
      institute: 'College of Physicians and Surgeons Pakistan',
      yearFrom: 2006 + (seed.n % 8),
      yearTo: 2010 + (seed.n % 8),
      sortOrder: 1,
    },
  ];

  const experiences: DoctorExperience[] = [
    {
      id: uid(seed.n, 'exp'),
      doctorId,
      organization: seed.clinicName,
      roleTitle: 'Consultant',
      startDate: '2018-01-01',
      endDate: null,
      isCurrent: true,
      description: `Leading ${specialty.name.toLowerCase()} practice.`,
    },
  ];

  const languages: DoctorLanguage[] = [
    { id: uid(seed.n * 2, 'lng'), doctorId, language: 'English' },
    { id: uid(seed.n * 2 + 1, 'lng'), doctorId, language: 'Urdu' },
  ];

  const availabilities: DoctorAvailability[] = [];
  const days = [1, 2, 3, 4, 5, 6]; // Mon–Sat
  for (const day of days) {
    for (const mode of seed.modes.includes('BOTH') ? (['ONLINE', 'CLINIC'] as const) : seed.modes) {
      availabilities.push({
        id: uid(seed.n * 20 + day + (mode === 'ONLINE' ? 0 : 10), 'avl'),
        doctorId,
        dayOfWeek: day,
        startTime: mode === 'ONLINE' ? '10:00' : '16:00',
        endTime: mode === 'ONLINE' ? '13:00' : '20:00',
        slotMinutes: 15,
        mode: mode as AvailabilityMode,
        clinicId: mode === 'CLINIC' || mode === 'BOTH' ? clinicId : null,
        isActive: true,
      });
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  return {
    id: doctorId,
    userId,
    pmcNumber: seed.pmc,
    title: 'Dr',
    bio: seed.bio,
    yearsExperience: seed.years,
    consultationFee: String(seed.fee),
    followupFee: seed.followup != null ? String(seed.followup) : null,
    currency: 'PKR',
    avgRating: seed.rating.toFixed(2),
    reviewCount: seed.reviews,
    completedConsults: seed.consults,
    nextAvailableAt: tomorrow.toISOString(),
    verificationStatus: 'APPROVED',
    isAcceptingPatients: true,
    cityId: city.id,
    freeCancelHours: 2,
    user,
    specialties,
    clinics,
    city,
    availabilities,
    educations,
    experiences,
    languages,
  };
}

export const DOCTORS: Doctor[] = SEEDS.map(buildDoctor);

// silence unused import if tree-shaken oddly
void CITIES;
