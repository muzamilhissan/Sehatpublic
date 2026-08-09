import type { Specialty } from '@/types';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const SPECIALTY_NAMES = [
  'General Physician',
  'Gynecologist',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'ENT Specialist',
  'Neurologist',
  'Dentist',
  'Gastroenterologist',
  'Urologist',
  'Psychiatrist',
  'Plastic Surgeon',
  'Pulmonologist',
  'Nephrologist',
  'Endocrinologist',
  'Oncologist',
  'Ophthalmologist',
  'Physiotherapist',
  'Dietitian',
  'Sexologist',
  'Homeopathy',
  'Neurosurgeon',
  'General Surgeon',
  'Radiologist',
  'Anesthesiologist',
  'Hematologist',
  'Rheumatologist',
  'Allergy specialist',
  'Family Medicine',
  'Internal Medicine Specialist',
  'Oral and maxillofacial surgeon',
  'Infertility Consultant',
  'Aesthetic Medicine Specialist',
  'Child Specialist',
  'Diabetologist',
  'Hepatologist',
  'Cosmetic Surgeon',
  'ENT Surgeon',
  'Chiropractor',
  'Speech Therapist',
  'Pain Management Specialist',
  'Psychologist',
  'Eye Specialist',
  'Eye Surgeon',
  'Obstetrician',
  'Cosmetologist',
  'Andrologist',
  'Vascular Surgeon',
  'Dental Surgeon',
  'Family Physician',
  'General Practitioner',
  'Medical Officer',
  'Physician',
  'Sonologist',
  'Acupuncturist',
  'Herbalist',
  'Tibb Specialist',
  'Spinal Surgeon',
  'Orthodontist',
  'Breast Surgeon',
  'Trauma Surgeon',
  'Pediatric Gastroenterologist',
  'Infectious Disease Specialist',
  'Lasik Surgeon',
  'Pediatric Cardiologist',
  'Pediatric Orthopedic Surgeon',
  'Lung Surgeon',
  'Pediatric Radiologist',
  'Implantologist',
  'Audiologist',
  'Endodontist',
  'Nephrologist',
  'Liver Specialist',
  'Endourologist',
  'paediatrics',
  'Female Reproductive Health',
  'Alternative Medicine Practitioner',
  'Regenerative Medicine',
  'Aesthetic Physician',
  'Implant Specialist',
  'Medical Specialist',
  'General Laparoscopic surgeon',
  'Internal Medicine',
  'General/Medicine',
  'Anesthetic',
  'Anesthesia',
  'Fitness',
  'Skin Disorders',
  'Herbal Practitioner',
  'Pediatric Neuro Physician',
  'Male Infertility Specialist',
  'Maternal Fetal Medicine Specialist',
  'Reproductive Endocrinologist',
  'Thoracic Surgeon',
  'Audiometrist',
];

const uniqueNames = Array.from(new Set(SPECIALTY_NAMES));

export const SPECIALTIES: Specialty[] = uniqueNames.map((name, i) => ({
  id: `33333333-3333-3333-3333-${String(i + 1).padStart(12, '0')}`,
  name,
  slug: slugify(name),
  description: `Find verified ${name} specialists on Sehatdoc.`,
  iconUrl: null,
  sortOrder: i,
  isActive: true,
}));

export const MAIN_SPECIALTY_SLUGS = [
  'gynecologist',
  'gastroenterologist',
  'dentist',
  'dermatologist',
  'cardiologist',
  'neurologist',
  'ent-specialist',
  'pediatrician',
  'urologist',
];

export const DROPDOWN_SPECIALTY_SLUGS = [
  'gynecologist',
  'dentist',
  'dermatologist',
  'cardiologist',
  'neurologist',
  'ent-specialist',
  'pediatrician',
  'gastroenterologist',
  'general-physician',
  'plastic-surgeon',
  'urologist',
  'psychiatrist',
];

export function getSpecialtyBySlug(slug: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.slug === slug);
}

export function getSpecialtyById(id: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.id === id);
}

export function getSpecialtyByName(name: string): Specialty | undefined {
  return SPECIALTIES.find((s) => s.name.toLowerCase() === name.toLowerCase());
}
