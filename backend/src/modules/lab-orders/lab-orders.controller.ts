import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LabOrderStatus } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { LabOrdersService } from './lab-orders.service';

@Controller('lab-orders')
export class LabOrdersController {
  constructor(private readonly labOrdersService: LabOrdersService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateLabOrderDto) {
    return this.labOrdersService.createOrder(user.id, dto);
  }

  @Get()
  listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() pagination: PaginationDto,
    @Query('status') status?: LabOrderStatus,
  ) {
    return this.labOrdersService.listMine(user.id, status, pagination.page ?? 1, pagination.limit ?? 20);
  }

  @Get(':id')
  getById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.labOrdersService.getById(user.id, id);
  }
}
