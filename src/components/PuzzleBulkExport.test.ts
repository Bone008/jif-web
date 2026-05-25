import { describe, expect, it } from "vitest";
import { PERIOD_6_LOCALS, PUZZLE_THROW_DIGITS } from "../data/period6_locals";
import { buildPieceZip, DEFAULT_ZIP_FILENAME } from "../utils/zipPieces";

/**
 * Mirrors the filter PuzzleBulkExport applies to PERIOD_6_LOCALS: a pattern
 * qualifies iff every digit is in the allowed set.
 */
function qualifyingLocals(allowedDigits: string[]): string[] {
  const allowed = new Set(allowedDigits);
  return PERIOD_6_LOCALS.filter((local) =>
    local.split("").every((ch) => allowed.has(ch)),
  );
}

describe("PuzzleBulkExport pattern filter", () => {
  it("yields 61 patterns when only digits 2-9 are checked", () => {
    expect(qualifyingLocals(["2", "4", "5", "6", "7", "8", "9"])).toHaveLength(
      61,
    );
  });

  it("yields 85 patterns when digits 2-a are checked (default state)", () => {
    expect(
      qualifyingLocals(["2", "4", "5", "6", "7", "8", "9", "a"]),
    ).toHaveLength(85);
  });

  it("yields all 131 patterns when every supported digit is checked", () => {
    expect(qualifyingLocals([...PUZZLE_THROW_DIGITS])).toHaveLength(131);
  });

  it("yields 0 patterns when nothing is checked", () => {
    expect(qualifyingLocals([])).toHaveLength(0);
  });
});

describe("PuzzleBulkExport zip generation", () => {
  it("uses 'puzzle-pieces.zip' as the default download filename", () => {
    expect(DEFAULT_ZIP_FILENAME).toBe("puzzle-pieces.zip");
  });

  it("names each SVG file after its local pattern", () => {
    const locals = ["522", "655", "a45", "bbb"];
    const { zip, errors } = buildPieceZip(locals, { doubled: true });
    expect(errors).toEqual([]);
    expect(Object.keys(zip.files).sort()).toEqual([
      "522.svg",
      "655.svg",
      "a45.svg",
      "bbb.svg",
    ]);
  });

  it("contains one SVG per qualifying pattern when given the full P6 list", () => {
    const { zip, errors } = buildPieceZip(PERIOD_6_LOCALS, { doubled: true });
    expect(errors).toEqual([]);
    expect(Object.keys(zip.files)).toHaveLength(131);
    // Every entry ends in .svg
    expect(Object.keys(zip.files).every((name) => name.endsWith(".svg"))).toBe(
      true,
    );
  });
});
