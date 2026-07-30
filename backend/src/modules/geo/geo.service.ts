import { Injectable, NotFoundException } from '@nestjs/common';
import { GeoRepository } from './geo.repository';

@Injectable()
export class GeoService {
  constructor(private readonly geoRepository: GeoRepository) {}

  listCities() {
    return this.geoRepository.findActiveCities();
  }

  async listAreas(cityId: string) {
    const city = await this.geoRepository.findCityById(cityId);
    if (!city) {
      throw new NotFoundException('City not found');
    }
    return this.geoRepository.findAreasByCity(cityId);
  }
}
