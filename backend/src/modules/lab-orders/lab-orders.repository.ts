import { Injectable } from '@nestjs/common';
import { LabOrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const LAB_ORDER_INCLUDE = {
  patient: true,
  lab: true,
  branch: true,
  items: true,
  dependent: true,
} satisfies Prisma.LabOrderInclude;

@Injectable()
export class LabOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithHistory(data: Prisma.LabOrderUncheckedCreateInput) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.labOrder.create({ data, include: LAB_ORDER_INCLUDE });
      await tx.labOrderStatusHistory.create({
        data: { labOrderId: order.id, toStatus: order.status, note: 'Created' },
      });
      return order;
    });
  }

  findById(id: string) {
    return this.prisma.labOrder.findUnique({ where: { id }, include: LAB_ORDER_INCLUDE });
  }

  findByIdForPatient(id: string, patientId: string) {
    return this.prisma.labOrder.findFirst({ where: { id, patientId }, include: LAB_ORDER_INCLUDE });
  }

  async listForPatient(
    patientId: string,
    params: { status?: LabOrderStatus; skip: number; take: number },
  ) {
    const where: Prisma.LabOrderWhereInput = {
      patientId,
      ...(params.status ? { status: params.status } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.labOrder.findMany({
        where,
        include: LAB_ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.labOrder.count({ where }),
    ]);
    return { items, total };
  }

  async updateStatus(
    id: string,
    toStatus: LabOrderStatus,
    note?: string,
    extra?: Prisma.LabOrderUncheckedUpdateInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.labOrder.findUniqueOrThrow({ where: { id } });
      const updated = await tx.labOrder.update({
        where: { id },
        data: { status: toStatus, ...extra },
        include: LAB_ORDER_INCLUDE,
      });
      await tx.labOrderStatusHistory.create({
        data: { labOrderId: id, fromStatus: current.status, toStatus, note },
      });
      return updated;
    });
  }
}
