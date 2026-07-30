import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SearchHospitalsDto } from './dto/search-hospitals.dto';
import { HospitalsService } from './hospitals.service';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Public()
  @Get()
  search(@Query() dto: SearchHospitalsDto) {
    return this.hospitalsService.search(dto);
  }

  @Public()
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.hospitalsService.getById(id);
  }
}
