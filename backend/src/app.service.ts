import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Sehatdoc API is running!';
  }

  getCities() {
    return {
      popular: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Gujranwala', 'Multan'],
      all: [
        'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Gujranwala', 'Multan',
        'Peshawar', 'Rawalpindi', 'Quetta', 'Sialkot', 'Bahawalpur', 'Sargodha',
        'Sukkur', 'Larkana', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat'
      ]
    };
  }

  getSpecialties() {
    return [
      'Gynecologist', 'Dermatologist', 'Gastroenterologist', 'Urologist',
      'Cardiologist', 'Neurologist', 'Psychiatrist', 'General Physician',
      'Dentist', 'Oral and maxillofacial surgeon', 'Internal Medicine Specialist', 'Audiometrist',
      'Infertility Consultant', 'Dietitian', 'Thoracic Surgeon', 'Male Infertility Specialist',
      'Aesthetic Medicine Specialist', 'Maternal Fetal Medicine Specialist', 'Reproductive Endocrinologist', 'Family Medicine'
    ];
  }

  search(query?: string, city?: string) {
    const mockDoctors = [
      { id: 1, name: 'Dr. Sarah Khan', specialty: 'Gynecologist', city: 'Lahore', rating: 4.9, experience: '12 years', clinic: 'Sehat Care Clinic' },
      { id: 2, name: 'Dr. Muhammad Ahmed', specialty: 'Cardiologist', city: 'Karachi', rating: 4.8, experience: '15 years', clinic: 'Heart & Lung Center' },
      { id: 3, name: 'Dr. Ayesha Malik', specialty: 'Dermatologist', city: 'Islamabad', rating: 4.7, experience: '8 years', clinic: 'Skin Care Clinic' },
      { id: 4, name: 'Dr. Usman Ali', specialty: 'Dentist', city: 'Lahore', rating: 4.6, experience: '10 years', clinic: 'Dental Care Hospital' },
      { id: 5, name: 'Dr. Fatima Zahra', specialty: 'Pediatrician', city: 'Karachi', rating: 4.9, experience: '7 years', clinic: 'Children First Clinic' },
      { id: 6, name: 'Dr. Bilal Raza', specialty: 'Gastroenterologist', city: 'Faisalabad', rating: 4.8, experience: '14 years', clinic: 'Al-Shifa Medics' }
    ];

    let results = mockDoctors;

    if (city) {
      results = results.filter(doc => doc.city.toLowerCase() === city.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(doc => 
        doc.name.toLowerCase().includes(q) || 
        doc.specialty.toLowerCase().includes(q) || 
        doc.clinic.toLowerCase().includes(q)
      );
    }

    return results;
  }
}
