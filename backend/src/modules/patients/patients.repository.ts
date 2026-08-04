import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PatientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.patient.findUnique({
      where: { userId },
      include: { user: true, city: true },
    });
  }

  findByUserIdOrThrow(userId: string) {
    return this.prisma.patient.findUniqueOrThrow({ where: { userId } });
  }

  updateProfile(patientId: string, data: Prisma.PatientUncheckedUpdateInput) {
    return this.prisma.patient.update({ where: { id: patientId }, data });
  }

  updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  listDependents(patientId: string) {
    return this.prisma.patientDependent.findMany({
      where: { patientId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  createDependent(data: Prisma.PatientDependentUncheckedCreateInput) {
    return this.prisma.patientDependent.create({ data });
  }

  findDependent(id: string, patientId: string) {
    return this.prisma.patientDependent.findFirst({ where: { id, patientId } });
  }

  deactivateDependent(id: string) {
    return this.prisma.patientDependent.update({ where: { id }, data: { isActive: false } });
  }

  listAddresses(patientId: string) {
    return this.prisma.patientAddress.findMany({
      where: { patientId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  createAddress(data: Prisma.PatientAddressUncheckedCreateInput) {
    return this.prisma.patientAddress.create({ data });
  }

  findAddress(id: string, patientId: string) {
    return this.prisma.patientAddress.findFirst({ where: { id, patientId } });
  }

  clearDefaultAddresses(patientId: string) {
    return this.prisma.patientAddress.updateMany({
      where: { patientId, isDefault: true },
      data: { isDefault: false },
    });
  }

  deleteAddress(id: string) {
    return this.prisma.patientAddress.delete({ where: { id } });
  }
}
