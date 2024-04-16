/**
 * Format days remaining in T+/-x style.
 * @param daysRem
 */
export function formatDaysRem(daysRem: number): string {
  return `T${Math.sign(daysRem) >= 0 ? '-' : '+'}${Math.abs(daysRem)}`;
}
