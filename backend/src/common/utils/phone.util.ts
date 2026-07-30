/**
 * Normalizes Pakistani phone numbers to an E.164-ish `+92XXXXXXXXXX` format.
 * Accepts local (03XXXXXXXXX), country-code-prefixed (0092.../92...), and
 * already-normalized (+92...) inputs.
 */
export function normalizePakistaniPhone(rawPhone: string): string {
  const trimmed = rawPhone.trim().replace(/[\s-]/g, '');

  if (trimmed.startsWith('+92')) {
    return trimmed;
  }
  if (trimmed.startsWith('0092')) {
    return `+92${trimmed.slice(4)}`;
  }
  if (trimmed.startsWith('92') && trimmed.length === 12) {
    return `+${trimmed}`;
  }
  if (trimmed.startsWith('03') && trimmed.length === 11) {
    return `+92${trimmed.slice(1)}`;
  }

  return trimmed;
}

export function isValidPakistaniPhone(phone: string): boolean {
  return /^\+92[0-9]{10}$/.test(normalizePakistaniPhone(phone));
}
