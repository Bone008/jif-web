import _ from "lodash";
import { siteswapToJIF } from "../jif/high_level_converter";
import { FullJIF, loadWithDefaults } from "../jif/jif_loader";
import { interleaveLocalSiteswap } from "../jif/local_pattern";
import { getThrowsTableByJuggler } from "../jif/orbits";
import { inferIsSynchronousPattern, wrapLimb } from "../jif/util";

export type InterfaceBeatShape = "straight" | "outwards" | "inwards";

const shapeToNum: Record<InterfaceBeatShape, number> = {
  straight: 0,
  outwards: 1,
  inwards: -1,
};

const shapeToChar: Record<InterfaceBeatShape, string> = {
  straight: "S",
  outwards: "O",
  inwards: "I",
};

/**
 * Classifies each beat as a "straight", "outwards" (pass) or "inwards" (self)
 * jag based on whether the throw lands on the same juggler's limbs and/or has
 * a corresponding causal arrow.
 */
export function computeInterfaceShapes(
  jif: FullJIF,
  juggler: number,
): InterfaceBeatShape[] {
  const isSynchronous = inferIsSynchronousPattern(jif);
  // TODO: terrible heuristic :(
  const causalOffset = isSynchronous ? 2 : 4;

  const beatsWithSelf = _.range(jif.repetition.period).map(() => false);
  const beatsWithOutgoing = _.range(jif.repetition.period).map(() => false);

  const throwsTable = getThrowsTableByJuggler(jif);
  const ownLimbs = new Set(
    _.range(jif.limbs.length).filter((l) => jif.limbs[l].juggler === juggler),
  );
  const ownThrows = throwsTable[juggler];
  for (const thrw of ownThrows) {
    if (thrw) {
      let targetTime = thrw.time + thrw.duration - causalOffset;
      let targetLimb = thrw.to;
      [targetTime, targetLimb] = wrapLimb(targetTime, targetLimb, jif);
      if (ownLimbs.has(targetLimb)) {
        beatsWithSelf[targetTime] = true;
      } else {
        beatsWithOutgoing[targetTime] = true;
      }
    }
  }

  return _.range(jif.repetition.period).map((beat) => {
    if (beatsWithOutgoing[beat]) {
      return "outwards";
    } else if (ownThrows[beat] && !beatsWithSelf[beat]) {
      return "inwards";
    } else {
      return "straight";
    }
  });
}

/** Lexicographically maximal rotation of a shape array. */
export function normalizeRotation(
  shapes: InterfaceBeatShape[],
): InterfaceBeatShape[] {
  const n = shapes.length;
  const nums = shapes.map((s) => shapeToNum[s]);
  let bestStart = 0;
  for (let start = 1; start < n; start++) {
    for (let i = 0; i < n; i++) {
      const a = nums[(bestStart + i) % n];
      const b = nums[(start + i) % n];
      if (b > a) {
        bestStart = start;
        break;
      }
      if (b < a) break;
    }
  }
  return Array.from({ length: n }, (_, i) => shapes[(bestStart + i) % n]);
}

export function shapeKey(shapes: InterfaceBeatShape[]): string {
  return shapes.map((s) => shapeToChar[s]).join("");
}

/** Number of clubs for a local pattern: sum of digits / (2 * length). */
export function clubCount(local: string): number {
  const sum = local.split("").reduce((s, ch) => s + parseInt(ch, 36), 0);
  return sum / (2 * local.length);
}

/** Formats a local pattern's club count as e.g. "3.8" or "4". */
export function clubCountLabel(local: string): string {
  const c = clubCount(local);
  return c.toFixed(1);
}

/** Fractional part of the club count rounded to one digit, e.g. "x.7". */
export function fractionalClubsLabel(local: string): string {
  const frac = clubCount(local) % 1;
  return "x." + frac.toFixed(1).split(".")[1];
}

/**
 * Groups locals by puzzle group label (1-digit fractional, with x.5 split by
 * pass count).
 */
export function groupLocalsByPuzzleCategory(
  locals: string[],
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const local of locals) {
    const key = puzzleGroupLabel(local);
    let bucket = groups.get(key);
    if (!bucket) {
      bucket = [];
      groups.set(key, bucket);
    }
    bucket.push(local);
  }
  return groups;
}

/** Computes the normalized interface shape key for a local pattern. */
export function localShapeKey(local: string): string {
  const interleaved = interleaveLocalSiteswap(local);
  // Double so the JIF has a full 2-juggler async period.
  const jif = loadWithDefaults(siteswapToJIF(interleaved + interleaved, 2));
  const shapes = computeInterfaceShapes(jif, 0);
  return shapeKey(normalizeRotation(shapes));
}

/** Number of passes per local period (count of "O" beats / 2 in the shape). */
export function localPassCount(local: string): number {
  const key = localShapeKey(local);
  return (key.match(/O/g) || []).length / 2;
}

/**
 * Group label combining the 1-digit fractional clubs with extra disambiguation
 * for x.5 (which has two distinct shape categories distinguished by pass count).
 */
export function puzzleGroupLabel(local: string): string {
  const frac = fractionalClubsLabel(local);
  if (frac === "x.5") {
    const passes = localPassCount(local);
    return `x.5, ${passes} pass${passes === 1 ? "" : "es"}`;
  }
  return frac;
}

export interface InterfaceGroup {
  shapeKey: string;
  /** "x.500", "x.833", … — sufficient to identify the category in period 6. */
  fracLabel: string;
  locals: string[];
}

/**
 * Groups local patterns by their normalized interface shape. Group order is
 * stable (sorted by shape key). Locals within each group keep their input
 * order.
 */
export function groupLocalsByInterface(locals: string[]): InterfaceGroup[] {
  const groups = new Map<string, InterfaceGroup>();
  for (const local of locals) {
    const key = localShapeKey(local);
    let group = groups.get(key);
    if (!group) {
      group = {
        shapeKey: key,
        fracLabel: fractionalClubsLabel(local),
        locals: [],
      };
      groups.set(key, group);
    }
    group.locals.push(local);
  }
  return [...groups.values()].sort((a, b) =>
    a.shapeKey < b.shapeKey ? -1 : a.shapeKey > b.shapeKey ? 1 : 0,
  );
}
