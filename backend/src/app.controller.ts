import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cities')
  getCities() {
    return this.appService.getCities();
  }

  @Get('specialties')
  getSpecialties() {
    return this.appService.getSpecialties();
  }

  @Get('search')
  search(
    @Query('q') q?: string,
    @Query('city') city?: string,
  ) {
    return this.appService.search(q, city);
  }
}
