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
