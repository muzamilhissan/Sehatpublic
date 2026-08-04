import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SearchLabTestsDto } from './dto/search-lab-tests.dto';
import { SearchLabsDto } from './dto/search-labs.dto';
import { LabsService } from './labs.service';

@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Public()
  @Get()
  search(@Query() dto: SearchLabsDto) {
    return this.labsService.search(dto);
  }

  @Public()
  @Get('tests')
  searchTests(@Query() dto: SearchLabTestsDto) {
    return this.labsService.searchTests(dto);
  }

  @Public()
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.labsService.getById(id);
  }
}
