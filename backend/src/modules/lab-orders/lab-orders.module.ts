import { Module } from '@nestjs/common';
import { LabsModule } from '../labs/labs.module';
import { PatientsModule } from '../patients/patients.module';
import { LabOrdersController } from './lab-orders.controller';
import { LabOrdersRepository } from './lab-orders.repository';
import { LabOrdersService } from './lab-orders.service';

@Module({
  imports: [LabsModule, PatientsModule],
  controllers: [LabOrdersController],
  providers: [LabOrdersService, LabOrdersRepository],
  exports: [LabOrdersRepository, LabOrdersService],
})
export class LabOrdersModule {}
