import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GeoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveCities() {
    return this.prisma.city.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  findCityById(id: string) {
    return this.prisma.city.findFirst({ where: { id, deletedAt: null } });
  }

  findAreasByCity(cityId: string) {
    return this.prisma.area.findMany({
      where: { cityId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }
}
