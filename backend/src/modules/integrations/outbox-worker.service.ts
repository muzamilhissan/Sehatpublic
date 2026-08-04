import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SehatdocSyncService } from './sehatdoc-sync.service';

/**
 * Lightweight outbox poller. Keeps Sehatpublic independent of SehtDesk —
 * if Desk is down, marketplace bookings still succeed and sync retries later.
 */
@Injectable()
export class OutboxWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxWorkerService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly sehatdocSync: SehatdocSyncService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const enabled = this.configService.get<boolean>('app.sehatdoc.outboxEnabled') ?? true;
    if (!enabled) {
      this.logger.log('SehtDesk outbox worker disabled');
      return;
    }
    const intervalMs = this.configService.get<number>('app.sehatdoc.outboxIntervalMs') ?? 10_000;
    this.timer = setInterval(() => {
      this.sehatdocSync.processPendingOutbox().catch((err) => {
        this.logger.error(`Outbox tick failed: ${(err as Error).message}`);
      });
    }, intervalMs);
    // Unref so the timer does not keep the process alive in tests if needed
    if (typeof this.timer.unref === 'function') this.timer.unref();
    this.logger.log(`SehtDesk outbox worker started (every ${intervalMs}ms)`);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
