import { Module } from '@nestjs/common';
import { DoctorsModule } from '../doctors/doctors.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [DoctorsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
