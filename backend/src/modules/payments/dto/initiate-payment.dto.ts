import { PayableType, PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class InitiatePaymentDto {
  @IsEnum(PayableType)
  payableType!: PayableType;

  @IsUUID()
  payableId!: string;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @IsUUID()
  paymentInstructionId?: string;
}
