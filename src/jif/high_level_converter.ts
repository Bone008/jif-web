import { JIF, Juggler, Throw } from "./jif";
import { indexToJugglerName } from "./jif_loader";
import { ManipulatorInstruction } from "./manipulation";

export function siteswapToJIF(siteswap: string, numJugglers: number): JIF {
  const throwStrings = siteswap
    .toLowerCase()
    .replace(/[^0-9a-z]/g, "")
    .split("");
  const period = throwStrings.length;
  return {
    jugglers: Array.from({ length: numJugglers }, (_, j) => ({
      becomes: (j + period) % numJugglers,
    })),
    throws: throwStrings.map((str) => ({
      duration: parseInt(str, 36),
    })),
  };
}

export type PrechacNotation = string[];
/**
 * Converts prechac notation to JIF. The input should be given as 1 line per juggler, assuming
 * automatic relabeling at the end. Siteswaps >=10 must be written as letters.
 * Passes should be written as a suffix with the letter of the target juggler, e.g. "3B".
 */
export function prechacToJif(prechac: PrechacNotation): JIF {
  const jifThrows: Throw[] = [];

  const numJugglers = prechac.length;
  const jifJugglers: Juggler[] = Array.from(
    { length: prechac.length },
    (_, j) => ({
      label: indexToJugglerName(j),
      // Default relabeling: become next juggler in line.
      becomes: (j + 1) % prechac.length,
    }),
  );

  const relabelTargets: string[] = [];

  // let period: number | null = null;
  for (let [j, line] of prechac.entries()) {
    // Extract optional label.
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      jifJugglers[j].label = line.slice(0, colonIndex).trim();
      line = line.slice(colonIndex + 1);
    }

    // Extract optional relabeling target.
    const relabelingMatch = line.match(/(?:-|=)>\s*(\S+)$/);
    if (relabelingMatch) {
      relabelTargets[j] = relabelingMatch[1];
      line = line.slice(0, relabelingMatch.index);
    }

    const elements = line.trim().split(/\s+/);

    // Let's not be too strict on validation ...
    // if (period && elements.length !== period) {
    //   throw new Error("instructions must be the same length!");
    // }
    // period = elements.length;
    for (const [time, str] of elements.entries()) {
      const { duration, passTarget } = parseInstruction(str);
      const targetJuggler = passTarget === null ? j : passTarget;
      jifThrows.push({
        time,
        duration,
        // Even time: right hand; odd time: left hand.
        from: limbOfJuggler(j, time % 2, numJugglers),
        to: limbOfJuggler(targetJuggler, (time + duration) % 2, numJugglers),
      });
    }
  }

  // Apply relabeling. If any relabeling is applied, the default value of "becomes" is
  // changed to the identity function.
  if (relabelTargets.length > 0) {
    console.log("ra ra relabel", relabelTargets);
    for (let j = 0; j < numJugglers; j++) {
      const target = relabelTargets[j];
      if (target) {
        const targetIndex = jifJugglers.findIndex(
          (j) => j.label?.toLowerCase() === target.toLowerCase(),
        );
        if (targetIndex === -1) {
          throw new Error(
            `Could not find target juggler with label: ${target}`,
          );
        }
        jifJugglers[j].becomes = targetIndex;
      } else {
        jifJugglers[j].becomes = j;
      }
    }
  }

  return {
    jugglers: jifJugglers,
    limbs: Array.from({ length: prechac.length * 2 }, (_, l) => ({
      juggler: Math.floor(l / 2),
      kind: l % 2 === 0 ? "right_hand" : "left_hand",
    })),
    throws: jifThrows,
  };
}

interface PrechacInstruction {
  duration: number;
  passTarget: number | null;
}
// Example: 3B ^= single pass to B
const REGEX_INSTRUCTION = /^([0-9a-z])([a-z])?$/i;

function parseInstruction(str: string): PrechacInstruction {
  const match = REGEX_INSTRUCTION.exec(str);
  if (!match) {
    throw new Error("throw must match (single-letter throw)(pass target)?");
  }

  const duration = parseInt(match[1], 36);
  if (!isFinite(duration)) {
    throw new Error("invalid duration for throw: " + str);
  }
  const passTarget = match[2] ? jugglerIndexFromLetter(match[2]) : null;
  return { duration, passTarget };
}

// May need to change if default limb order changes.
function limbOfJuggler(
  jugglerIndex: number,
  limbIndex: number,
  _numJugglers: number,
): number {
  return 2 * jugglerIndex + limbIndex;
}

/** Parses text-based instructions for a single manipulator. */
export function parseManipulator(
  instructions: string,
): ManipulatorInstruction[] {
  const manipulator: ManipulatorInstruction[] = [];
  const parts = instructions.split(/\s+/);
  for (const [beat, part] of parts.entries()) {
    if (part.match(/^-+$/)) {
      continue;
    }
    const match = part.toLowerCase().match(/^(s|i|i1|i2)([a-z])$/);
    if (!match) {
      throw new Error(
        `Invalid manipulator instruction: ${part}\n` +
          `Expected something like "sA", "iA", or "i1A", with "-" as placeholder.`,
      );
    }
    let type: ManipulatorInstruction["type"];
    switch (match[1]) {
      case "s":
        type = "substitute";
        break;
      case "i1":
        type = "intercept1b";
        break;
      case "i":
      case "i2":
        type = "intercept2b";
        break;
      default:
        throw new Error();
    }
    manipulator.push({
      type,
      throwTime: beat,
      throwFromJuggler: jugglerIndexFromLetter(match[2]),
    });
  }
  return manipulator;
}

/** Returns 0-based index from a-based letter. */
function jugglerIndexFromLetter(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
}
