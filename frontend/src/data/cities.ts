import type { Area, City } from '@/types';

export const CITIES: City[] = [
  { id: '11111111-1111-1111-1111-111111111001', name: 'Lahore', slug: 'lahore', isActive: true },
  { id: '11111111-1111-1111-1111-111111111002', name: 'Karachi', slug: 'karachi', isActive: true },
  { id: '11111111-1111-1111-1111-111111111003', name: 'Islamabad', slug: 'islamabad', isActive: true },
  { id: '11111111-1111-1111-1111-111111111004', name: 'Rawalpindi', slug: 'rawalpindi', isActive: true },
  { id: '11111111-1111-1111-1111-111111111005', name: 'Faisalabad', slug: 'faisalabad', isActive: true },
  { id: '11111111-1111-1111-1111-111111111006', name: 'Multan', slug: 'multan', isActive: true },
  { id: '11111111-1111-1111-1111-111111111007', name: 'Gujranwala', slug: 'gujranwala', isActive: true },
  { id: '11111111-1111-1111-1111-111111111008', name: 'Peshawar', slug: 'peshawar', isActive: true },
  { id: '11111111-1111-1111-1111-111111111009', name: 'Quetta', slug: 'quetta', isActive: true },
  { id: '11111111-1111-1111-1111-111111111010', name: 'Sialkot', slug: 'sialkot', isActive: true },
];

export const POPULAR_CITY_SLUGS = ['lahore', 'karachi', 'islamabad', 'faisalabad', 'gujranwala', 'multan'];

const city = (slug: string) => CITIES.find((c) => c.slug === slug)!;

export const AREAS: Area[] = [
  { id: '22222222-2222-2222-2222-222222222001', cityId: city('lahore').id, name: 'DHA', slug: 'dha' },
  { id: '22222222-2222-2222-2222-222222222002', cityId: city('lahore').id, name: 'Gulberg', slug: 'gulberg' },
  { id: '22222222-2222-2222-2222-222222222003', cityId: city('lahore').id, name: 'Johar Town', slug: 'johar-town' },
  { id: '22222222-2222-2222-2222-222222222004', cityId: city('lahore').id, name: 'Model Town', slug: 'model-town' },
  { id: '22222222-2222-2222-2222-222222222005', cityId: city('karachi').id, name: 'Clifton', slug: 'clifton' },
  { id: '22222222-2222-2222-2222-222222222006', cityId: city('karachi').id, name: 'PECHS', slug: 'pechs' },
  { id: '22222222-2222-2222-2222-222222222007', cityId: city('karachi').id, name: 'Gulshan-e-Iqbal', slug: 'gulshan-e-iqbal' },
  { id: '22222222-2222-2222-2222-222222222008', cityId: city('islamabad').id, name: 'F-7', slug: 'f-7' },
  { id: '22222222-2222-2222-2222-222222222009', cityId: city('islamabad').id, name: 'G-11', slug: 'g-11' },
  { id: '22222222-2222-2222-2222-222222222010', cityId: city('rawalpindi').id, name: 'Saddar', slug: 'saddar' },
  { id: '22222222-2222-2222-2222-222222222011', cityId: city('faisalabad').id, name: 'Madina Town', slug: 'madina-town' },
  { id: '22222222-2222-2222-2222-222222222012', cityId: city('multan').id, name: 'Cantt', slug: 'cantt' },
];

export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function getAreasByCityId(cityId: string): Area[] {
  return AREAS.filter((a) => a.cityId === cityId);
}

export function getAreaById(id: string): Area | undefined {
  return AREAS.find((a) => a.id === id);
}
