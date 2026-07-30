import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ProofReviewDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewPaymentProofDto {
  @IsEnum(ProofReviewDecision)
  decision!: ProofReviewDecision;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
