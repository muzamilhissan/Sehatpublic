import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { DoctorsService } from './doctors.service';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { SearchDoctorsDto } from './dto/search-doctors.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { LinkSehatdocDto } from './dto/link-sehatdoc.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Public()
  @Get()
  search(@Query() dto: SearchDoctorsDto) {
    return this.doctorsService.searchDoctors(dto);
  }

  @Post('register')
  register(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegisterDoctorDto) {
    return this.doctorsService.registerDoctor(user.id, dto);
  }

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.doctorsService.getMyProfile(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateDoctorProfileDto) {
    return this.doctorsService.updateMyProfile(user.id, dto);
  }

  @Patch('me/sehatdoc-link')
  linkSehatdoc(@CurrentUser() user: AuthenticatedUser, @Body() dto: LinkSehatdocDto) {
    return this.doctorsService.linkSehatdoc(user.id, dto);
  }

  @Post('me/availability')
  setAvailability(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetAvailabilityDto) {
    return this.doctorsService.setAvailability(user.id, dto);
  }

  @Public()
  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    return this.doctorsService.getPublicProfile(id);
  }

  @Public()
  @Get(':id/slots')
  getSlots(@Param('id') id: string, @Query('date') date: string) {
    return this.doctorsService.getAvailableSlots(id, date);
  }
}
