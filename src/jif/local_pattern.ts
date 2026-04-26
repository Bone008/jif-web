import { isValidSiteswap } from "./validation";

/** Doubles a local siteswap by interleaving 0s: "524" → "502040". */
export function interleaveLocalSiteswap(local: string): string {
  return local
    .split("")
    .map((ch) => ch + "0")
    .join("");
}

/**
 * Combines two local siteswaps (one per juggler) into a valid 2-juggler async
 * global siteswap by trying each rotation of B against A and returning the first
 * rotation that produces a valid siteswap.
 *
 * Returns null if no rotation produces a valid siteswap.
 */
export function combineLocalsToGlobal(
  localA: string,
  localB: string,
): { global: string; rotationOfB: number } | null {
  if (localA.length !== localB.length) {
    return null;
  }
  const n = localA.length;
  for (let r = 0; r < n; r++) {
    const bRot = localB.slice(r) + localB.slice(0, r);
    let global = "";
    for (let i = 0; i < n; i++) {
      global += localA[i] + bRot[i];
    }
    if (isValidSiteswap(global, 2)) {
      return { global, rotationOfB: r };
    }
  }
  return null;
}
