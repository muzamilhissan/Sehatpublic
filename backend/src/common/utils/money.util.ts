import { Prisma } from '@prisma/client';

export type MoneyInput = number | string | Prisma.Decimal | null | undefined;

export function toDecimal(value: MoneyInput): Prisma.Decimal {
  if (value === null || value === undefined) {
    return new Prisma.Decimal(0);
  }
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export function decimalToNumber(value: MoneyInput): number {
  return toDecimal(value).toNumber();
}

export function addDecimals(...values: MoneyInput[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>((sum, v) => sum.plus(toDecimal(v)), new Prisma.Decimal(0));
}

export function subtractDecimals(a: MoneyInput, b: MoneyInput): Prisma.Decimal {
  return toDecimal(a).minus(toDecimal(b));
}
