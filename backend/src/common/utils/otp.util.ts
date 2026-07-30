import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/** Generates a numeric OTP code of the given length (default 6 digits). */
export function generateOtpCode(length = 6): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export async function hashOtpCode(code: string): Promise<string> {
  return bcrypt.hash(code, SALT_ROUNDS);
}

export async function compareOtpCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}
