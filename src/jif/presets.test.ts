import { describe, expect, it } from "vitest";
import { calculateOrbits } from "./orbits";
import { loadPreset } from "./preset_loader";
import {
  ALL_PRESETS_BY_CATEGORY,
  getPresetSlug,
  sanitizeName,
} from "./presets";

describe("presets", () => {
  const allPresets = Object.values(ALL_PRESETS_BY_CATEGORY).flat();

  describe("slug validation", () => {
    it.each(allPresets.map((p) => [p.name, p]))(
      "%s has a valid slug format",
      (_name, preset) => {
        const slug = getPresetSlug(preset);
        // Slug should be unchanged by sanitizeName (already in correct format)
        expect(sanitizeName(slug)).toBe(slug);
        // Slug should not have consecutive dashes
        expect(slug).not.toMatch(/--/);
        // Slug should not start or end with dashes
        expect(slug).not.toMatch(/^-|-$/);
      },
    );
  });

  describe("preset loading", () => {
    it.each(allPresets.map((p) => [p.name, p]))(
      "%s loads successfully",
      (_name, preset) => {
        expect(() => loadPreset(preset)).not.toThrow();
      },
    );
  });

  describe("orbits generation", () => {
    it.each(allPresets.map((p) => [p.name, p]))(
      "%s generates orbits successfully",
      (_name, preset) => {
        const jif = loadPreset(preset);
        expect(() => calculateOrbits(jif)).not.toThrow();
      },
    );
  });
});
