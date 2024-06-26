/// Module intended to contain app business logic

import {GddAlgorithm, GddBaseTemp} from './providers/settingscontext/Types';

export function calcGdd(
  t_min: number,
  t_max: number,
  t_base: number,
  algorithm: GddAlgorithm,
): number {
  if (algorithm === 'Variant A') {
    return Math.max((t_max + t_min) / 2 - t_base, 0);
  } else {
    t_min = Math.max(t_min, t_base);
    return (t_max + t_min) / 2 - t_base;
  }
}

export function celsiustoFarenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function farenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}
