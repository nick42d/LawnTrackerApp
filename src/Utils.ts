// Module to contain general utility functions

/// Replace a string | undefined with a string, where a blank string is given instead of undefined.
export function ReplaceUndefinedString(s: string | undefined): string {
  if (s === undefined) return '';
  return s;
}

/**
 * @deprecated This has been deprecated - date-fns addDays should be used instead
 */
export function AddDays(day: Date, days: number): Date {
  let newDate = new Date(day);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/**
 * Asynchronous timeout function.
 * Does nothing but return a future that resolves in ms
 */
export async function timeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
