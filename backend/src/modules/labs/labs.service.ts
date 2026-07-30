import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchLabTestsDto } from './dto/search-lab-tests.dto';
import { SearchLabsDto } from './dto/search-labs.dto';
import { LabsRepository } from './labs.repository';

@Injectable()
export class LabsService {
  constructor(private readonly labsRepository: LabsRepository) {}

  async search(dto: SearchLabsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { items, total } = await this.labsRepository.searchPublic({
      q: dto.q,
      cityId: dto.cityId,
      homeCollection: dto.homeCollection,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    const lab = await this.labsRepository.findPublicById(id);
    if (!lab) {
      throw new NotFoundException('Lab not found');
    }
    return lab;
  }

  async searchTests(dto: SearchLabTestsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { items, total } = await this.labsRepository.searchTests({
      q: dto.q,
      category: dto.category,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
