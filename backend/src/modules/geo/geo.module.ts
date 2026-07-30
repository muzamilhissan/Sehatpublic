import { Module } from '@nestjs/common';
import { GeoController } from './geo.controller';
import { GeoRepository } from './geo.repository';
import { GeoService } from './geo.service';

@Module({
  controllers: [GeoController],
  providers: [GeoService, GeoRepository],
  exports: [GeoRepository],
})
export class GeoModule {}
