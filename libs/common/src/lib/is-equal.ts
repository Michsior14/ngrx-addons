/**
 * Check if states are equal
 */
export const isEqual = <T>(prev: T, next: T): boolean => {
  if (prev === next) {
    return true;
  }

  if (!prev || !next || typeof prev !== 'object' || typeof next !== 'object') {
    return false;
  }

  if (Object.getPrototypeOf(prev) !== Object.getPrototypeOf(next)) {
    return false;
  }

  if (prev instanceof Date && next instanceof Date) {
    return prev.getTime() === next.getTime();
  }

  if (prev instanceof Map && next instanceof Map) {
    return isEqualMap(prev, next);
  }

  if (prev instanceof Set && next instanceof Set) {
    return isEqualSet(prev, next);
  }

  const prevSlices = Object.keys(prev) as (keyof typeof prev)[];
  const nextSlices = Object.keys(next) as (keyof typeof next)[];

  if (prevSlices.length !== nextSlices.length) {
    return false;
  }

  if (
    prevSlices.some(
      (slice) => !(slice in next) || !isEqual(prev[slice], next[slice]),
    )
  ) {
    return false;
  }

  return true;
};

const isEqualMap = (
  prev: Map<unknown, unknown>,
  next: Map<unknown, unknown>,
): boolean =>
  prev.size === next.size &&
  [...prev].every(
    ([key, value]) => next.has(key) && isEqual(value, next.get(key)),
  );

const isEqualSet = (prev: Set<unknown>, next: Set<unknown>): boolean =>
  prev.size === next.size && [...prev].every((value) => next.has(value));
