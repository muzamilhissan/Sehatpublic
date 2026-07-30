import { BadRequestException, Injectable } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';
import { DoctorsService } from '../doctors/doctors.service';
import { VerifyDoctorDto } from './dto/verify-doctor.dto';

@Injectable()
export class AdminService {
  constructor(private readonly doctorsService: DoctorsService) {}

  async verifyDoctor(adminUserId: string, doctorId: string, dto: VerifyDoctorDto) {
    const allowedStatuses: VerificationStatus[] = [
      VerificationStatus.APPROVED,
      VerificationStatus.REJECTED,
    ];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException('status must be APPROVED or REJECTED');
    }
    if (dto.status === VerificationStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('rejectionReason is required when rejecting');
    }

    return this.doctorsService.verifyDoctor(doctorId, adminUserId, dto.status, dto.rejectionReason);
  }
}
