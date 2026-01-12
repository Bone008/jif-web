import { MathJax as UncachedMathJax } from "better-react-mathjax";
import _ from "lodash";
import { memo, useId, useMemo, useState } from "react";
import { FullJIF, FullThrow } from "../jif/jif_loader";
import { ThrowsTableData, calculateOrbits } from "../jif/orbits";
import { inferIsSynchronousPattern, wrapJuggler, wrapLimb } from "../jif/util";
import { ArrowData, ArrowOverlay } from "./ArrowOverlay";
import "./ThrowsTable.scss";
import { useViewSettings } from "./ViewSettings";

// Avoid rexpensive re-typesetting of MathJax components when
// their contents do not change.
const MathJax = memo(UncachedMathJax);

const ORBIT_COLORS = [
  "orange",
  "aqua",
  "fuchsia",
  "lime",
  "white",
  "red",
  "blue",
];

export interface FormattedManipulatorInstruction {
  label: string;
  /** Reference to the original throw that is manipulated. */
  originalThrow?: FullThrow;
  /** Index in the initial instructions array. */
  originalIndex?: number;
  disabled?: boolean;
}

export function ThrowsTable({
  jif,
  throws,
  manipulationOptions,
  isLimbsTable = false,
}: {
  jif: FullJIF;
  throws: ThrowsTableData;
  manipulationOptions?: {
    formattedManipulators: FormattedManipulatorInstruction[][];
    onSetInstructionDisabled: (
      manipulatorIndex: number,
      instructionIndex: number,
      enabled: boolean,
    ) => void;
  };
  isLimbsTable?: boolean;
}) {
  const containerId = useId();
  const throwOrbits = useMemo(() => tryOrbits(jif), [jif]);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const { viewSettings } = useViewSettings();

  function hoverKeyFn(index: number, t: number): string {
    if (viewSettings.arrowMode === "orbits") {
      const orbitIndex = throwOrbits.findIndex((orbit) =>
        orbit.find(
          (thrw) =>
            thrw.time === t &&
            (isLimbsTable
              ? thrw.from === index
              : jif.limbs[thrw.from]?.juggler === index),
        ),
      );
      return `orbit-${orbitIndex}`;
    }

    return `${index}-${t}`;
  }

  const isSynchronous = inferIsSynchronousPattern(jif);
  const hasOnly3Throws = _.every(
    throws.flat().map((thrw) => thrw?.duration === 3),
  );
  const useLetters = isSynchronous && hasOnly3Throws;

  const manipulatorNameSuffixes =
    manipulationOptions?.formattedManipulators.length === 1
      ? [null]
      : (manipulationOptions?.formattedManipulators.map((_, i) => (
          <sub key={i}>{i + 1}</sub>
        )) ?? []);

  function onThrowMouseEnter(hoverKey: string) {
    setHoveredKey(hoverKey);
  }
  function onThrowMouseOut(hoverKey: string) {
    if (hoveredKey === hoverKey) {
      setHoveredKey(null);
    }
  }
  function onThrowTouch(hoverKey: string) {
    if (hoveredKey === hoverKey) {
      setHoveredKey(null);
    } else {
      setHoveredKey(hoverKey);
    }
  }

  const labelFn = isLimbsTable
    ? (limbIndex: number) => limbIndex
    : (jugglerIndex: number) => jif.jugglers[jugglerIndex]?.label ?? "?";
  const becomesFn = isLimbsTable
    ? (limbIndex: number) => jif.repetition.limbPermutation[limbIndex]
    : (jugglerIndex: number) => jif.jugglers[jugglerIndex].becomes;

  // Compute the set of throws that have manipulator instructions (for filtering).
  // A value of null means show all throws.
  const manipulatedThrows = useMemo(() => {
    if (
      viewSettings.onlyManipulatedArrows &&
      viewSettings.arrowMode !== "orbits"
    ) {
      if (manipulationOptions?.formattedManipulators.length) {
        return manipulationOptions.formattedManipulators
          .flat()
          .filter((instruction) => !instruction.disabled)
          .map((instruction) => instruction.originalThrow!)
          .filter(Boolean);
      }
      if (jif.throws.some((thrw) => thrw.isManipulated)) {
        return jif.throws.filter((thrw) => thrw.isManipulated);
      }
    }
    return null;
  }, [
    jif.throws,
    viewSettings.onlyManipulatedArrows,
    viewSettings.arrowMode,
    manipulationOptions?.formattedManipulators,
  ]);

  let arrows: ArrowData[] = [];
  try {
    arrows = getArrows(
      jif,
      throws,
      throwOrbits,
      viewSettings.arrowMode,
      viewSettings.wrapArrows,
      manipulatedThrows,
      isSynchronous,
      hoveredKey,
      hoverKeyFn,
    );
  } catch (e) {
    console.warn("Failed to calculate arrows:", e);
  }

  return (
    <div
      id={containerId}
      className={`throws-container ${hoveredKey !== null ? "hovered" : ""}`}
    >
      <table>
        <thead>
          <tr className="line__underline">
            <th>Beat</th>
            {throws[0]?.map((_, i) => (
              <th key={i}>{isLimbsTable ? i : i + 1}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {throws.map((row, index) => (
            <tr key={index} data-juggler={index}>
              <td>{labelFn(index)}</td>
              {row.map((thrw, t) => (
                <td
                  key={t}
                  data-time={t}
                  className={`throw-cell ${hoveredKey === hoverKeyFn(index, t) ? "hovered" : ""}`}
                  onMouseEnter={() => onThrowMouseEnter(hoverKeyFn(index, t))}
                  onMouseLeave={() => onThrowMouseOut(hoverKeyFn(index, t))}
                  onTouchStart={() => onThrowTouch(hoverKeyFn(index, t))}
                >
                  {thrw ? (
                    <ThrowCell
                      jif={jif}
                      thrw={thrw}
                      isSynchronous={isSynchronous}
                      useLetters={useLetters}
                    />
                  ) : (
                    // Placeholder for arrow selector safety.
                    <div className="throw" />
                  )}
                </td>
              ))}
              <td>&rarr; {labelFn(becomesFn(index))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {manipulationOptions?.formattedManipulators.map((manipulator, m) => (
            <tr key={m} className="line__m">
              <td>M{manipulatorNameSuffixes[m]}</td>
              {manipulator.map((instruction, t) => (
                <td
                  key={t}
                  className={instruction.disabled ? "disabled" : ""}
                  onClick={
                    instruction.originalIndex !== undefined
                      ? () =>
                          manipulationOptions.onSetInstructionDisabled(
                            m,
                            instruction.originalIndex!,
                            !instruction.disabled,
                          )
                      : undefined
                  }
                >
                  <MathJax key={instruction.label}>
                    $${instruction.label}$$
                  </MathJax>
                </td>
              ))}
              <td>&rarr; M{manipulatorNameSuffixes[m]}</td>
            </tr>
          ))}
        </tfoot>
      </table>
      <ArrowOverlay
        containerSelector={`#${CSS.escape(containerId)}`}
        arrows={arrows}
      />
      {viewSettings.arrowMode === "orbits" && (
        <p>
          Orbits:{" "}
          {throwOrbits.map((orbit, i) => {
            const isBeerable = orbit.every(
              (thrw) => thrw.duration < 3 || thrw.isManipulated,
            );
            return (
              <button
                key={i}
                className={`orbit-button ${hoveredKey === `orbit-${i}` ? "hovered" : ""} ${isBeerable ? "beerable" : ""}`}
                onMouseEnter={() => onThrowMouseEnter(`orbit-${i}`)}
                onMouseLeave={() => onThrowMouseOut(`orbit-${i}`)}
                style={{
                  backgroundColor: ORBIT_COLORS[i % ORBIT_COLORS.length],
                }}
              >
                {i}
              </button>
            );
          })}
        </p>
      )}
    </div>
  );
}

function ThrowCell({
  jif,
  thrw,
  isSynchronous,
  useLetters,
}: {
  jif: FullJIF;
  thrw: FullThrow;
  isSynchronous: boolean;
  useLetters: boolean;
}) {
  const { viewSettings } = useViewSettings();
  const fromJuggler = jif.limbs[thrw.from]?.juggler;
  const toJuggler = jif.limbs[thrw.to]?.juggler;
  const isPass = fromJuggler !== toJuggler;
  let label: string;
  if (useLetters && thrw.duration === 3) {
    label = isPass ? "P" : "S";
  } else {
    label = thrw.duration.toString(36);
    if (isPass && isSynchronous) {
      label += "p";
    }
  }
  if (isPass) {
    label += `_{${jif.jugglers[toJuggler]?.label ?? "?"}}`;
  }
  if (viewSettings.showHands) {
    // TODO: colorize, for some reason \textcolor does not work
    label += `^{${jif.limbs[thrw.from].label}}`;
  }
  if (thrw.isManipulated) {
    label += "*";
  }

  return (
    <div className="throw">
      <MathJax inline dynamic>
        {"$$" + label + "$$"}
      </MathJax>
    </div>
  );
}

function getArrows(
  jif: FullJIF,
  throws: ThrowsTableData,
  throwOrbits: FullThrow[][],
  arrowMode: string,
  wrapArrows: boolean,
  onlyForTheseThrows: FullThrow[] | null,
  isSynchronous: boolean,
  hoveredKey: string | null,
  hoverKeyFn: (j: number, t: number) => string,
): ArrowData[] {
  // TODO: remove length-based heuristic
  const isLimbsTable = jif.limbs.length === throws.length;

  let throwsWithArrows: ThrowsTableData;
  let arrowTimeDelta: number;
  let colors: string[] = ["orange"];

  switch (arrowMode) {
    case "ladder":
      throwsWithArrows = throws;
      arrowTimeDelta = 0;
      break;
    case "causal":
      throwsWithArrows = throws;
      // TODO: more reliable causal time heuristic
      arrowTimeDelta = isSynchronous ? 2 : 4;
      break;
    case "orbits":
      throwsWithArrows = throwOrbits;
      arrowTimeDelta = 0;
      colors = ORBIT_COLORS;
      break;
    default:
      return [];
  }

  const arrows: Array<{
    j1: number;
    t1: number;
    j2: number;
    t2: number;
    color: string;
    hovered: boolean;
  }> = [];

  throwsWithArrows.forEach((row, i) => {
    row.forEach((thrw) => {
      if (!thrw) return;

      // Filter down to only manipulated throws if requested.
      if (
        onlyForTheseThrows &&
        !_.some(onlyForTheseThrows, (other) => _.isEqual(other, thrw))
      ) {
        return;
      }

      let t1: number, j1: number, t2: number, j2: number;
      t1 = thrw.time;

      t2 = t1 + thrw.duration - arrowTimeDelta;
      if (!wrapArrows && (t2 < 0 || t2 >= row.length)) {
        return;
      }

      if (isLimbsTable) {
        j1 = thrw.from;
        j2 = thrw.to;
        [t2, j2] = wrapLimb(t2, j2, jif);
      } else {
        j1 = jif.limbs[thrw.from]?.juggler;
        j2 = jif.limbs[thrw.to]?.juggler;
        [t2, j2] = wrapJuggler(t2, j2, jif);
      }

      const color = colors[i % colors.length];
      arrows.push({
        j1,
        t1,
        j2,
        t2,
        color,
        hovered: hoveredKey === hoverKeyFn(j1, t1),
      });
    });
  });

  return arrows;
}

function tryOrbits(jif: FullJIF): FullThrow[][] {
  try {
    return calculateOrbits(jif);
  } catch (e) {
    console.warn("Failed to calculate orbits:", e);
    return [];
  }
}
