import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ReviewPaymentProofDto } from './dto/review-payment-proof.dto';
import { UploadPaymentProofDto } from './dto/upload-payment-proof.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Get('instructions')
  listInstructions() {
    return this.paymentsService.listInstructions();
  }

  @Post('initiate')
  initiate(@CurrentUser() user: AuthenticatedUser, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(user.id, dto);
  }

  @Post(':id/proof')
  uploadProof(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UploadPaymentProofDto,
  ) {
    return this.paymentsService.uploadProof(user.id, id, dto);
  }

  @Roles(AppRole.PLATFORM_ADMIN, AppRole.SUPPORT)
  @Get('proofs/pending')
  listPendingProofs() {
    return this.paymentsService.listPendingProofs();
  }

  @Roles(AppRole.PLATFORM_ADMIN, AppRole.SUPPORT)
  @Post('proofs/:id/review')
  reviewProof(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ReviewPaymentProofDto,
  ) {
    return this.paymentsService.reviewProof(user.id, id, dto);
  }
}
