import { FullJIF } from "./jif_loader";

/**
 * Computes the juggler cycle for a pattern.
 * Returns the cycle as an array of juggler labels (with the first label repeated at the end),
 * or null if the permutation doesn't form a single full cycle.
 *
 * Example: For jugglers [A, B, C] with becomes [1, 2, 0], returns ["A", "B", "C", "A"]
 */
export function getJugglerCycle(jif: FullJIF): string[] | null {
  const permutation = jif.jugglers.map((juggler) => juggler.becomes);
  const labels = jif.jugglers.map((juggler) => juggler.label);
  return computeCycle(permutation, labels);
}

/**
 * Computes the limb cycle for a pattern.
 * Returns the cycle as an array of limb indices (with the first repeated at the end),
 * or null if the permutation doesn't form a single full cycle.
 */
export function getLimbCycle(jif: FullJIF): string[] | null {
  const permutation = jif.repetition.limbPermutation;
  const labels = jif.limbs.map((_, i) => String(i));
  return computeCycle(permutation, labels);
}

/**
 * Computes a cycle from a permutation array and labels.
 * Returns null if the permutation doesn't form a single full cycle starting from index 0.
 */
function computeCycle(
  permutation: number[],
  labels: string[],
): string[] | null {
  const cycle: string[] = [];
  const visited = new Set<number>();
  let current = 0;

  while (!visited.has(current)) {
    visited.add(current);
    cycle.push(labels[current]);
    current = permutation[current];
  }

  if (cycle.length !== permutation.length) {
    // Not a full cycle
    return null;
  }

  // Repeat the first label to show the cycle clearly
  cycle.push(labels[0]);
  return cycle;
}
