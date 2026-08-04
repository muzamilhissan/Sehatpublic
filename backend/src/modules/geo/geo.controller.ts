import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Public()
  @Get('cities')
  listCities() {
    return this.geoService.listCities();
  }

  @Public()
  @Get('cities/:cityId/areas')
  listAreas(@Param('cityId') cityId: string) {
    return this.geoService.listAreas(cityId);
  }
}
