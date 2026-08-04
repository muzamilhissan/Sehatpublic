import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppRole, VerificationStatus } from '@prisma/client';
import { generateAvailableSlots } from '../../common/utils/slots.util';
import { toDecimal } from '../../common/utils/money.util';
import { PrismaService } from '../../prisma/prisma.service';
import { DoctorsRepository } from './doctors.repository';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { SearchDoctorsDto } from './dto/search-doctors.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { LinkSehatdocDto } from './dto/link-sehatdoc.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Injectable()
export class DoctorsService {
  constructor(
    private readonly doctorsRepository: DoctorsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async registerDoctor(userId: string, dto: RegisterDoctorDto) {
    const existing = await this.doctorsRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('A doctor profile already exists for this account');
    }

    return this.prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.create({
        data: {
          userId,
          cityId: dto.cityId,
          title: dto.title ?? 'Dr',
          pmcNumber: dto.pmcNumber,
          bio: dto.bio,
          yearsExperience: dto.yearsExperience ?? 0,
          consultationFee: toDecimal(dto.consultationFee),
          followupFee: dto.followupFee !== undefined ? toDecimal(dto.followupFee) : undefined,
          specialties: {
            create: dto.specialtyIds.map((specialtyId, index) => ({
              specialtyId,
              isPrimary: index === 0,
            })),
          },
        },
        include: { specialties: { include: { specialty: true } }, user: true },
      });

      await tx.userRole.upsert({
        where: { userId_role: { userId, role: AppRole.DOCTOR } },
        update: { revokedAt: null },
        create: { userId, role: AppRole.DOCTOR },
      });

      return doctor;
    });
  }

  async getMyProfile(userId: string) {
    const doctor = await this.doctorsRepository.findByUserId(userId);
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }
    return doctor;
  }

  async updateMyProfile(userId: string, dto: UpdateDoctorProfileDto) {
    const doctor = await this.doctorsRepository.findByUserId(userId);
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.doctorsRepository.updateById(doctor.id, {
      title: dto.title,
      bio: dto.bio,
      yearsExperience: dto.yearsExperience,
      consultationFee: dto.consultationFee !== undefined ? toDecimal(dto.consultationFee) : undefined,
      followupFee: dto.followupFee !== undefined ? toDecimal(dto.followupFee) : undefined,
      cityId: dto.cityId,
      isAcceptingPatients: dto.isAcceptingPatients,
    });
  }

  /**
   * Opt-in SehtDesk link. Marketplace-only doctors leave sync disabled.
   * Enabling sync requires a booking slug that exists on SehtDesk.
   */
  async linkSehatdoc(userId: string, dto: LinkSehatdocDto) {
    const doctor = await this.doctorsRepository.findByUserId(userId);
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const syncEnabled = dto.sehatdocSyncEnabled ?? doctor.sehatdocSyncEnabled;
    const slug =
      dto.sehatdocBookingSlug !== undefined
        ? dto.sehatdocBookingSlug.trim() || null
        : doctor.sehatdocBookingSlug;

    if (syncEnabled && !slug) {
      throw new BadRequestException(
        'sehatdocBookingSlug is required when sehatdocSyncEnabled is true',
      );
    }

    return this.doctorsRepository.updateById(doctor.id, {
      sehatdocSyncEnabled: syncEnabled,
      sehatdocBookingSlug: slug,
      sehatdocDoctorUserId:
        dto.sehatdocDoctorUserId !== undefined ? dto.sehatdocDoctorUserId : undefined,
      sehatdocClinicId: dto.sehatdocClinicId !== undefined ? dto.sehatdocClinicId : undefined,
    });
  }

  async searchDoctors(dto: SearchDoctorsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { items, total } = await this.doctorsRepository.searchPublic({
      q: dto.q,
      cityId: dto.cityId,
      specialtyId: dto.specialtyId,
      mode: dto.mode,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPublicProfile(id: string) {
    const doctor = await this.doctorsRepository.findPublicById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async setAvailability(userId: string, dto: SetAvailabilityDto) {
    const doctor = await this.doctorsRepository.findByUserId(userId);
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    await this.doctorsRepository.replaceAvailabilities(
      doctor.id,
      dto.windows.map((w) => ({
        doctorId: doctor.id,
        dayOfWeek: w.dayOfWeek,
        startTime: w.startTime,
        endTime: w.endTime,
        slotMinutes: w.slotMinutes ?? 15,
        mode: w.mode ?? 'ONLINE',
        clinicId: w.clinicId,
      })),
    );

    return this.doctorsRepository.findAvailabilities(doctor.id);
  }

  async getAvailableSlots(doctorId: string, dateStr: string): Promise<string[]> {
    const doctor = await this.doctorsRepository.findBookableById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor is not currently available for booking');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr ?? '')) {
      throw new BadRequestException('date query param is required in YYYY-MM-DD format');
    }

    const date = new Date(`${dateStr}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date, expected format YYYY-MM-DD');
    }

    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    const [availabilities, exceptions, bookedAppointments] = await Promise.all([
      this.doctorsRepository.findAvailabilities(doctorId),
      this.doctorsRepository.findExceptions(doctorId),
      this.doctorsRepository.findBookedRanges(doctorId, date, nextDay),
    ]);

    const slots = generateAvailableSlots({
      date,
      availabilities,
      exceptions,
      bookedRanges: bookedAppointments.map((a) => ({ start: a.scheduledStart, end: a.scheduledEnd })),
      now: new Date(),
    });

    return slots.map((slot) => slot.toISOString());
  }

  async verifyDoctor(
    doctorId: string,
    adminUserId: string,
    status: VerificationStatus,
    rejectionReason?: string,
  ) {
    const doctor = await this.doctorsRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return this.doctorsRepository.verify(doctorId, status, adminUserId, rejectionReason);
  }
}
