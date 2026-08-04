import { Injectable } from '@nestjs/common';
import { Prisma, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HospitalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchPublic(params: { q?: string; cityId?: string; skip: number; take: number }) {
    const where: Prisma.HospitalWhereInput = {
      verificationStatus: VerificationStatus.APPROVED,
      isActive: true,
      deletedAt: null,
      ...(params.cityId ? { cityId: params.cityId } : {}),
      ...(params.q ? { name: { contains: params.q, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.hospital.findMany({
        where,
        include: { city: true, area: true, facilities: true },
        orderBy: [{ avgRating: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.hospital.count({ where }),
    ]);

    return { items, total };
  }

  findPublicById(id: string) {
    return this.prisma.hospital.findFirst({
      where: { id, verificationStatus: VerificationStatus.APPROVED, isActive: true, deletedAt: null },
      include: {
        city: true,
        area: true,
        facilities: true,
        departments: true,
        doctors: {
          include: {
            doctor: { include: { user: true, specialties: { include: { specialty: true } } } },
            department: true,
          },
        },
      },
    });
  }
}
