import { describe, it, expect } from "vitest";
import { inferIsSynchronousPattern, wrapLimb, wrapJuggler } from "./util";
import { DATA_5_COUNT_POPCORN } from "./test_data";
import { loadWithDefaults } from "./jif_loader";

describe("inferIsSynchronousPattern", () => {
  it("returns true when single juggler", () => {
    const jif = { jugglers: [{ becomes: 0 }], throws: [] } as any;
    expect(inferIsSynchronousPattern(jif)).toBe(true);
  });

  it("returns true for ", () => {
    const jif = {
      jugglers: [{}, {}],
      throws: [{ time: 0 }, { time: 0 }],
    } as any;
    expect(inferIsSynchronousPattern(jif)).toBe(true);
  });

  it("returns false for popcorn", () => {
    const jif = loadWithDefaults(DATA_5_COUNT_POPCORN);

    expect(inferIsSynchronousPattern(jif)).toBe(false);
  });
});

describe("wrapLimb", () => {
  it("wraps forward across period applying permutation", () => {
    const jif = {
      repetition: { period: 3, limbPermutation: [1, 2, 0] },
    } as any;
    const [t, l] = wrapLimb(4, 0, jif);
    expect(t).toBe(1);
    expect(l).toBe(1);
  });

  it("wraps negative time reversing permutation", () => {
    const jif = {
      repetition: { period: 3, limbPermutation: [2, 0, 1] },
    } as any;
    const [t, l] = wrapLimb(-1, 2, jif);
    expect(t).toBe(2);
    expect(l).toBe(0);
  });
});

describe("wrapJuggler", () => {
  it("wraps forward and applies relabeling for single wrap", () => {
    const jif = {
      repetition: { period: 4 },
      jugglers: [{ becomes: 1 }, { becomes: 0 }],
    } as any;
    const [t, j] = wrapJuggler(5, 0, jif);
    expect(t).toBe(1);
    expect(j).toBe(1);
  });

  it("wraps forward multiple times applying chained relabeling", () => {
    const jif = {
      repetition: { period: 3 },
      jugglers: [{ becomes: 1 }, { becomes: 2 }, { becomes: 0 }],
    } as any;
    const [t, j] = wrapJuggler(7, 0, jif);
    expect(t).toBe(1);
    expect(j).toBe(2);
  });

  it("wraps negative time reversing relabeling", () => {
    const jif = {
      repetition: { period: 3 },
      jugglers: [{ becomes: 1 }, { becomes: 2 }, { becomes: 0 }],
    } as any;
    const [t, j] = wrapJuggler(-1, 0, jif);
    expect(t).toBe(2);
    // reverse of becomes mapping: becomes[2] === 0 so index 2 becomes 0, reverse mapping yields 2
    expect(j).toBe(2);
  });
});
