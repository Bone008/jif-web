import _ from "lodash";
import { FullJIF } from "./jif_loader";

/** Heuristic that infers whether this is a (semi-)synchronous pattern. */
export function inferIsSynchronousPattern(
  jif: Pick<FullJIF, "jugglers" | "throws">,
): boolean {
  return (
    jif.jugglers.length < 2 ||
    _.some(
      _.countBy(
        jif.throws.filter((thrw) => !!thrw),
        (thrw) => thrw.time,
      ),
      (count) => count > 1,
    )
  );
}

/** Wraps around period limits: [t, limbIndex] --> [t', limbIndex'] */
export function wrapLimb(
  time: number,
  limbIndex: number,
  jif: Pick<FullJIF, "repetition">,
): [number, number] {
  const period = jif.repetition.period;
  let nextT = time;
  let nextL = limbIndex;
  while (nextT >= period) {
    nextT -= period;
    // Follow limb relabeling.
    nextL = jif.repetition.limbPermutation[nextL];
  }
  while (nextT < 0) {
    nextT += period;
    // Reverse limb relabeling.
    nextL = jif.repetition.limbPermutation.findIndex((l) => l === nextL);
  }
  return [nextT, nextL];
}

/** Wraps around period limits: [t, jugglerIndex] --> [t', jugglerIndex'] */
export function wrapJuggler(
  time: number,
  jugglerIndex: number,
  jif: FullJIF,
): [number, number] {
  const period = jif.repetition.period;
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
