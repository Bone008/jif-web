import _ from "lodash";
import { useCallback, useMemo, useRef } from "react";
import { FullJIF } from "../jif/jif_loader";
import { getThrowsTableByJuggler } from "../jif/orbits";
import { inferIsSynchronousPattern, wrapLimb } from "../jif/util";
import "./InterfaceJaggedPiece.scss";

type InterfaceBeatShape = "straight" | "outwards" | "inwards";

export function InterfaceJaggedPiece({
  jif,
  juggler,
}: {
  jif: FullJIF;
  juggler: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const interfaceShapes = useMemo(
    () => computeInterfaceShapes(jif, juggler),
    [jif, juggler],
  );

  const isSynchronous = inferIsSynchronousPattern(jif);
  // These are chosen to make them compatible with Excalidraw's grid.
  const beatWidth = 20;
  const height = 80;
  const jagHeight = 10;
  const strokeWidth = 2;

  const throwsTable = getThrowsTableByJuggler(jif);
  const throws = throwsTable[juggler];
  const numBeats = jif.repetition.period;
  const width = numBeats * beatWidth;

  // Check if first and last beats are occupied
  const firstBeatOccupied = throws[0] != null;
  const lastBeatOccupied = throws[numBeats - 1] != null;
  // Calculate padding
  const leftPadding = firstBeatOccupied ? beatWidth : 0;
  const rightPadding = lastBeatOccupied ? beatWidth : 0;
  const leftMargin = firstBeatOccupied ? 0 : beatWidth;

  // Generate path for the outline with jagged edges
  const pathData = generateJaggedPath(
    interfaceShapes,
    beatWidth,
    height,
    jagHeight,
    leftPadding,
    rightPadding,
  );

  const copyToClipboard = useCallback(() => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    // Change stroke color to black for better visibility
    svgString = svgString.replace(/white/g, "black");
    navigator.clipboard.writeText(svgString);
  }, []);

  if (isSynchronous) {
    return (
      <div className="secondary">
        Puzzle pieces for synchronous patterns are not supported yet.
      </div>
    );
  }

  return (
    <div className="jagged-piece" style={{ marginLeft: leftMargin }}>
      <svg
        ref={svgRef}
        width={width + leftPadding + rightPadding + strokeWidth * 2}
        height={height + jagHeight * 2 + strokeWidth * 2}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform={`translate(${strokeWidth}, ${strokeWidth + jagHeight})`}>
          {/* Draw the jagged outline */}
          <path
            d={pathData}
            fill="none"
            stroke="white"
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
          />

          {/* Draw vertical grid lines */}
          {_.range(
            1,
            numBeats + Math.sign(leftPadding) + Math.sign(rightPadding),
          ).map((beat) => (
            <line
              key={`grid-${beat}`}
              x1={beat * beatWidth}
              y1={0}
              x2={beat * beatWidth}
              y2={height}
              stroke="white"
              strokeWidth={0.5}
              opacity={0.5}
            />
          ))}

          {/* Draw throw durations */}
          {throws.map((thrw, beat) => {
            if (thrw) {
              return (
                <text
                  key={beat}
                  x={leftPadding + beat * beatWidth + beatWidth / 2}
                  y={height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="30"
                  fill="white"
                >
                  {thrw.duration.toString(36)}
                </text>
              );
            }
            return null;
          })}
        </g>
      </svg>
      <button onClick={copyToClipboard} title="Copy SVG to clipboard">
        📋
      </button>
    </div>
  );
}

function generateJaggedPath(
  shapes: InterfaceBeatShape[],
  beatWidth: number,
  height: number,
  jagHeight: number,
  leftPadding: number,
  rightPadding: number,
): string {
  const numBeats = shapes.length;
  const width = numBeats * beatWidth;
  const parts: string[] = [];

  // Start at top left (accounting for left padding)
  parts.push(`M 0,0`);

  // Add left padding as straight line if needed
  if (leftPadding > 0) {
    parts.push(`L ${leftPadding},0`);
  }

  // Draw top edge (left to right) with jags
  for (let i = 0; i < numBeats; i++) {
    const x1 = leftPadding + i * beatWidth;
    const x2 = leftPadding + (i + 1) * beatWidth;
    const xMid = (x1 + x2) / 2;

    if (shapes[i] === "straight") {
      parts.push(`L ${x2},0`);
    } else if (shapes[i] === "outwards") {
      // Jag upwards (away from inside)
      parts.push(`L ${xMid},${-jagHeight}`);
      parts.push(`L ${x2},0`);
    } else if (shapes[i] === "inwards") {
      // Jag downwards (towards inside)
      parts.push(`L ${xMid},${jagHeight}`);
      parts.push(`L ${x2},0`);
    }
  }

  // Add right padding as straight line if needed
  if (rightPadding > 0) {
    parts.push(`L ${leftPadding + width + rightPadding},0`);
  }

  // Draw right edge (top to bottom)
  parts.push(`L ${leftPadding + width + rightPadding},${height}`);

  // Add right padding at bottom if needed
  if (rightPadding > 0) {
    parts.push(`L ${leftPadding + width},${height}`);
  }

  // Draw bottom edge (right to left) with jags
  for (let i = numBeats - 1; i >= 0; i--) {
    const x1 = leftPadding + i * beatWidth;
    const x2 = leftPadding + (i + 1) * beatWidth;
    const xMid = (x1 + x2) / 2;

    if (shapes[i] === "straight") {
      parts.push(`L ${x1},${height}`);
    } else if (shapes[i] === "outwards") {
      // Jag downwards (away from inside)
      parts.push(`L ${xMid},${height + jagHeight}`);
      parts.push(`L ${x1},${height}`);
    } else if (shapes[i] === "inwards") {
      // Jag upwards (towards inside)
      parts.push(`L ${xMid},${height - jagHeight}`);
      parts.push(`L ${x1},${height}`);
    }
  }

  // Add left padding at bottom if needed
  if (leftPadding > 0) {
    parts.push(`L 0,${height}`);
  }

  // Draw left edge (bottom to top) - close the path
  parts.push(`L 0,0`);
  parts.push(`Z`);

  return parts.join(" ");
}

function computeInterfaceShapes(
  jif: FullJIF,
  juggler: number,
): InterfaceBeatShape[] {
  const isSynchronous = inferIsSynchronousPattern(jif);
  // TODO: terrible heuristic :(
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

  const interfaceShapes: InterfaceBeatShape[] = _.range(
    jif.repetition.period,
  ).map((beat) => {
    if (beatsWithOutgoing[beat]) {
      return "outwards";
    } else if (ownThrows[beat] && !beatsWithSelf[beat]) {
      return "inwards";
    } else {
      return "straight";
    }
  });
  return interfaceShapes;
}
