import { Gender } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpdatePatientProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  fullName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @Length(1, 5)
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  @Length(5, 15)
  cnic?: string;

  @IsOptional()
  @IsUUID()
  cityId?: string;
}
