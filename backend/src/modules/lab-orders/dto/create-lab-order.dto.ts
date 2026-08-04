import { CollectionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class LabOrderItemDto {
  @IsOptional()
  @IsUUID()
  labTestId?: string;

  @IsOptional()
  @IsUUID()
  packageId?: string;
}

export class CreateLabOrderDto {
  @IsUUID()
  labId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  dependentId?: string;

  @IsEnum(CollectionType)
  collectionType!: CollectionType;

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;

  @IsOptional()
  @IsUUID()
  addressId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LabOrderItemDto)
  items!: LabOrderItemDto[];
}
