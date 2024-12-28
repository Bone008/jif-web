import arrowLine, { ArrowPosition } from "arrow-line";
import { MathJax } from "better-react-mathjax";
import _ from "lodash";
import { useEffect, useId, useState } from "react";
import { FullJIF, FullThrow } from "../jif/jif_loader";
import { orbits, ThrowsTableData, wrapAround } from "../jif/orbits";
import "./ThrowsTable.scss";
import { useViewSettings } from "./ViewSettings";

export function ThrowsTable({
  jif,
  throws,
  formattedManipulators,
}: {
  jif: FullJIF;
  throws: ThrowsTableData;
  formattedManipulators?: string[][];
}) {
  const containerId = useId();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const isSynchronous = _.some(
    _.countBy(
      throws.flat().filter((thrw) => !!thrw),
      (thrw) => thrw.time,
    ),
    (count) => count > 1,
  );
  const maxThrowHeight = _.max(
    throws.flat().map((thrw) => thrw?.duration ?? 0),
  );
  const useLetters = isSynchronous && maxThrowHeight == 3;

  const manipulatorNameSuffixes =
    formattedManipulators?.length === 1
      ? [null]
      : (formattedManipulators?.map((_, i) => <sub key={i}>{i + 1}</sub>) ??
        []);

  function onThrowMouseEnter(j: number, t: number) {
    setHoveredKey(`${j}-${t}`);
  }
  function onThrowMouseOut(j: number, t: number) {
    if (hoveredKey === `${j}-${t}`) {
      setHoveredKey(null);
    }
  }

  return (
    <div id={containerId} className="throws-container">
      hovering: {hoveredKey}
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
                  className={`throw-cell ${hoveredKey === `${j}-${t}` ? "hovered" : ""}`}
                  onMouseEnter={() => onThrowMouseEnter(j, t)}
                  onMouseLeave={() => onThrowMouseOut(j, t)}
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
          {formattedManipulators?.map((manipulator, i) => (
            <tr key={i} className="line__m">
              <td>M{manipulatorNameSuffixes[i]}</td>
              {manipulator.map((instruction, t) => (
                <td key={t}>
                  <MathJax key={instruction}>$${instruction}$$</MathJax>
                </td>
              ))}
              <td>&rarr; M{manipulatorNameSuffixes[i]}</td>
            </tr>
          ))}
        </tfoot>
      </table>
      <ThrowsArrows
        jif={jif}
        throws={throws}
        containerSelector={`#${CSS.escape(containerId)}`}
        isSynchronous={isSynchronous}
        hoveredKey={hoveredKey}
      />
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

  return (
    <div className="throw" title={JSON.stringify(thrw)}>
      {/* key is needed to avoid caching issues */}
      <MathJax key={label}>$${label}$$</MathJax>
    </div>
  );
}

function ThrowsArrows({
  jif,
  throws,
  containerSelector,
  isSynchronous,
  hoveredKey,
}: {
  jif: FullJIF;
  throws: ThrowsTableData;
  containerSelector: string;
  isSynchronous: boolean;
  hoveredKey: string | null;
}) {
  const {
    viewSettings: { arrowMode },
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
      throwsWithArrows = orbits(jif);
      arrowTimeDelta = 0;
      colors = ["orange", "aqua", "fuchsia", "lime", "white", "maroon"];
      break;
    default:
      return null;
  }

  const allArrows = throwsWithArrows.flatMap((row, i) =>
    row.map((thrw) => {
      if (!thrw) return null;

      const t1 = thrw.time;
      const j1 = jif.limbs[thrw.from]?.juggler;
      let t2 = t1 + thrw.duration - arrowTimeDelta;
      let j2 = jif.limbs[thrw.to]?.juggler;
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
          hovered={hoveredKey === `${j1}-${t1}`}
        />
      );
    }),
  );

  return (
    <>
      {allArrows}
      {arrowMode === "orbits" &&
        throwsWithArrows.map((_, i) => <span key={i}>{i}</span>)}
    </>
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
  const svgId = useId();

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
    });

    // Respond to layout changes of the container.
    const resizeObserver = new ResizeObserver(() => {
      arrow.update({});
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
    return ["middleLeft", "middleRight"];
  }
  return ["middleRight", "middleRight"]; // TODO: improve
}
