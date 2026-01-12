import _ from "lodash";
import { JIF, Limb, LimbKind, Throw } from "./jif";
import { FullJIF, loadWithDefaults } from "./jif_loader";
import { wrapLimb } from "./util";

export interface ManipulatorInstruction {
  type: "substitute" | "intercept1b" | "intercept2b";
  throwTime: number;
  throwFromJuggler: number;
}

type AlmostFullJIF = FullJIF & {
  limbs: Limb[];
  throws: Throw[];
};

/** Returns a copy of the input JIF with the given manipulator added. */
export function addManipulator(
  inputJif: FullJIF,
  spec: ManipulatorInstruction[],
): FullJIF {
  // Drop some of the recursive completeness constraints.
  const jif: AlmostFullJIF = _.cloneDeep(inputJif);
  const period = jif.repetition.period;
  const limbsSwitchHandedness = period % 2 === 1;

  // Add the manipulator.
  let manipIndex = jif.jugglers.length;
  let manipLimb = jif.limbs.length;
  let manipAltLimb = manipLimb + 1;
  jif.jugglers.push({
    label: getNextManipulatorLabel(jif),
    becomes: manipIndex,
  });
  jif.limbs.push({ kind: "right_hand", juggler: manipIndex });
  jif.repetition.limbPermutation.push(
    limbsSwitchHandedness ? manipAltLimb : manipLimb,
  );
  jif.limbs.push({ kind: "left_hand", juggler: manipIndex });
  jif.repetition.limbPermutation.push(
    limbsSwitchHandedness ? manipLimb : manipAltLimb,
  );

  // Temporarily shift the entire pattern in time to make sure the intercept/carry does not cross
  // the relabeling boundary. Demons lie in that edge case.
  // I tried shifting only during processing of the intercept, but the idle manipulator throws kinda
  // get screwed up after the relabeling is changed. This works better.
  const firstInterceptTime = Math.min(
    ...spec
      .filter((instruction) => instruction.type.startsWith("intercept"))
      .map((instruction) => instruction.throwTime),
  );

  let nShiftedBeats = 0;
  if (isFinite(firstInterceptTime)) {
    nShiftedBeats = firstInterceptTime;
    shiftPatternBy(jif, -nShiftedBeats);

    spec = spec.map((instruction) => ({
      ...instruction,
      throwTime: (instruction.throwTime - firstInterceptTime + period) % period,
      throwFromJuggler:
        instruction.throwTime < firstInterceptTime
          ? // Follow backwards relabeling.
            jif.jugglers.findIndex(
              (juggler) => juggler.becomes === instruction.throwFromJuggler,
            )
          : instruction.throwFromJuggler,
    }));
  }
  const sortedSpec = _.sortBy(spec, (instruction) => instruction.throwTime);

  let lastManipTime = -1;
  for (const [
    specIndex,
    { type, throwTime, throwFromJuggler },
  ] of sortedSpec.entries()) {
    // TODO error handling: validate that throwTime does not overlap with previous manipulation
    fillManipulatorThrows(
      jif,
      [lastManipTime + 1, throwTime],
      manipIndex,
      nShiftedBeats,
    );

    const thrw = getThrowFromJuggler(jif, throwFromJuggler, throwTime);
    if (!thrw) {
      throw new Error(
        `Could not find throw for manipulation at time ${throwTime} from juggler ${throwFromJuggler}!`,
      );
    }

    // Mark all types of manipulations as manipulated.
    thrw.isManipulated = true;

    if (type === "substitute") {
      const fromLimbKind = jif.limbs[thrw.from!].kind!;
      // Insert a new throw from M to the original destination.
      const manipThrow: Throw = {
        time: throwTime,
        duration: thrw.duration,
        from: fromLimbKind === "right_hand" ? manipLimb : manipAltLimb,
        to: thrw.to,
        isManipulated: true,
      };
      jif.throws.push(manipThrow);

      // Change destination of original throw to M.
      // The target hand is the *opposite* one than `manipThrow.from` since it
      // throws 1 beat later. It is NOT related to `thrw.to`, which can be even
      // or odd.
      thrw.to = fromLimbKind === "right_hand" ? manipAltLimb : manipLimb;
      thrw.duration = 1;

      lastManipTime = throwTime;
    } else {
      const isLateCarry = type === "intercept2b";
      const interceptedJuggler = jif.limbs[thrw.to!].juggler!;
      // The first beat when interceptedJuggler no longer makes their normal throw because the
      // causal line is missing. The throw at this beat is the "pause" (2-beat) or "carry" (1-beat).
      const causalThreshold = throwTime + thrw.duration! - 2;

      // Adjust all future throws. Iterate over copy to ignore in-loop modifications.
      for (const nextThrow of jif.throws.slice()) {
        const fromJuggler = jif.limbs[nextThrow.from!].juggler;
        const toJuggler = jif.limbs[nextThrow.to!].juggler;
        const causalTime = nextThrow.time! + nextThrow.duration! - 2;

        // All throws landing at or after the causal cutoff are thrown TO the old manipulator.
        if (toJuggler === interceptedJuggler && causalTime >= causalThreshold) {
          // Sanity check.
          if (causalTime === causalThreshold && nextThrow !== thrw) {
            throw new Error(
              "Assertion violated: different throw landing at the same time as intercepted throw!",
            );
          }
          const limbKind = jif.limbs[nextThrow.to!].kind!;
          nextThrow.to = limbKind === "right_hand" ? manipLimb : manipAltLimb;
        }

        if (fromJuggler === interceptedJuggler) {
          const deltaToThreshold = nextThrow.time! - causalThreshold;
          const limbKind = jif.limbs[nextThrow.from!].kind!;

          if (isLateCarry && deltaToThreshold === 1) {
            // Late carry: This is the carry, mark it as such!
            nextThrow.isManipulated = true;
          }

          // Early carry: All throws starting after the threshold are thrown BY the old manipulator.
          // Late carry: The first throw after the threshold is still thrown (carried) BY juggler.
          if (
            deltaToThreshold > 1 ||
            (!isLateCarry && deltaToThreshold === 1)
          ) {
            nextThrow.from =
              limbKind === "right_hand" ? manipLimb : manipAltLimb;
          }
          // This is the crucial throw! Early carry: This is the carry and can stay as-is.
          // Late carry: This throw is delayed a beat and thrown by the old manipulator instead.
          else if (deltaToThreshold === 0) {
            if (isLateCarry) {
              //console.log(`DEBUG: found throw to delay:`, nextThrow);
              // Insert a 2 here instead, which is the 1 from new manipulator's (t+1) thrown earlier.
              jif.throws.push({
                time: nextThrow.time,
                duration: 2,
                from: nextThrow.from,
                to: nextThrow.from,
              });
              nextThrow.time!++;
              nextThrow.duration!--;
              nextThrow.from =
                limbKind === "right_hand" ? manipAltLimb : manipLimb;
              // TODO Check if limb handedness is correct.
            } else {
              // Early carry: This is the carry!
              nextThrow.isManipulated = true;
            }
          }
        }
      }

      // Fill in time where M still waits for their intercept to arrive.
      fillManipulatorThrows(
        jif,
        [throwTime, causalThreshold + 1],
        manipIndex,
        nShiftedBeats,
      );

      // Swap relabeling.
      const manipBecomes = jif.jugglers[manipIndex].becomes;
      jif.jugglers[manipIndex].becomes =
        jif.jugglers[interceptedJuggler].becomes;
      jif.jugglers[interceptedJuggler].becomes = manipBecomes;
      // Swap limbPermutation entries.
      const rep = jif.repetition.limbPermutation!;
      const manipLimbPerm = rep[manipLimb];
      const manipAltLimbPerm = rep[manipAltLimb];
      const interceptedLimb = getLimbOfJuggler(
        jif,
        interceptedJuggler,
        "right_hand",
      );
      const interceptedAltLimb = getLimbOfJuggler(
        jif,
        interceptedJuggler,
        "left_hand",
      );
      rep[manipLimb] = rep[interceptedLimb];
      rep[manipAltLimb] = rep[interceptedAltLimb];
      rep[interceptedLimb] = manipLimbPerm;
      rep[interceptedAltLimb] = manipAltLimbPerm;
      // Swap who we think about as M in future manipulator instructions.
      for (const nextInstruction of sortedSpec.slice(specIndex + 1)) {
        if (nextInstruction.throwFromJuggler === interceptedJuggler) {
          nextInstruction.throwFromJuggler = manipIndex;
        }
      }
      manipLimb = getLimbOfJuggler(jif, interceptedJuggler, "right_hand");
      manipAltLimb = getLimbOfJuggler(jif, interceptedJuggler, "left_hand");
      manipIndex = interceptedJuggler;

      if (isLateCarry) {
        // Carry happened 1 beat after the threshold.
        lastManipTime = causalThreshold + 1;
      } else {
        // Carry happened on the same beat as the threshold.
        lastManipTime = causalThreshold;
      }
    }
  }

  fillManipulatorThrows(
    jif,
    [lastManipTime + 1, period],
    manipIndex,
    nShiftedBeats,
  );

  if (nShiftedBeats > 0) {
    // Undo shift.
    shiftPatternBy(jif, nShiftedBeats);
  }

  return loadWithDefaults(jif);
}

/** Generates manipulator throws (1s) in the given half-open time interval [from, to). */
function fillManipulatorThrows(
  jif: Required<JIF>,
  timeInterval: [number, number],
  manipIndex: number,
  nShiftedBeats: number,
) {
  for (let time = timeInterval[0]; time < timeInterval[1]; time++) {
    // Validation: Does a throw already exist?
    if (getThrowFromJuggler(jif, manipIndex, time)) {
      throw new Error(
        `trying to fill manipulator throw, but one already exists! by ${
          manipIndex
        } at t=${time}`,
      );
    }
    jif.throws.push({
      time,
      duration: 1,
      from: getLimbOfJuggler(
        jif,
        manipIndex,
        // Have to offset by shifted beats here to account for patterns where
        // everyone starts with the left hand.
        // TODO: this still makes a lot of assumptions about handedness ...
        (time + nShiftedBeats) % 2 === 0 ? "right_hand" : "left_hand",
      ),
      to: getLimbOfJuggler(
        jif,
        manipIndex,
        (time + nShiftedBeats) % 2 === 0 ? "left_hand" : "right_hand",
      ),
    });
  }
}

/**
 * Shifts a pattern in time, respecting relabelings. Operates in-place.
 * @param jif Mostly complete JIF of the pattern to change.
 * @param delta Time shift, may be negative.
 */
export function shiftPatternBy(jif: AlmostFullJIF, delta: number) {
  for (const thrw of jif.throws) {
    const newTime = thrw.time + delta;
    [thrw.time, thrw.from] = wrapLimb(newTime, thrw.from, jif);
    [, thrw.to] = wrapLimb(newTime, thrw.to, jif);
  }
}

function getLimbOfJuggler(
  jif: Required<JIF>,
  j: number,
  limbKind: LimbKind,
): number {
  return jif.limbs.findIndex(
    (limb) => limb.juggler === j && limb.kind === limbKind,
  );
}

export function getThrowFromJuggler(
  jif: Required<JIF>,
  j: number,
  time: number,
): Throw | null {
  return (
    jif.throws.find(
      (thrw) => thrw.time === time && jif.limbs[thrw.from!].juggler === j,
    ) || null
  );
}

/**
 * Returns the label for the next manipulator to be added.
 * - First manipulator: "M"
 * - Second manipulator: renames existing "M" to "M1", returns "M2"
 * - Subsequent manipulators: "M3", "M4", etc.
 */
function getNextManipulatorLabel(jif: AlmostFullJIF): string {
  const manipulatorLabels = jif.jugglers
    .map((j) => j.label)
    .filter((label): label is string => label?.startsWith("M") ?? false);

  if (manipulatorLabels.length === 0) {
    return "M";
  }

  // If there's exactly one manipulator labeled "M" (not numbered), rename it to "M1"
  const plainM = jif.jugglers.find((j) => j.label === "M");
  if (plainM) {
    plainM.label = "M1";
  }

  // Find highest existing number
  let maxNumber = 1;
  for (const label of manipulatorLabels) {
    const match = label.match(/^M(\d+)$/);
    if (match) {
      maxNumber = Math.max(maxNumber, parseInt(match[1], 10));
    }
  }

  return `M${maxNumber + 1}`;
}
