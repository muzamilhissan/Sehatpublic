import { Module } from '@nestjs/common';
import { OutboxWorkerService } from './outbox-worker.service';
import { SehatdocSyncService } from './sehatdoc-sync.service';

@Module({
  providers: [SehatdocSyncService, OutboxWorkerService],
  exports: [SehatdocSyncService],
})
export class IntegrationsModule {}
