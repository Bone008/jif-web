import {
  parseManipulator,
  prechacToJif,
  siteswapToJIF,
} from "./high_level_converter";
import { FullJIF, loadWithDefaults } from "./jif_loader";
import { addManipulator } from "./manipulation";
import { findPresetBySlug, Preset } from "./presets";

/**
 * Loads a preset by its slug and returns the fully processed JIF.
 * Applies any manipulators defined in the preset.
 */
export function loadPresetBySlug(slug: string): FullJIF {
  const preset = findPresetBySlug(slug);
  if (!preset) {
    throw new Error(`Preset not found: ${slug}`);
  }
  return loadPreset(preset);
}

/**
 * Loads a preset from its data and returns the fully processed JIF.
 * Applies any manipulators defined in the preset.
 */
export function loadPreset(preset: Preset): FullJIF {
  const instructions = preset.instructions.join("\n");

  // Detect format: siteswap has no whitespace, prechac has whitespace
  const isSiteswap = !instructions.match(/\s/);
  const baseJif = isSiteswap
    ? siteswapToJIF(instructions, 2)
    : prechacToJif(instructions.split("\n"));

  let jif = loadWithDefaults(baseJif);

  if (preset.manipulators) {
    for (const m of preset.manipulators) {
      jif = addManipulator(jif, parseManipulator(m));
    }
  }

  return jif;
}
