import { describe, it, expect } from "vitest";
import { getJugglerCycle } from "./cycles";
import { loadWithDefaults } from "./jif_loader";
import { prechacToJif, parseManipulator } from "./high_level_converter";
import { addManipulator } from "./manipulation";
import { findPresetByName, sanitizePresetName } from "./presets";

function loadPresetWithManipulators(presetName: string) {
  const preset = findPresetByName(sanitizePresetName(presetName));
  if (!preset) {
    throw new Error(`Preset not found: ${presetName}`);
  }

  const lines = preset.instructions.split("\n");
  let jif = loadWithDefaults(prechacToJif(lines));

  if (preset.manipulators) {
    for (const m of preset.manipulators) {
      jif = addManipulator(jif, parseManipulator(m));
    }
  }

  return jif;
}

describe("getJugglerCycle", () => {
  it("returns correct cycle for Dumb ways to die", () => {
    const jif = loadPresetWithManipulators("Dumb ways to die");
    const cycle = getJugglerCycle(jif);
    // A -> M -> C -> B -> A
    expect(cycle).toEqual(["A", "M", "C", "B", "A"]);
  });

  it("returns correct cycle for Scrambled Ivy", () => {
    const jif = loadPresetWithManipulators("Scrambled - iA cC sC - Ivy");
    const cycle = getJugglerCycle(jif);
    // A -> M -> B -> C -> A
    expect(cycle).toEqual(["A", "M", "B", "C", "A"]);
  });
});
