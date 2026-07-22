/**
 * Catalog of period-6 local siteswaps (length-3, 2-juggler async). Sourced from
 * src/data/P6.txt.
 */

import p6Text from "./P6.txt?raw";
import p6BeginnerText from "./P6_beginner.txt?raw";

export const PUZZLE_THROW_DIGITS = [
  "2",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
] as const;

export type PuzzleThrowDigit = (typeof PUZZLE_THROW_DIGITS)[number];

export const PERIOD_6_LOCALS: string[] = p6Text
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

/** Locals considered beginner-friendly. Sourced from src/data/P6_beginner.txt. */
export const PERIOD_6_BEGINNER_LOCALS: ReadonlySet<string> = new Set(
  p6BeginnerText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0),
);

/** True if any rotation of `local` is in the beginner set. */
export function isBeginnerLocal(local: string): boolean {
  const n = local.length;
  for (let r = 0; r < n; r++) {
    if (PERIOD_6_BEGINNER_LOCALS.has(local.slice(r) + local.slice(0, r))) {
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
export function classifyDifficulty(local: string): number {
  if (isBeginnerLocal(local)) return 1;
  const maxThrow = Math.max(...local.split("").map((ch) => parseInt(ch, 36)));
  if (maxThrow <= 9) return 2;
  if (maxThrow <= 11) return 3; // "b" === 11
  return 4;
}
