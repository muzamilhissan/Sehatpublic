import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UploadPaymentProofDto {
  @IsString()
  storageKey!: string;

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsString()
  transferReference?: string;

  @IsOptional()
  @IsNumber()
  amountClaimed?: number;
}
