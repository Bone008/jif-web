/**
 * Catalog of period-6 local siteswaps (length-3, 2-juggler async). Sourced from
 * scripts/data/P6.txt.
 */

import p6Text from "../../scripts/data/P6.txt?raw";

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
