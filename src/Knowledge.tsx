/// Module intended to contain app business logic

import {GDDAlgorithm} from './state/State';

export const BASE_TEMPS_C = [0, 10];

export function calcGdd(
  t_min: number,
  t_max: number,
  t_base: number,
  algorithm: GDDAlgorithm,
): number {
  if (algorithm !== GDDAlgorithm.VariantB) {
    return Math.max((t_max + t_min) / 2 - t_base, 0);
  } else {
    t_min = Math.max(t_min, t_base);
    return (t_max + t_min) / 2 - t_base;
  }
}
