import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppointmentMode, AppointmentStatus, CancelledBy } from '@prisma/client';
import { addDecimals, subtractDecimals, toDecimal } from '../../common/utils/money.util';
import { DoctorsRepository } from '../doctors/doctors.repository';
import { SehatdocSyncService } from '../integrations/sehatdoc-sync.service';
import { PatientsRepository } from '../patients/patients.repository';
import { AppointmentsRepository } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';

const DEFAULT_SLOT_DURATION_MINUTES = 15;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly doctorsRepository: DoctorsRepository,
    private readonly patientsRepository: PatientsRepository,
    private readonly configService: ConfigService,
    private readonly sehatdocSync: SehatdocSyncService,
  ) {}

  async createAppointment(userId: string, dto: CreateAppointmentDto) {
    const patient = await this.patientsRepository.findByUserId(userId);
    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const doctor = await this.doctorsRepository.findBookableById(dto.doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor is not currently available for booking');
    }

    if (dto.dependentId) {
      const dependent = await this.patientsRepository.findDependent(dto.dependentId, patient.id);
      if (!dependent) {
        throw new BadRequestException('Dependent does not belong to this patient');
      }
    }

    if (dto.mode === AppointmentMode.IN_PERSON && !dto.clinicId) {
      throw new BadRequestException('clinicId is required for in-person appointments');
    }

    const scheduledStart = new Date(dto.scheduledStart);
    if (Number.isNaN(scheduledStart.getTime())) {
      throw new BadRequestException('Invalid scheduledStart date/time');
    }
    if (scheduledStart.getTime() < Date.now()) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    const scheduledEnd = new Date(
      scheduledStart.getTime() + DEFAULT_SLOT_DURATION_MINUTES * 60_000,
    );

    const overlapping = await this.appointmentsRepository.findOverlapping(
      doctor.id,
      scheduledStart,
      scheduledEnd,
    );
    if (overlapping) {
      throw new ConflictException('This slot is no longer available');
    }

    const feeAmount = toDecimal(doctor.consultationFee);
    const discountAmount = toDecimal(0);
    const platformFee = toDecimal(0);
    const taxAmount = toDecimal(0);
    const totalAmount = subtractDecimals(
      addDecimals(feeAmount, platformFee, taxAmount),
      discountAmount,
    );

    const holdMinutes = this.configService.get<number>('app.paymentHoldMinutes') ?? 30;
    const paymentExpiresAt = new Date(Date.now() + holdMinutes * 60_000);

    return this.appointmentsRepository.createWithHistory({
      patientId: patient.id,
      dependentId: dto.dependentId,
      doctorId: doctor.id,
      clinicId: dto.clinicId,
      mode: dto.mode,
      status: AppointmentStatus.PENDING_PAYMENT,
      scheduledStart,
      scheduledEnd,
      feeAmount,
      discountAmount,
      platformFee,
      taxAmount,
      totalAmount,
      couponId: dto.couponId,
      paymentExpiresAt,
    });
  }

  async getById(userId: string, id: string) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    const appointment = await this.appointmentsRepository.findByIdForPatient(id, patient.id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async listMine(userId: string, dto: ListAppointmentsDto) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { items, total } = await this.appointmentsRepository.listForPatient(patient.id, {
      status: dto.status,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async cancel(userId: string, id: string, reason?: string) {
    const patient = await this.patientsRepository.findByUserIdOrThrow(userId);
    const appointment = await this.appointmentsRepository.findByIdForPatient(id, patient.id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const nonCancellable: AppointmentStatus[] = [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.EXPIRED,
    ];
    if (nonCancellable.includes(appointment.status)) {
      throw new BadRequestException(`Cannot cancel an appointment with status ${appointment.status}`);
    }

    return this.appointmentsRepository.updateStatus(
      id,
      AppointmentStatus.CANCELLED,
      reason ?? 'Cancelled by patient',
      {
        cancelledBy: CancelledBy.PATIENT,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    );
  }

  /** Called by PaymentsService once a payment for this appointment is confirmed PAID. */
  async confirmAfterPayment(appointmentId: string) {
    const confirmed = await this.appointmentsRepository.updateStatus(
      appointmentId,
      AppointmentStatus.CONFIRMED,
      'Payment confirmed',
    );
    // Best-effort SehtDesk sync — never blocks or rolls back confirmation
    await this.sehatdocSync.onAppointmentConfirmed(appointmentId);
    return confirmed;
  }
}
