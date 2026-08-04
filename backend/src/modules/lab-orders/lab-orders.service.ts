import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CollectionType, LabOrderStatus, Prisma } from '@prisma/client';
import { addDecimals, subtractDecimals, toDecimal } from '../../common/utils/money.util';
import { LabsRepository } from '../labs/labs.repository';
import { PatientsRepository } from '../patients/patients.repository';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { LabOrdersRepository } from './lab-orders.repository';

interface OrderItemDraft {
  labTestId?: string;
  packageId?: string;
  nameSnapshot: string;
  priceSnapshot: Prisma.Decimal;
}

@Injectable()
export class LabOrdersService {
  constructor(
    private readonly labOrdersRepository: LabOrdersRepository,
    private readonly labsRepository: LabsRepository,
    private readonly patientsRepository: PatientsRepository,
    private readonly configService: ConfigService,
  ) {}

  async createOrder(userId: string, dto: CreateLabOrderDto) {
    const patient = await this.patientsRepository.findByUserId(userId);
    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const lab = await this.labsRepository.findBookableLab(dto.labId);
    if (!lab) {
      throw new NotFoundException('Lab is not currently available for booking');
    }

    if (dto.dependentId) {
      const dependent = await this.patientsRepository.findDependent(dto.dependentId, patient.id);
      if (!dependent) {
        throw new BadRequestException('Dependent does not belong to this patient');
      }
    }

    const orderItems: OrderItemDraft[] = [];
    let subtotal = toDecimal(0);

    for (const item of dto.items) {
      if (!item.labTestId && !item.packageId) {
        throw new BadRequestException('Each item must reference either labTestId or packageId');
      }

      if (item.labTestId) {
        const price = await this.labsRepository.findTestPriceForLab(dto.labId, item.labTestId);
        if (!price || !price.isAvailable) {
          throw new BadRequestException(`Test ${item.labTestId} is not offered by this lab`);
        }
        const labTest = await this.labsRepository.findTestById(item.labTestId);
        orderItems.push({
          labTestId: item.labTestId,
          nameSnapshot: labTest?.name ?? 'Lab Test',
          priceSnapshot: price.price,
        });
        subtotal = addDecimals(subtotal, price.price);
      } else if (item.packageId) {
        const pkg = await this.labsRepository.findPackageForLab(dto.labId, item.packageId);
        if (!pkg) {
          throw new BadRequestException(`Package ${item.packageId} is not offered by this lab`);
        }
        orderItems.push({ packageId: item.packageId, nameSnapshot: pkg.name, priceSnapshot: pkg.price });
        subtotal = addDecimals(subtotal, pkg.price);
      }
    }

    const collectionFee =
      dto.collectionType === CollectionType.HOME ? toDecimal(lab.homeCollectionFee) : toDecimal(0);
    const discountAmount = toDecimal(0);
    const platformFee = toDecimal(0);
    const taxAmount = toDecimal(0);
    const totalAmount = subtractDecimals(
      addDecimals(subtotal, collectionFee, platformFee, taxAmount),
      discountAmount,
    );

    const holdMinutes = this.configService.get<number>('app.paymentHoldMinutes') ?? 30;
    const paymentExpiresAt = new Date(Date.now() + holdMinutes * 60_000);

    return this.labOrdersRepository.createWithHistory({
      patientId: patient.id,
      dependentId: dto.dependentId,
      labId: dto.labId,
      branchId: dto.branchId,
      collectionType: dto.collectionType,
      status: LabOrderStatus.PENDING_PAYMENT,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      subtotalAmount: subtotal,
      collectionFee,
      discountAmount,
      platformFee,
      taxAmount,
      totalAmount,
      paymentExpiresAt,
      items: { create: orderItems },
    });
  }

  async getById(userId: string, id: string) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    const order = await this.labOrdersRepository.findByIdForPatient(id, patient.id);
    if (!order) {
      throw new NotFoundException('Lab order not found');
    }
    return order;
  }

  async listMine(userId: string, status: LabOrderStatus | undefined, page: number, limit: number) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    const { items, total } = await this.labOrdersRepository.listForPatient(patient.id, {
      status,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /** Called by PaymentsService once a payment for this lab order is confirmed PAID. */
  async confirmAfterPayment(labOrderId: string) {
    return this.labOrdersRepository.updateStatus(labOrderId, LabOrderStatus.BOOKED, 'Payment confirmed');
  }
}
