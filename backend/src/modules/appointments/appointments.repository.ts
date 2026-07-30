import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const APPOINTMENT_INCLUDE = {
  doctor: { include: { user: true } },
  patient: { include: { user: true } },
  dependent: true,
  clinic: true,
  hospital: true,
} satisfies Prisma.AppointmentInclude;

const NON_ACTIVE_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.CANCELLED,
  AppointmentStatus.EXPIRED,
  AppointmentStatus.RESCHEDULED,
];

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOverlapping(doctorId: string, start: Date, end: Date) {
    return this.prisma.appointment.findFirst({
      where: {
        doctorId,
        status: { notIn: NON_ACTIVE_STATUSES },
        scheduledStart: { lt: end },
        scheduledEnd: { gt: start },
      },
    });
  }

  async createWithHistory(data: Prisma.AppointmentUncheckedCreateInput) {
    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({ data, include: APPOINTMENT_INCLUDE });
      await tx.appointmentStatusHistory.create({
        data: { appointmentId: appointment.id, toStatus: appointment.status, note: 'Created' },
      });
      return appointment;
    });
  }

  findById(id: string) {
    return this.prisma.appointment.findUnique({ where: { id }, include: APPOINTMENT_INCLUDE });
  }

  findByIdForPatient(id: string, patientId: string) {
    return this.prisma.appointment.findFirst({
      where: { id, patientId },
      include: APPOINTMENT_INCLUDE,
    });
  }

  async listForPatient(
    patientId: string,
    params: { status?: AppointmentStatus; skip: number; take: number },
  ) {
    const where: Prisma.AppointmentWhereInput = {
      patientId,
      ...(params.status ? { status: params.status } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: APPOINTMENT_INCLUDE,
        orderBy: { scheduledStart: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return { items, total };
  }

  async updateStatus(
    id: string,
    toStatus: AppointmentStatus,
    note?: string,
    extra?: Prisma.AppointmentUncheckedUpdateInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.appointment.findUniqueOrThrow({ where: { id } });
      const updated = await tx.appointment.update({
        where: { id },
        data: { status: toStatus, ...extra },
        include: APPOINTMENT_INCLUDE,
      });
      await tx.appointmentStatusHistory.create({
        data: { appointmentId: id, fromStatus: current.status, toStatus, note },
      });
      return updated;
    });
  }

  findExpiredPendingPayments(before: Date) {
    return this.prisma.appointment.findMany({
      where: { status: AppointmentStatus.PENDING_PAYMENT, paymentExpiresAt: { lt: before } },
    });
  }
}
