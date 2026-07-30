import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeskSyncStatus, OutboxStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const OUTBOX_BOOKING_CONFIRMED = 'booking.confirmed';

interface BookingConfirmedPayload {
  appointmentId: string;
  bookingSlug: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number | null;
  patientGender?: string | null;
  reason?: string | null;
  scheduledStart: string; // ISO
}

@Injectable()
export class SehatdocSyncService {
  private readonly logger = new Logger(SehatdocSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * After marketplace appointment is CONFIRMED: either mark NOT_LINKED
   * (doctor has no Desk) or enqueue an outbox event for best-effort sync.
   * Never throws in a way that rolls back the local confirmation.
   */
  async onAppointmentConfirmed(appointmentId: string): Promise<void> {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          doctor: true,
          patient: { include: { user: true } },
          dependent: true,
        },
      });

      if (!appointment) {
        this.logger.warn(`onAppointmentConfirmed: appointment ${appointmentId} not found`);
        return;
      }

      const doctor = appointment.doctor;
      const linked =
        doctor.sehatdocSyncEnabled &&
        !!doctor.sehatdocBookingSlug &&
        doctor.sehatdocBookingSlug.trim().length > 0;

      if (!linked) {
        await this.prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            syncStatus: DeskSyncStatus.NOT_LINKED,
            syncError: null,
            syncedAt: null,
          },
        });
        return;
      }

      const patientName =
        appointment.dependent?.fullName ??
        appointment.patient.user.fullName ??
        'Patient';
      const patientPhone = appointment.patient.user.phone;

      let patientAge: number | null = null;
      const dob = appointment.dependent?.dateOfBirth ?? appointment.patient.dateOfBirth;
      if (dob) {
        const years = Math.floor(
          (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
        );
        if (years >= 0 && years < 130) patientAge = years;
      }

      const gender =
        appointment.dependent?.gender ?? appointment.patient.gender ?? undefined;

      const payload: BookingConfirmedPayload = {
        appointmentId: appointment.id,
        bookingSlug: doctor.sehatdocBookingSlug!,
        patientName,
        patientPhone,
        patientAge,
        patientGender: gender ?? null,
        reason: `Sehatpublic booking ${appointment.id}`,
        scheduledStart: appointment.scheduledStart.toISOString(),
      };

      await this.prisma.$transaction([
        this.prisma.appointment.update({
          where: { id: appointmentId },
          data: { syncStatus: DeskSyncStatus.PENDING, syncError: null },
        }),
        this.prisma.outboxEvent.create({
          data: {
            eventType: OUTBOX_BOOKING_CONFIRMED,
            aggregateType: 'appointment',
            aggregateId: appointmentId,
            payload: payload as unknown as Prisma.InputJsonValue,
            status: OutboxStatus.PENDING,
            availableAt: new Date(),
          },
        }),
      ]);
    } catch (err) {
      this.logger.error(
        `onAppointmentConfirmed failed for ${appointmentId}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      await this.prisma.appointment
        .update({
          where: { id: appointmentId },
          data: {
            syncStatus: DeskSyncStatus.FAILED,
            syncError: (err as Error).message.slice(0, 1000),
          },
        })
        .catch(() => undefined);
    }
  }

  /** Process pending outbox rows (called by worker). */
  async processPendingOutbox(limit = 20): Promise<number> {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        status: OutboxStatus.PENDING,
        availableAt: { lte: new Date() },
        eventType: OUTBOX_BOOKING_CONFIRMED,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    let processed = 0;
    for (const event of events) {
      await this.processOne(event.id);
      processed += 1;
    }
    return processed;
  }

  private async processOne(eventId: string): Promise<void> {
    const event = await this.prisma.outboxEvent.findUnique({ where: { id: eventId } });
    if (!event || event.status !== OutboxStatus.PENDING) return;

    const payload = event.payload as unknown as BookingConfirmedPayload;
    const baseUrl = this.configService.get<string>('app.sehatdoc.apiUrl')?.replace(/\/$/, '');

    if (!baseUrl) {
      await this.failEvent(event.id, payload.appointmentId, 'SEHATDOC_API_URL is not configured');
      return;
    }

    try {
      const { date, time } = this.toPktDateTime(payload.scheduledStart);
      const url = `${baseUrl}/api/booking/${encodeURIComponent(payload.bookingSlug)}`;

      const body = {
        name: payload.patientName,
        phone: payload.patientPhone,
        age: payload.patientAge ?? undefined,
        gender: this.mapGender(payload.patientGender),
        reason: payload.reason ?? `Sehatpublic ${payload.appointmentId}`,
        date,
        time,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      if (!res.ok) {
        // Slot already taken on Desk — treat as soft success if duplicate-ish,
        // otherwise retry / fail. Marketplace booking stays CONFIRMED either way.
        const retryable = res.status >= 500 || res.status === 429;
        if (retryable && event.attempts < 8) {
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              attempts: { increment: 1 },
              lastError: `HTTP ${res.status}: ${text.slice(0, 500)}`,
              availableAt: new Date(Date.now() + this.backoffMs(event.attempts + 1)),
            },
          });
          return;
        }
        await this.failEvent(
          event.id,
          payload.appointmentId,
          `HTTP ${res.status}: ${text.slice(0, 500)}`,
        );
        return;
      }

      await this.prisma.$transaction([
        this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: OutboxStatus.PUBLISHED,
            publishedAt: new Date(),
            lastError: null,
          },
        }),
        this.prisma.appointment.update({
          where: { id: payload.appointmentId },
          data: {
            syncStatus: DeskSyncStatus.SYNCED,
            syncError: null,
            syncedAt: new Date(),
          },
        }),
      ]);
      this.logger.log(`Synced appointment ${payload.appointmentId} → SehtDesk ${payload.bookingSlug}`);
    } catch (err) {
      const message = (err as Error).message;
      if (event.attempts < 8) {
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            attempts: { increment: 1 },
            lastError: message.slice(0, 500),
            availableAt: new Date(Date.now() + this.backoffMs(event.attempts + 1)),
          },
        });
        return;
      }
      await this.failEvent(event.id, payload.appointmentId, message);
    }
  }

  private async failEvent(eventId: string, appointmentId: string, error: string) {
    await this.prisma.$transaction([
      this.prisma.outboxEvent.update({
        where: { id: eventId },
        data: {
          status: OutboxStatus.FAILED,
          lastError: error.slice(0, 1000),
          attempts: { increment: 1 },
        },
      }),
      this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          syncStatus: DeskSyncStatus.FAILED,
          syncError: error.slice(0, 1000),
        },
      }),
    ]);
    this.logger.error(`SehtDesk sync failed for ${appointmentId}: ${error}`);
  }

  /** Convert ISO timestamptz → Asia/Karachi calendar date + HH:mm for Desk public booking. */
  private toPktDateTime(iso: string): { date: string; time: string } {
    const d = new Date(iso);
    const pkt = new Date(d.getTime() + 5 * 60 * 60 * 1000);
    const yyyy = pkt.getUTCFullYear();
    const mm = String(pkt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(pkt.getUTCDate()).padStart(2, '0');
    const hh = String(pkt.getUTCHours()).padStart(2, '0');
    const mi = String(pkt.getUTCMinutes()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
  }

  private mapGender(g?: string | null): string | undefined {
    if (!g) return undefined;
    const upper = g.toUpperCase();
    if (upper === 'MALE') return 'Male';
    if (upper === 'FEMALE') return 'Female';
    return g;
  }

  private backoffMs(attempt: number): number {
    return Math.min(30 * 60_000, 5_000 * 2 ** Math.min(attempt, 6));
  }
}
