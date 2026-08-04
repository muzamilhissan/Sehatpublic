import { AppointmentMode } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId!: string;

  @IsOptional()
  @IsUUID()
  dependentId?: string;

  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @IsEnum(AppointmentMode)
  mode!: AppointmentMode;

  @IsISO8601()
  scheduledStart!: string;

  @IsOptional()
  @IsUUID()
  couponId?: string;
}
