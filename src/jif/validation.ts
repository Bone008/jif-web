import { siteswapToJIF } from "./high_level_converter";
import { FullJIF, loadWithDefaults } from "./jif_loader";
import { calculateOrbits } from "./orbits";

export function isValidJif(jif: FullJIF): boolean {
  return quietly(() => {
    try {
      // Necessary condition: sum of durations must be a multiple of the period
      // (= integer number of objects). Catches cases where calculateOrbits
      // happens to close cleanly mod-period despite a non-integer object count.
      const period = jif.repetition.period;
      const sum = jif.throws.reduce((s, t) => s + t.duration, 0);
      if (sum % period !== 0) return false;

      // Destination uniqueness: no two throws may land on the same (limb, time).
      const seen = new Set<string>();
      for (const t of jif.throws) {
        const key = `${t.to}@${(t.time + t.duration) % period}`;
        if (seen.has(key)) return false;
        seen.add(key);
      }

      calculateOrbits(jif);
      return true;
    } catch {
      return false;
    }
  });
}

export function isValidSiteswap(
  siteswap: string,
  numJugglers: number = 2,
): boolean {
  return quietly(() => {
    try {
      return isValidJif(loadWithDefaults(siteswapToJIF(siteswap, numJugglers)));
    } catch {
      return false;
    }
  });
}

/**
 * Runs `fn` with console output suppressed. Used inside validation helpers
 * because calculateOrbits is intentionally probed on invalid siteswaps and its
 * pre-throw debug logs would otherwise spam every keystroke.
 */
function quietly<T>(fn: () => T): T {
  const origLog = console.log;
  const origError = console.error;
  const origWarn = console.warn;
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  try {
    return fn();
  } finally {
    console.log = origLog;
    console.error = origError;
    console.warn = origWarn;
  }
}
