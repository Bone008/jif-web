/**
 * Alternative implementation of the orbits algorithm, based on limbs instead of
 * jugglers.
 */
import _ from "lodash";
import { FullJIF, FullThrow } from "./jif_loader";
import { wrapLimb } from "./util";

export type ThrowsTableData = Array<FullThrow | null>[];

/**
 * Returns a table of throws, first indexed by juggler, then by the beat/time.
 *
 * Assumptions: integer throws, only 1 throw per limb per beat
 */
export function getThrowsTableByJuggler(data: FullJIF): ThrowsTableData {
  const period = data.repetition.period;
  // Assumptions: integer throws, only 1 throw per juggler per beat
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

/**
 * Returns a table of throws, first indexed by limb, then by the beat/time.
 *
 * Assumptions: integer throws, only 1 throw per limb per beat
 */
export function getThrowsTableByLimb(data: FullJIF): ThrowsTableData {
  const period = data.repetition.period;
  //
  // Indexed by [limb][time].
  const throwsTable: Array<FullThrow | null>[] = Array.from(
    { length: data.limbs.length },
    () => Array(period).fill(null),
  );
  for (const thrw of data.throws) {
    const limbIndex = thrw.from;
    if (throwsTable[limbIndex][thrw.time]) {
      console.warn(
        `\nWARNING: More than 1 throw detected by limb ${
          data.limbs[limbIndex].label
        } at time ${thrw.time}!\n`,
      );
    }
    throwsTable[limbIndex][thrw.time] = thrw;
  }
  return throwsTable;
}

/**
 * Calculates all object orbits in a pattern based on tracking limb throws.
 *
 * @returns a list of orbits, each orbit being a list of throws.
 */
export function calculateOrbits(data: FullJIF): FullThrow[][] {
  const throwsTable = getThrowsTableByLimb(data);
  const period = data.repetition.period;

  type Orbit = FullThrow[];
  const allOrbits: Orbit[] = [];
  // Indexed by [limb][time].
  const orbitsByBeat: Array<Orbit | undefined>[] = Array.from(
    { length: data.limbs.length },
    () => Array(period),
  );
  let startL = 0;
  let startT = 0;
  while (startL < data.limbs.length) {
    // Find first throw in table that is not part of an orbit yet.
    if (!throwsTable[startL][startT] || orbitsByBeat[startL][startT]) {
      startT++;
      if (startT >= period) {
        startT = 0;
        startL++;
      }
      continue;
    }

    console.log(`(Starting an orbit at limb ${startL}, beat ${startT}.)`);
    completeOrbit(startL, startT);
    allOrbits.push(orbitsByBeat[startL][startT]!);
  }
  return allOrbits;

  function completeOrbit(limbIndex: number, t: number, orbit: Orbit = []) {
    const existingOrbit = orbitsByBeat[limbIndex][t];
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
        (t) => t.time * data.limbs.length + t.from,
      )!;
      const startIndex = orbit.indexOf(firstThrow);
      const deleted = orbit.splice(0, startIndex);
      orbit.push(...deleted);
      return;
    }

    const thrw = throwsTable[limbIndex][t];
    if (!thrw) {
      throw new Error(
        `Assertion violated: arrived at limb ${limbIndex} at beat ${t} that has no outgoing throw!`,
      );
    }
    // Note down throw in orbit.
    orbit.push(thrw);
    orbitsByBeat[limbIndex][t] = orbit;

    // Find out where to continue orbit.
    let nextT = t + thrw.duration;
    let nextL = thrw.to;
    [nextT, nextL] = wrapLimb(nextT, nextL, data);
    completeOrbit(nextL, nextT, orbit);
  }
}
