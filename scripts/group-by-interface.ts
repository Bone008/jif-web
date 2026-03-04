import _ from "lodash";
import { readFileSync, writeFileSync } from "fs";
import { siteswapToJIF } from "../src/jif/high_level_converter.ts";
import { FullJIF, loadWithDefaults } from "../src/jif/jif_loader.ts";
import { getThrowsTableByJuggler } from "../src/jif/orbits.ts";
import { inferIsSynchronousPattern, wrapLimb } from "../src/jif/util.ts";

type InterfaceBeatShape = "straight" | "outwards" | "inwards";

function interleaveLocalSiteswap(siteswap: string): string {
  return siteswap
    .split("")
    .map((ch) => ch + "0")
    .join("");
}

function computeInterfaceShapes(
  jif: FullJIF,
  juggler: number,
): InterfaceBeatShape[] {
  const isSynchronous = inferIsSynchronousPattern(jif);
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

/** Return the lexicographically maximum rotation of the array. */
function normalizeRotation(shapes: InterfaceBeatShape[]): InterfaceBeatShape[] {
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

function shapeKey(shapes: InterfaceBeatShape[]): string {
  return shapes.map((s) => shapeToChar[s]).join("");
}

/** Number of clubs = sum of digits / (2 * number of digits). */
function clubCount(ss: string): number {
  const sum = ss.split("").reduce((s, ch) => s + parseInt(ch, 36), 0);
  return sum / (2 * ss.length);
}

/** Fractional part as "x.NNN" (3 decimal places). */
function fractionalClubs(ss: string): string {
  const frac = clubCount(ss) % 1;
  return `x.${frac.toFixed(3).split(".")[1]}`;
}

// --- main ---
const inputFile = process.argv[2] || "scripts/data/P6.txt";
const outputFile =
  process.argv[3] || inputFile.replace(/\.txt$/, "_grouped.txt");

const lines = readFileSync(inputFile, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

const groups = new Map<string, string[]>();
const errors: string[] = [];

for (const ss of lines) {
  try {
    const interleaved = interleaveLocalSiteswap(ss);
    const doubled = interleaved + interleaved;
    const jif = siteswapToJIF(doubled, 2);
    const fullJif = loadWithDefaults(jif);
    const shapes = computeInterfaceShapes(fullJif, 0);
    const normalized = normalizeRotation(shapes);
    const key = shapeKey(normalized);

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ss);
  } catch (e) {
    errors.push(`${ss}: ${e}`);
  }
}

// Sort groups by key for consistent output
const sortedKeys = [...groups.keys()].sort();

const out: string[] = [];
for (const key of sortedKeys) {
  const localPasses = (key.match(/O/g) || []).length / 2;
  const frac = fractionalClubs(groups.get(key)![0]);
  out.push(`[${key}] (passes: ${localPasses}, clubs: ${frac})`);
  for (const ss of groups.get(key)!) {
    out.push(ss);
  }
  out.push("");
}

if (errors.length > 0) {
  out.push("# Errors");
  for (const err of errors) {
    out.push(`# ${err}`);
  }
}

writeFileSync(outputFile, out.join("\n"));
console.log(
  `Grouped ${lines.length} siteswaps into ${groups.size} shapes → ${outputFile}`,
);
if (errors.length > 0) {
  console.error(`${errors.length} errors (see end of output file)`);
}
