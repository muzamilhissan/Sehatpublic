import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  title?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  followupFee?: number;

  @IsOptional()
  @IsUUID()
  cityId?: string;

  @IsOptional()
  @IsBoolean()
  isAcceptingPatients?: boolean;
}
