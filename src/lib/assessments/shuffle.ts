/**
 * Produces a repeatable numeric seed from a string.
 */
export function createShuffleSeed(
  value: string
): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);

    hash = Math.imul(
      hash,
      16777619
    );
  }

  return hash >>> 0;
}

/**
 * Small deterministic pseudo-random generator.
 */
function mulberry32(seed: number) {
  return function random() {
    let value =
      (seed += 0x6d2b79f5);

    value = Math.imul(
      value ^ (value >>> 15),
      value | 1
    );

    value ^=
      value +
      Math.imul(
        value ^ (value >>> 7),
        value | 61
      );

    return (
      ((value ^ (value >>> 14)) >>> 0) /
      4294967296
    );
  };
}

/**
 * Returns a new deterministically shuffled array.
 */
export function deterministicShuffle<T>(
  items: readonly T[],
  seedValue: string
): T[] {
  const result = [...items];

  const random = mulberry32(
    createShuffleSeed(seedValue)
  );

  for (
    let index = result.length - 1;
    index > 0;
    index--
  ) {
    const targetIndex =
      Math.floor(
        random() * (index + 1)
      );

    [
      result[index],
      result[targetIndex],
    ] = [
      result[targetIndex],
      result[index],
    ];
  }

  return result;
}