import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchHospitalsDto } from './dto/search-hospitals.dto';
import { HospitalsRepository } from './hospitals.repository';

@Injectable()
export class HospitalsService {
  constructor(private readonly hospitalsRepository: HospitalsRepository) {}

  async search(dto: SearchHospitalsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { items, total } = await this.hospitalsRepository.searchPublic({
      q: dto.q,
      cityId: dto.cityId,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const hospital = await this.hospitalsRepository.findPublicById(id);
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }
    return hospital;
  }
}
