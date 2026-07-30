import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PayableType, PaymentMethod, PaymentProofStatus, PaymentStatus, Prisma } from '@prisma/client';
import { AppointmentsRepository } from '../appointments/appointments.repository';
import { AppointmentsService } from '../appointments/appointments.service';
import { LabOrdersRepository } from '../lab-orders/lab-orders.repository';
import { LabOrdersService } from '../lab-orders/lab-orders.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ProofReviewDecision, ReviewPaymentProofDto } from './dto/review-payment-proof.dto';
import { UploadPaymentProofDto } from './dto/upload-payment-proof.dto';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly appointmentsService: AppointmentsService,
    private readonly labOrdersRepository: LabOrdersRepository,
    private readonly labOrdersService: LabOrdersService,
  ) {}

  listInstructions() {
    return this.paymentsRepository.listActiveInstructions();
  }

  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const { amount } = await this.resolvePayable(userId, dto.payableType, dto.payableId);

    const existing = await this.paymentsRepository.findActivePaymentForPayable(
      dto.payableType,
      dto.payableId,
    );
    if (existing && existing.status === PaymentStatus.PAID) {
      throw new ConflictException('This order has already been paid');
    }

    if (dto.method === PaymentMethod.MANUAL_TRANSFER) {
      if (!dto.paymentInstructionId) {
        throw new BadRequestException('paymentInstructionId is required for MANUAL_TRANSFER');
      }
      const instruction = await this.paymentsRepository.findInstructionById(dto.paymentInstructionId);
      if (!instruction) {
        throw new BadRequestException('Selected payment instruction is not available');
      }

      return this.paymentsRepository.createPayment({
        payerUserId: userId,
        payableType: dto.payableType,
        payableId: dto.payableId,
        amount,
        method: dto.method,
        paymentInstructionId: dto.paymentInstructionId,
        status: PaymentStatus.AWAITING_PROOF,
      });
    }

    if (dto.method === PaymentMethod.CASH) {
      const payment = await this.paymentsRepository.createPayment({
        payerUserId: userId,
        payableType: dto.payableType,
        payableId: dto.payableId,
        amount,
        method: dto.method,
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      });

      await this.confirmPayable(dto.payableType, dto.payableId);

      return payment;
    }

    throw new BadRequestException(`Payment method ${dto.method} is not supported in v1`);
  }

  async uploadProof(userId: string, paymentId: string, dto: UploadPaymentProofDto) {
    const payment = await this.paymentsRepository.findById(paymentId);
    if (!payment || payment.payerUserId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    const allowedStatuses: PaymentStatus[] = [PaymentStatus.AWAITING_PROOF, PaymentStatus.PROOF_REJECTED];
    if (!allowedStatuses.includes(payment.status)) {
      throw new BadRequestException(`Cannot upload proof while payment is in status ${payment.status}`);
    }

    await this.paymentsRepository.createProof({
      paymentId,
      storageKey: dto.storageKey,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      transferReference: dto.transferReference,
      amountClaimed: dto.amountClaimed !== undefined ? new Prisma.Decimal(dto.amountClaimed) : undefined,
    });

    return this.paymentsRepository.updateStatus(paymentId, PaymentStatus.PENDING_VERIFICATION);
  }

  async reviewProof(adminUserId: string, proofId: string, dto: ReviewPaymentProofDto) {
    const proof = await this.paymentsRepository.findProofById(proofId);
    if (!proof) {
      throw new NotFoundException('Payment proof not found');
    }

    if (proof.status !== PaymentProofStatus.UPLOADED) {
      throw new BadRequestException('This proof has already been reviewed');
    }

    if (dto.decision === ProofReviewDecision.APPROVE) {
      await this.paymentsRepository.updateProofStatus(proofId, PaymentProofStatus.APPROVED, adminUserId);
      const payment = await this.paymentsRepository.updateStatus(proof.paymentId, PaymentStatus.PAID, {
        paidAt: new Date(),
        verifiedAt: new Date(),
      });
      await this.confirmPayable(payment.payableType, payment.payableId);
      return payment;
    }

    await this.paymentsRepository.updateProofStatus(
      proofId,
      PaymentProofStatus.REJECTED,
      adminUserId,
      dto.rejectionReason,
    );
    return this.paymentsRepository.updateStatus(proof.paymentId, PaymentStatus.PROOF_REJECTED, {
      failureReason: dto.rejectionReason,
    });
  }

  listPendingProofs() {
    return this.paymentsRepository.listPendingProofs();
  }

  private async resolvePayable(userId: string, payableType: PayableType, payableId: string) {
    if (payableType === PayableType.APPOINTMENT) {
      const appointment = await this.appointmentsRepository.findById(payableId);
      if (!appointment || appointment.patient.userId !== userId) {
        throw new NotFoundException('Appointment not found');
      }
      return { payable: appointment, amount: appointment.totalAmount };
    }

    const labOrder = await this.labOrdersRepository.findById(payableId);
    if (!labOrder || labOrder.patient.userId !== userId) {
      throw new NotFoundException('Lab order not found');
    }
    return { payable: labOrder, amount: labOrder.totalAmount };
  }

  private async confirmPayable(payableType: PayableType, payableId: string) {
    if (payableType === PayableType.APPOINTMENT) {
      await this.appointmentsService.confirmAfterPayment(payableId);
    } else {
      await this.labOrdersService.confirmAfterPayment(payableId);
    }
  }
}
