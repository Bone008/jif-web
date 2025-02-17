import _ from "lodash";
import { FullJIF, FullThrow, inferPeriod } from "./jif_loader";

export type ThrowsTableData = Array<FullThrow | null>[];

/** Returns a table of throws, first indexed by juggler, then by the beat/time. */
export function getThrowsTable(data: FullJIF): ThrowsTableData {
  // Assumptions: integer throws, only 1 throw per juggler per beat
  const period = inferPeriod(data);
  // Indexed by [juggler][time].
  const throwsTable: Array<FullThrow | null>[] = Array.from(
    { length: data.jugglers.length },
    () => Array(period).fill(null),
  );
  for (const thrw of data.throws) {
    const juggler = data.limbs[thrw.from].juggler;
    if (throwsTable[juggler][thrw.time]) {
      console.warn(
        `\nWARNING: More than 1 throw detected by juggler ${
          data.jugglers[juggler].label
        } at time ${thrw.time}!\n`,
      );
    }
    throwsTable[juggler][thrw.time] = thrw;
  }
  return throwsTable;
}

export function orbits(data: FullJIF): FullThrow[][] {
  const throwsTable = getThrowsTable(data);
  const period = inferPeriod(data);

  console.log("Table:");
  printThrowsTable(data, throwsTable);
  console.log("\nHands:");
  printThrowsTable(data, throwsTable, true);

  console.log("\nOrbits:");

  type Orbit = FullThrow[];
  const allOrbits: Orbit[] = [];
  // Indexed by [juggler][time].
  const orbitsByBeat: Array<Orbit | undefined>[] = Array.from(
    { length: data.jugglers.length },
    () => Array(period),
  );
  let startJ = 0;
  let startT = 0;
  while (startJ < data.jugglers.length) {
    // Find first throw in table that is not part of an orbit yet.
    if (!throwsTable[startJ][startT] || orbitsByBeat[startJ][startT]) {
      startT++;
      if (startT >= period) {
        startT = 0;
        startJ++;
      }
      continue;
    }

    console.log(`(Starting an orbit at juggler ${startJ}, beat ${startT}.)`);
    completeOrbit(startJ, startT);
    allOrbits.push(orbitsByBeat[startJ][startT]!);
  }

  console.log();
  for (const orbit of allOrbits) {
    console.log(
      orbit
        .map(
          (thrw) =>
            `${data.jugglers[data.limbs[thrw.from].juggler].label}${thrw.time}(${thrw.duration.toString(36)}${thrw.isManipulated ? ",m" : ""})`,
        )
        .join(" --> "),
    );
  }
  // Alternative layout: A throws table with only this orbit filled in.
  console.log();
  for (const [i, orbit] of allOrbits.entries()) {
    console.log(`Orbit #${i}:`);
    const orbitOnlyTable = throwsTable.map((row) =>
      row.map((t) => (t && orbit.includes(t) ? t : null)),
    );
    printThrowsTable(data, orbitOnlyTable);
    console.log();
  }

  return allOrbits;

  function completeOrbit(j: number, t: number, orbit: Orbit = []) {
    const existingOrbit = orbitsByBeat[j][t];
    if (existingOrbit) {
      if (existingOrbit !== orbit) {
        console.error(
          "debug error info:\ncurrent",
          orbit,
          "\nexisting:",
          existingOrbit,
        );
        throw new Error(
          "Assertion violated: arrived at an orbit that is not the current one.",
        );
      }
      console.log(`(Found orbit with length ${orbit.length}.)`);

      // Found a cycle, shift it so it starts at the minimum time.
      const firstThrow = _.minBy(
        orbit,
        (t) => t.time * data.jugglers.length + data.limbs[t.from].juggler,
      )!;
      const startIndex = orbit.indexOf(firstThrow);
      const deleted = orbit.splice(0, startIndex);
      orbit.push(...deleted);
      return;
    }

    const thrw = throwsTable[j][t];
    if (!thrw) {
      throw new Error(
        `Assertion violated: arrived at juggler ${t} at beat ${t} that has no outgoing throw!`,
      );
    }
    // Note down throw in orbit.
    orbit.push(thrw);
    orbitsByBeat[j][t] = orbit;

    // Find out where to continue orbit.
    let nextT = t + thrw.duration;
    let nextJ = data.limbs[thrw.to].juggler;
    [nextT, nextJ] = wrapAround(nextT, nextJ, data, period);
    completeOrbit(nextJ, nextT, orbit);
  }
}

/** Wraps around period limits: [t, j] --> [t', j'] */
export function wrapAround(
  time: number,
  jugglerIndex: number,
  jif: FullJIF,
  period?: number,
): [number, number] {
  if (typeof period === "undefined") {
    period = inferPeriod(jif);
  }
  let nextT = time;
  let nextJ = jugglerIndex;
  while (nextT >= period) {
    nextT -= period;
    // Follow relabeling.
    nextJ = jif.jugglers[nextJ].becomes;
  }
  while (nextT < 0) {
    nextT += period;
    // Reverse relabeling.
    nextJ = jif.jugglers.findIndex((j) => j.becomes === nextJ);
  }
  return [nextT, nextJ];
}

function printThrowsTable(
  data: FullJIF,
  throwsTable: Array<FullThrow | null>[],
  limbsOnly = false,
) {
  const period = inferPeriod(data);
  console.log(
    "t",
    "|",
    Array.from({ length: period }, (_, i) => i).join("   "),
  );
  console.log("-".repeat(3 + 4 * period));
  for (let j = 0; j < data.jugglers.length; j++) {
    console.log(
      data.jugglers[j].label,
      "|",
      throwsTable[j]
        .map((t) => {
          if (!t) {
            return "_  ";
          }
          if (limbsOnly) {
            return data.limbs[t.from].label + "  ";
          }
          const fromJuggler = data.limbs[t.from].juggler;
          const toJuggler = data.limbs[t.to].juggler;
          const targetStr =
            fromJuggler === toJuggler ? " " : data.jugglers[toJuggler].label;
          const manipStr = t.isManipulated ? "m" : " ";
          return t.duration.toString(36) + targetStr + manipStr;
        })
        .join(" "),
      "->",
      data.jugglers[data.jugglers[j].becomes].label,
    );
  }
}
