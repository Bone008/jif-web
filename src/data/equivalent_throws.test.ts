import { describe, expect, it } from "vitest";
import {
  collapseToLowestVariant,
  equivalentThrowPair,
  equivalentVariants,
} from "./equivalent_throws";
import { classifyEasiestEquivalentDifficulty } from "./difficulty";
import { PERIOD_6_LOCALS } from "./period6_locals";

describe("equivalent throws", () => {
  it("pairs 2/8, 4/a and 5/b", () => {
    expect(equivalentThrowPair(8)).toEqual([2, 8]);
    expect(equivalentThrowPair(4)).toEqual([4, 10]);
    expect(equivalentThrowPair(11)).toEqual([5, 11]);
    expect(equivalentThrowPair(7)).toBeNull();
  });

  it("expands all variants of a local", () => {
    expect(equivalentVariants("724").sort()).toEqual([
      "724",
      "72a",
      "784",
      "78a",
    ]);
    expect(equivalentVariants("777")).toEqual(["777"]);
  });

  it("collapses to the lowest variant", () => {
    expect(collapseToLowestVariant("b84")).toBe("524");
    expect(collapseToLowestVariant("966")).toBe("966");
    // b25 → 525, rotated like its P6 representative 552.
    expect(collapseToLowestVariant("b25")).toBe("552");
  });

  it("collapses the 131 period-6 locals into 40 pieces", () => {
    expect(PERIOD_6_LOCALS).toHaveLength(131);
    expect(new Set(PERIOD_6_LOCALS.map(collapseToLowestVariant)).size).toBe(40);
  });

  it("classifies a merged piece by its easiest variant", () => {
    const beginner = new Set(["524"]);
    expect(classifyEasiestEquivalentDifficulty("b8a", beginner)).toBe(1);
    expect(classifyEasiestEquivalentDifficulty("7a6", beginner)).toBe(2);
  });
});
