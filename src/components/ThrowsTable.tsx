import arrowLine, { ArrowPosition } from "arrow-line";
import { MathJax as UncachedMathJax } from "better-react-mathjax";
import _ from "lodash";
import { memo, useEffect, useId, useMemo, useState } from "react";
import { FullJIF, FullThrow } from "../jif/jif_loader";
import { orbits, ThrowsTableData, wrapAround } from "../jif/orbits";
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
  /** Index in the initial instructions array. */
  originalIndex?: number;
  disabled?: boolean;
}

export function ThrowsTable({
  jif,
  throws,
  manipulationOptions,
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
}) {
  const containerId = useId();
  const throwOrbits = useMemo(() => tryOrbits(jif), [jif]);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const { viewSettings } = useViewSettings();

  function hoverKeyFn(j: number, t: number): string {
    if (viewSettings.arrowMode === "orbits") {
      const orbitIndex = throwOrbits.findIndex((orbit) =>
        orbit.find(
          (thrw) => thrw.time === t && jif.limbs[thrw.from]?.juggler === j,
        ),
      );
      return `orbit-${orbitIndex}`;
    }

    return `${j}-${t}`;
  }

  const isSynchronous =
    jif.jugglers.length < 2 ||
    _.some(
      _.countBy(
        throws.flat().filter((thrw) => !!thrw),
        (thrw) => thrw.time,
      ),
      (count) => count > 1,
    );
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

  return (
    <div
      id={containerId}
      className={`throws-container ${hoveredKey !== null ? "hovered" : ""}`}
    >
      {/* The Holy SVG Arrow Marker */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <marker
            id="__the-holy-marker"
            markerUnits="strokeWidth"
            viewBox="-1 -1 12 12"
            stroke="gray"
            fill="gray"
            orient="auto"
            markerWidth="10"
            markerHeight="10"
            refX="10"
            refY="5"
          >
            <polygon points="0,0 10,5 0,10"></polygon>
          </marker>
        </defs>
      </svg>
      <table>
        <thead>
          <tr className="line__underline">
            <th>Beat</th>
            {throws[0]?.map((_, i) => <th key={i}>{i + 1}</th>)}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {throws.map((row, j) => (
            <tr key={j} data-juggler={j}>
              <td>{jif.jugglers[j].label}</td>
              {row.map((thrw, t) => (
                <td
                  key={t}
                  data-time={t}
                  className={`throw-cell ${hoveredKey === hoverKeyFn(j, t) ? "hovered" : ""}`}
                  onMouseEnter={() => onThrowMouseEnter(hoverKeyFn(j, t))}
                  onMouseLeave={() => onThrowMouseOut(hoverKeyFn(j, t))}
                  onTouchStart={() => onThrowTouch(hoverKeyFn(j, t))}
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
              <td>&rarr; {jif.jugglers[jif.jugglers[j].becomes].label}</td>
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
      <ThrowsArrows
        jif={jif}
        throws={throws}
        throwOrbits={throwOrbits}
        containerSelector={`#${CSS.escape(containerId)}`}
        isSynchronous={isSynchronous}
        hoveredKey={hoveredKey}
        hoverKeyFn={hoverKeyFn}
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

function ThrowsArrows({
  jif,
  throws,
  throwOrbits,
  containerSelector,
  isSynchronous,
  hoveredKey,
  hoverKeyFn,
}: {
  jif: FullJIF;
  throws: ThrowsTableData;
  throwOrbits: FullThrow[][];
  containerSelector: string;
  isSynchronous: boolean;
  hoveredKey: string | null;
  hoverKeyFn: (j: number, t: number) => string;
}) {
  const {
    viewSettings: { arrowMode, wrapArrows },
  } = useViewSettings();

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
      return null;
  }

  return throwsWithArrows.flatMap((row, i) =>
    row.map((thrw) => {
      if (!thrw) return null;

      const t1 = thrw.time;
      const j1 = jif.limbs[thrw.from]?.juggler;
      let t2 = t1 + thrw.duration - arrowTimeDelta;
      let j2 = jif.limbs[thrw.to]?.juggler;
      if (!wrapArrows && (t2 < 0 || t2 >= row.length)) {
        return null;
      }
      [t2, j2] = wrapAround(t2, j2, jif);

      const color = colors[i % colors.length];
      return (
        <ArrowOverlay
          key={`${j1}-${t1}`}
          containerSelector={containerSelector}
          j1={j1}
          t1={t1}
          j2={j2}
          t2={t2}
          color={color}
          hovered={hoveredKey === hoverKeyFn(j1, t1)}
        />
      );
    }),
  );
}

function ArrowOverlay({
  containerSelector,
  j1,
  t1,
  j2,
  t2,
  color = "orange",
  hovered,
}: {
  containerSelector: string;
  j1: number;
  t1: number;
  j2: number;
  t2: number;
  color?: string;
  hovered?: boolean;
}) {
  const svgId = useId().replace(/:/g, "x");

  useEffect(() => {
    const throwsContainer = document.querySelector(containerSelector);
    if (!throwsContainer) {
      console.warn("Failed to render arrow: container not found!");
      return;
    }
    const fromSelector = `tr[data-juggler="${j1}"] td[data-time="${t1}"] .throw`;
    const toSelector = `tr[data-juggler="${j2}"] td[data-time="${t2}"] .throw`;
    if (!throwsContainer.querySelector(fromSelector)) {
      console.warn("Failed to render arrow: selector not found:", fromSelector);
      return;
    }
    if (!throwsContainer.querySelector(toSelector)) {
      console.warn("Failed to render arrow: selector not found:", toSelector);
      return;
    }

    const [sourcePosition, destinationPosition] = getArrowPositions(t1, t2);
    const arrow = arrowLine({
      svgParentSelector: `#${CSS.escape(svgId)}`,
      source: `${containerSelector} ${fromSelector}`,
      destination: `${containerSelector} ${toSelector}`,
      sourcePosition,
      destinationPosition,
      thickness: 1.2,
      curvature: 0,
      color,
      endpoint: {
        // Ugly hack: arrow-line uses a marker cache that is non-local
        // to the SVG container and gets sometimes deleted.
        // Giving them different sizes bypasses the cache.
        //size: 2 + 0.1 * Math.random(),
        type: "custom",
        markerIdentifier: "#__the-holy-marker",
      },
    });

    // Respond to layout changes of the container.
    const resizeObserver = new ResizeObserver(() => {
      // lol arrow-line
      arrow.update({
        endpoint: {
          type: "custom",
          markerIdentifier: "#__the-holy-marker",
          fillColor: undefined,
        },
      });
    });
    resizeObserver.observe(throwsContainer);

    return () => {
      resizeObserver.disconnect();
      arrow.remove();
    };
  }, [svgId, containerSelector, j1, t1, j2, t2, color]);

  return (
    <div className={`svg-container ${hovered ? "hovered" : ""}`}>
      <svg id={svgId} className="svg-arrows"></svg>
    </div>
  );
}

function getArrowPositions(
  t1: number,
  t2: number,
): [ArrowPosition, ArrowPosition] {
  if (t2 > t1) {
    return ["middleRight", "middleLeft"];
  }
  if (t2 < t1) {
    return ["bottomLeft", "bottomRight"];
  }
  return ["middleRight", "middleRight"]; // TODO: improve
}

function tryOrbits(jif: FullJIF): FullThrow[][] {
  try {
    return orbits(jif);
  } catch (e) {
    console.warn("Failed to calculate orbits:", e);
    return [];
  }
}
