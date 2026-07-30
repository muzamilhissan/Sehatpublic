import { Injectable } from '@nestjs/common';
import { Prisma, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LabsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchPublic(params: {
    q?: string;
    cityId?: string;
    homeCollection?: boolean;
    skip: number;
    take: number;
  }) {
    const where: Prisma.LabWhereInput = {
      verificationStatus: VerificationStatus.APPROVED,
      isActive: true,
      deletedAt: null,
      ...(params.cityId ? { cityId: params.cityId } : {}),
      ...(params.homeCollection !== undefined ? { homeCollection: params.homeCollection } : {}),
      ...(params.q ? { name: { contains: params.q, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lab.findMany({
        where,
        include: { city: true, branches: { where: { isActive: true, deletedAt: null } } },
        orderBy: [{ avgRating: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.lab.count({ where }),
    ]);

    return { items, total };
  }

  findPublicById(id: string) {
    return this.prisma.lab.findFirst({
      where: { id, verificationStatus: VerificationStatus.APPROVED, isActive: true, deletedAt: null },
      include: {
        city: true,
        branches: { where: { isActive: true, deletedAt: null } },
        prices: { where: { isAvailable: true }, include: { labTest: true } },
        packages: {
          where: { isActive: true, deletedAt: null },
          include: { tests: { include: { labTest: true } } },
        },
      },
    });
  }

  async searchTests(params: { q?: string; category?: string; skip: number; take: number }) {
    const where: Prisma.LabTestWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(params.category ? { category: params.category } : {}),
      ...(params.q ? { name: { contains: params.q, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.labTest.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.labTest.count({ where }),
    ]);

    return { items, total };
  }

  findTestById(id: string) {
    return this.prisma.labTest.findUnique({ where: { id } });
  }

  findTestPriceForLab(labId: string, labTestId: string) {
    return this.prisma.labTestPrice.findUnique({ where: { labId_labTestId: { labId, labTestId } } });
  }

  findPackageForLab(labId: string, packageId: string) {
    return this.prisma.labPackage.findFirst({
      where: { id: packageId, labId, isActive: true, deletedAt: null },
    });
  }

  findBookableLab(labId: string) {
    return this.prisma.lab.findFirst({
      where: { id: labId, verificationStatus: VerificationStatus.APPROVED, isActive: true, deletedAt: null },
    });
  }
}
