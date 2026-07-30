import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.patientsService.getMyProfile(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePatientProfileDto) {
    return this.patientsService.updateMyProfile(user.id, dto);
  }

  @Get('me/dependents')
  listDependents(@CurrentUser() user: AuthenticatedUser) {
    return this.patientsService.listDependents(user.id);
  }

  @Post('me/dependents')
  createDependent(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDependentDto) {
    return this.patientsService.createDependent(user.id, dto);
  }

  @Delete('me/dependents/:id')
  removeDependent(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.patientsService.removeDependent(user.id, id);
  }

  @Get('me/addresses')
  listAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.patientsService.listAddresses(user.id);
  }

  @Post('me/addresses')
  createAddress(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAddressDto) {
    return this.patientsService.createAddress(user.id, dto);
  }

  @Delete('me/addresses/:id')
  removeAddress(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.patientsService.removeAddress(user.id, id);
  }
}
