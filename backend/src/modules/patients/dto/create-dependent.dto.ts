import { DependentRelation, Gender } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateDependentDto {
  @IsString()
  @Length(2, 150)
  fullName!: string;

  @IsOptional()
  @IsEnum(DependentRelation)
  relation?: DependentRelation;

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
}
