/**
 * Locally equivalent throws in period-6 patterns: throws that differ by the
 * global period (6) land at the same position in the pattern, so a puzzle
 * piece can represent both at once. Each pair is [low, high] in global beats.
 */
const EQUIVALENT_THROW_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [2, 8],
  [4, 10],
  [5, 11],
];

/**
 * Returns the [low, high] pair of equivalent throws containing `duration`, or
 * null if the throw has no equivalent alternative.
 */
export function equivalentThrowPair(
  duration: number,
): readonly [number, number] | null {
  return (
    EQUIVALENT_THROW_PAIRS.find(
      ([low, high]) => duration === low || duration === high,
    ) ?? null
  );
}

/**
 * All locals obtained by independently swapping each throw of `local` with its
 * equivalent counterpart (including `local` itself).
 */
export function equivalentVariants(local: string): string[] {
  let variants = [""];
  for (const ch of local) {
    const pair = equivalentThrowPair(parseInt(ch, 36));
    const options = pair ? pair.map((d) => d.toString(36)) : [ch];
    variants = variants.flatMap((prefix) => options.map((o) => prefix + o));
  }
  return variants;
}

/**
 * Canonical representative of the collapsed (merged) piece containing `local`:
 * every throw is replaced by the low throw of its equivalent pair, then rotated
 * to the lexicographically largest rotation (matching how P6.txt lists them).
 */
export function collapseToLowestVariant(local: string): string {
  const lowest = local
    .split("")
    .map((ch) => {
      const pair = equivalentThrowPair(parseInt(ch, 36));
      return pair ? pair[0].toString(36) : ch;
    })
    .join("");
  const rotations = lowest
    .split("")
    .map((_, r) => lowest.slice(r) + lowest.slice(0, r));
  return rotations.reduce((max, rotation) => (rotation > max ? rotation : max));
}

/** Asset basename of the merged piece represented by `local`, e.g. "524_merged". */
export function mergedPieceName(local: string): string {
  return `${local}_merged`;
}
