import { Injectable } from '@nestjs/common';
import { PayableType, PaymentProofStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPayment(data: Prisma.PaymentUncheckedCreateInput) {
    return this.prisma.payment.create({ data });
  }

  findActivePaymentForPayable(payableType: PayableType, payableId: string) {
    return this.prisma.payment.findFirst({
      where: {
        payableType,
        payableId,
        status: { notIn: [PaymentStatus.FAILED, PaymentStatus.CANCELLED] },
      },
      orderBy: { createdAt: 'desc' },
      include: { proofs: true, paymentInstruction: true },
    });
  }

  findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { proofs: true, paymentInstruction: true },
    });
  }

  updateStatus(id: string, status: PaymentStatus, extra?: Prisma.PaymentUncheckedUpdateInput) {
    return this.prisma.payment.update({ where: { id }, data: { status, ...extra } });
  }

  createProof(data: Prisma.PaymentProofUncheckedCreateInput) {
    return this.prisma.paymentProof.create({ data });
  }

  findProofById(id: string) {
    return this.prisma.paymentProof.findUnique({ where: { id }, include: { payment: true } });
  }

  updateProofStatus(
    id: string,
    status: PaymentProofStatus,
    reviewedById: string,
    rejectionReason?: string,
  ) {
    return this.prisma.paymentProof.update({
      where: { id },
      data: { status, reviewedById, reviewedAt: new Date(), rejectionReason: rejectionReason ?? null },
    });
  }

  listActiveInstructions() {
    return this.prisma.paymentInstruction.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findInstructionById(id: string) {
    return this.prisma.paymentInstruction.findFirst({ where: { id, isActive: true } });
  }

  listPendingProofs() {
    return this.prisma.paymentProof.findMany({
      where: { status: PaymentProofStatus.UPLOADED },
      include: { payment: true },
      orderBy: { uploadedAt: 'asc' },
    });
  }
}
