import { AvailabilityMode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class AvailabilityWindowDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @Matches(TIME_REGEX, { message: 'startTime must be in HH:mm format' })
  startTime!: string;

  @Matches(TIME_REGEX, { message: 'endTime must be in HH:mm format' })
  endTime!: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(180)
  slotMinutes?: number = 15;

  @IsOptional()
  @IsEnum(AvailabilityMode)
  mode?: AvailabilityMode = AvailabilityMode.ONLINE;

  @IsOptional()
  @IsUUID()
  clinicId?: string;
}

export class SetAvailabilityDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityWindowDto)
  windows!: AvailabilityWindowDto[];
}
