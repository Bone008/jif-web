/**
 * Pure difficulty-classification helpers, parameterized by the beginner-local
 * set. Kept free of the `?raw` text imports in `period6_locals.ts` so that
 * Node scripts (e.g. `scripts/build-stls.ts`, run via tsx) can import it
 * without a Vite bundler to resolve the `.txt?raw` modules.
 */

/** True if any rotation of `local` is in the beginner set. */
export function isBeginnerLocal(
  local: string,
  beginnerLocals: ReadonlySet<string>,
): boolean {
  const n = local.length;
  for (let r = 0; r < n; r++) {
    if (beginnerLocals.has(local.slice(r) + local.slice(0, r))) {
      return true;
    }
  }
  return false;
}

/**
 * Difficulty level of a local pattern:
 * - 1: contained in the beginner set
 * - 2: max throw <= 9 and not in the beginner set
 * - 3: max throw <= b
 * - 4: anything higher
 */
export function classifyDifficulty(
  local: string,
  beginnerLocals: ReadonlySet<string>,
): number {
  if (isBeginnerLocal(local, beginnerLocals)) return 1;
  const maxThrow = Math.max(...local.split("").map((ch) => parseInt(ch, 36)));
  if (maxThrow <= 9) return 2;
  if (maxThrow <= 11) return 3; // "b" === 11
  return 4;
}
