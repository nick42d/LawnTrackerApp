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

/**
 * Distributive Omit type - useful for tagged unions.
 * https://stackoverflow.com/a/57103940
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;
/**
 * Simply logs a message with callbackName to say it hasn't been set.
 * @param callbackName
 */

export function LogErrorCallbackNotSet(callbackName: string) {
  console.log(`Error - ${callbackName} not set`);
}

/**
 * Pretty print an output in bytes
 * Throws if above Exibytes
 * @param bytes
 * @param decimals
 * @returns
 */
export function prettyPrintBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
