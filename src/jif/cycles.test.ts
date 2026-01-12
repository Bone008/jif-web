import { describe, it, expect } from "vitest";
import { getJugglerCycle } from "./cycles";
import { loadPresetBySlug } from "./preset_loader";

describe("getJugglerCycle", () => {
  it("returns correct cycle for Dumb ways to die", () => {
    const jif = loadPresetBySlug("dumb-ways-to-die");
    const cycle = getJugglerCycle(jif);
    // A -> M -> C -> B -> A
    expect(cycle).toEqual(["A", "M", "C", "B", "A"]);
  });

  it("returns correct cycle for Scrambled Ivy", () => {
    const jif = loadPresetBySlug("ivy");
    const cycle = getJugglerCycle(jif);
    // A -> M -> B -> C -> A
    expect(cycle).toEqual(["A", "M", "B", "C", "A"]);
  });
});
