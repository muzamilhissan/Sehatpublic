import { Injectable } from '@nestjs/common';
import { AvailabilityMode, Prisma, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const PUBLIC_DOCTOR_INCLUDE = {
  user: true,
  specialties: { include: { specialty: true } },
  clinics: { where: { isActive: true, deletedAt: null } },
  city: true,
} satisfies Prisma.DoctorInclude;

@Injectable()
export class DoctorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.doctor.findUnique({
      where: { userId },
      include: PUBLIC_DOCTOR_INCLUDE,
    });
  }

  findByUserIdOrThrow(userId: string) {
    return this.prisma.doctor.findUniqueOrThrow({ where: { userId } });
  }

  findById(id: string) {
    return this.prisma.doctor.findUnique({ where: { id } });
  }

  updateById(id: string, data: Prisma.DoctorUncheckedUpdateInput) {
    return this.prisma.doctor.update({ where: { id }, data, include: PUBLIC_DOCTOR_INCLUDE });
  }

  findPublicById(id: string) {
    return this.prisma.doctor.findFirst({
      where: {
        id,
        verificationStatus: VerificationStatus.APPROVED,
        deletedAt: null,
      },
      include: {
        ...PUBLIC_DOCTOR_INCLUDE,
        availabilities: { where: { isActive: true } },
        exceptions: true,
        educations: { orderBy: { sortOrder: 'asc' } },
        experiences: true,
        languages: true,
      },
    });
  }

  findBookableById(id: string) {
    return this.prisma.doctor.findFirst({
      where: {
        id,
        verificationStatus: VerificationStatus.APPROVED,
        isAcceptingPatients: true,
        deletedAt: null,
      },
    });
  }

  async searchPublic(params: {
    q?: string;
    cityId?: string;
    specialtyId?: string;
    mode?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.DoctorWhereInput = {
      verificationStatus: VerificationStatus.APPROVED,
      isAcceptingPatients: true,
      deletedAt: null,
      ...(params.cityId ? { cityId: params.cityId } : {}),
      ...(params.specialtyId ? { specialties: { some: { specialtyId: params.specialtyId } } } : {}),
      ...(params.mode
        ? { availabilities: { some: { mode: params.mode as AvailabilityMode, isActive: true } } }
        : {}),
      ...(params.q
        ? {
            OR: [
              { user: { fullName: { contains: params.q, mode: 'insensitive' } } },
              { bio: { contains: params.q, mode: 'insensitive' } },
              {
                specialties: {
                  some: { specialty: { name: { contains: params.q, mode: 'insensitive' } } },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.doctor.findMany({
        where,
        include: PUBLIC_DOCTOR_INCLUDE,
        orderBy: [{ avgRating: 'desc' }, { reviewCount: 'desc' }],
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return { items, total };
  }

  findAvailabilities(doctorId: string) {
    return this.prisma.doctorAvailability.findMany({ where: { doctorId } });
  }

  replaceAvailabilities(doctorId: string, windows: Prisma.DoctorAvailabilityCreateManyInput[]) {
    return this.prisma.$transaction([
      this.prisma.doctorAvailability.deleteMany({ where: { doctorId } }),
      this.prisma.doctorAvailability.createMany({ data: windows }),
    ]);
  }

  findExceptions(doctorId: string) {
    return this.prisma.doctorAvailabilityException.findMany({ where: { doctorId } });
  }

  findBookedRanges(doctorId: string, from: Date, to: Date) {
    return this.prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledStart: { gte: from, lt: to },
        status: { notIn: ['CANCELLED', 'EXPIRED', 'RESCHEDULED'] },
      },
      select: { scheduledStart: true, scheduledEnd: true },
    });
  }

  verify(id: string, status: VerificationStatus, verifiedById: string, rejectionReason?: string) {
    return this.prisma.doctor.update({
      where: { id },
      data: {
        verificationStatus: status,
        verifiedAt: new Date(),
        verifiedById,
        rejectionReason: rejectionReason ?? null,
        isAcceptingPatients: status === VerificationStatus.APPROVED ? true : undefined,
      },
    });
  }
}
