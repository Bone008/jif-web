import arrowLine from "arrow-line";
import { MathJax } from "better-react-mathjax";
import _ from "lodash";
import { useEffect, useRef } from "react";
import { FullJIF, FullThrow } from "../jif/jif_loader";
import { ThrowsTableData } from "../jif/orbits";
import "./ThrowsTable.scss";

export function ThrowsTable({
  jif,
  throws,
  formattedManipulators,
}: {
  jif: FullJIF;
  throws: ThrowsTableData;
  formattedManipulators?: string[][];
}) {
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

  return (
    <div className="throws-container">
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
            <tr key={j}>
              <td>{jif.jugglers[j].label}</td>
              {row.map((thrw, t) => (
                <td key={t}>
                  {thrw && (
                    <ThrowCell
                      jif={jif}
                      thrw={thrw}
                      isSynchronous={isSynchronous}
                      useLetters={useLetters}
                    />
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
      <ArrowOverlay />
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
    <div className="supsub" title={JSON.stringify(thrw)}>
      {/* key is needed to avoid caching issues */}
      <MathJax key={label}>$${label}$$</MathJax>
    </div>
  );
}

function ArrowOverlay() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    svgRef.current.id = "svg-" + Math.random().toString(36).slice(2);
    const arrow = arrowLine({
      //svgParentSelector: `#${svgRef.current.id}`,
      source: ".throws-container tr:nth-child(1) td:nth-child(2) mjx-math",
      destination: ".throws-container tr:nth-child(2) td:nth-child(3) mjx-math",
      thickness: 2,
      curvature: 0,
      color: "orange",
    });

    // Respond to layout changes of the table.
    const throwsContainer = document.querySelector(".throws-container")!;
    const resizeObserver = new ResizeObserver(() => {
      arrow.update({});
    });
    resizeObserver.observe(throwsContainer);

    return () => {
      resizeObserver.disconnect();
      arrow.remove();
    };
  }, [svgRef]);

  return (
    <svg
      ref={svgRef}
      className="svg-arrows"
      viewBox="0 0 1 1"
      preserveAspectRatio="xMinyMin slice"
    ></svg>
  );
}
