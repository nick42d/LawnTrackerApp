export const BASE_TEMPS_C = [0, 10];

export function calcGdd(
  t_min: number,
  t_max: number,
  t_base: number,
  // Variant b from wikipedia https://en.wikipedia.org/wiki/Growing_degree-day
  is_variant_b = false,
): number {
  if (!is_variant_b) {
    return Math.max((t_max + t_min) / 2 - t_base, 0);
  } else {
    t_min = Math.max(t_min, t_base);
    return (t_max + t_min) / 2 - t_base;
  }
}
