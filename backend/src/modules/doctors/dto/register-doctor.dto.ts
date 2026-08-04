import { ArrayMinSize, IsArray, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class RegisterDoctorDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  title?: string;

  @IsOptional()
  @IsString()
  pmcNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;

  @IsNumber()
  @Min(0)
  consultationFee!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  followupFee?: number;

  @IsOptional()
  @IsUUID()
  cityId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  specialtyIds!: string[];
}
