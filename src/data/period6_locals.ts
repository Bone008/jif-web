/**
 * Catalog of period-6 local siteswaps (length-3, 2-juggler async). Sourced from
 * src/data/P6.txt.
 */

import {
  classifyDifficulty as classifyDifficultyWith,
  isBeginnerLocal as isBeginnerLocalWith,
} from "./difficulty";
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
  return isBeginnerLocalWith(local, PERIOD_6_BEGINNER_LOCALS);
}

/** Difficulty level (1-4) of a local pattern. See {@link classifyDifficultyWith}. */
export function classifyDifficulty(local: string): number {
  return classifyDifficultyWith(local, PERIOD_6_BEGINNER_LOCALS);
}
