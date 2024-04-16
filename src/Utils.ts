// Module to contain general utility functions

/// Replace a string | undefined with a string, where a blank string is given instead of undefined.
export function replaceUndefinedString(s: string | undefined): string {
  if (s === undefined) return '';
  return s;
}

/**
 * Asynchronous timeout function.
 * Does nothing but return a future that resolves in ms
 */
export async function timeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
