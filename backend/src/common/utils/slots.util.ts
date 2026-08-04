/**
 * Pure helpers to turn a doctor's weekly availability windows + per-date
 * exceptions + already-booked ranges into a list of bookable slot start times
 * for a given calendar day.
 */

export interface AvailabilityWindow {
  dayOfWeek: number; // 0=Sun … 6=Sat
  startTime: string; // local HH:mm
  endTime: string; // local HH:mm
  slotMinutes: number;
  mode: string;
  clinicId?: string | null;
  isActive: boolean;
}

export interface AvailabilityException {
  date: Date;
  isOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export interface BookedRange {
  start: Date;
  end: Date;
}

export interface GenerateSlotsParams {
  /** The calendar day (UTC midnight) to generate slots for. */
  date: Date;
  availabilities: AvailabilityWindow[];
  exceptions: AvailabilityException[];
  bookedRanges: BookedRange[];
  /** Slots starting before `now` are excluded (defaults to no filtering). */
  now?: Date;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function startOfDayUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Generates the list of available slot start times for a single day, given
 * the doctor's weekly recurring windows, one-off exceptions, and existing
 * (non-cancelled) appointments.
 */
export function generateAvailableSlots(params: GenerateSlotsParams): Date[] {
  const { availabilities, exceptions, bookedRanges, now } = params;
  const dayStart = startOfDayUtc(params.date);
  const dayOfWeek = dayStart.getUTCDay();

  const exception = exceptions.find((e) => startOfDayUtc(e.date).getTime() === dayStart.getTime());

  if (exception?.isOff) {
    return [];
  }

  const recurringWindows = availabilities.filter((a) => a.isActive && a.dayOfWeek === dayOfWeek);

  const effectiveWindows =
    exception?.startTime && exception?.endTime
      ? [
          {
            startTime: exception.startTime,
            endTime: exception.endTime,
            slotMinutes: recurringWindows[0]?.slotMinutes ?? 15,
          },
        ]
      : recurringWindows;

  const slots: Date[] = [];

  for (const window of effectiveWindows) {
    const startMinutes = parseTimeToMinutes(window.startTime);
    const endMinutes = parseTimeToMinutes(window.endTime);
    const step = window.slotMinutes > 0 ? window.slotMinutes : 15;

    for (let minute = startMinutes; minute + step <= endMinutes; minute += step) {
      const slotStart = new Date(dayStart.getTime() + minute * 60_000);
      const slotEnd = new Date(slotStart.getTime() + step * 60_000);

      if (now && slotStart < now) {
        continue;
      }

      const overlapsExisting = bookedRanges.some(
        (booked) => slotStart < booked.end && slotEnd > booked.start,
      );

      if (!overlapsExisting) {
        slots.push(slotStart);
      }
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}
