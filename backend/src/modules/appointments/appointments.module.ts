import { Module } from '@nestjs/common';
import { DoctorsModule } from '../doctors/doctors.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PatientsModule } from '../patients/patients.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [DoctorsModule, PatientsModule, IntegrationsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsRepository],
  exports: [AppointmentsRepository, AppointmentsService],
})
export class AppointmentsModule {}
