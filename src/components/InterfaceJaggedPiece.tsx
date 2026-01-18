import _ from "lodash";
import { useCallback, useRef, useState } from "react";
import { FullJIF, FullThrow } from "../jif/jif_loader";
import { getThrowsTableByJuggler } from "../jif/orbits";
import { inferIsSynchronousPattern, wrapLimb } from "../jif/util";
import "./InterfaceJaggedPiece.scss";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";

type InterfaceBeatShape = "straight" | "outwards" | "inwards";

export function InterfaceJaggedPiece({
  jif,
  juggler,
}: {
  jif: FullJIF;
  juggler: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showVerticalGridLines, setShowVerticalGridLines] = useState(false);
  const interfaceShapes = computeInterfaceShapes(jif, juggler);

  const isSynchronous = inferIsSynchronousPattern(jif);
  // These are chosen to make them compatible with Excalidraw's grid.
  const beatWidth = 20;
  const height = 80;
  const jagHeight = 10;
  const strokeWidth = 1.5;
  const strokeInset = 5; // should be >=strokeWidth/2 to avoid clipping
  const labelWidth = 90; // Width for the label section on the left

  const throwsTable = getThrowsTableByJuggler(jif);
  const throws = throwsTable[juggler].slice();
  const label = generateLabel(throws);

  // Calculate padding to avoid numbers on the edge of the card.
  // The line shape of the padding should match the opposite end.
  const firstBeatOccupied = throws[0] !== null;
  const lastBeatOccupied = _.last(throws) !== null;
  if (firstBeatOccupied) {
    throws.unshift(null);
    interfaceShapes.unshift(_.last(interfaceShapes)!);
  } else if (lastBeatOccupied) {
    throws.push(null);
    interfaceShapes.push(interfaceShapes[0]);
  }
  // How far to offset the card to match it up with its counterpart.
  const leftMargin = firstBeatOccupied ? 0 : beatWidth;

  const width = throws.length * beatWidth;

  // Generate path for the fill with jagged edges (background)
  const pathData = generateJaggedPath(
    interfaceShapes,
    beatWidth,
    height,
    jagHeight,
  );

  // Generate path for the outline with slightly smaller dimensions for padding
  const outlinePathData = generateJaggedPath(
    interfaceShapes,
    beatWidth,
    height,
    jagHeight,
    strokeInset,
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

  useKeyboardShortcut({
    key: "v",
    onKeyPressed() {
      setShowVerticalGridLines((value) => !value);
    },
  });

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
        width={width + labelWidth}
        height={height + jagHeight * 2}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 1: Filled surface */}
        <g
          id="layer1"
          className="base"
          transform={`translate(0, ${jagHeight})`}
        >
          {/* Label rectangle background */}
          <rect
            x={0}
            y={jagHeight}
            width={labelWidth}
            height={height - jagHeight * 2}
            fill="#4b3673"
            stroke="none"
          />
          {/* Main puzzle piece filled surface */}
          <g transform={`translate(${labelWidth}, ${height / 2})`}>
            <path d={pathData} fill="#4b3673" stroke="none" />
          </g>
        </g>

        {/* Layer 2: Outline and vertical grid lines */}
        <g
          id="layer2"
          className="outline"
          transform={`translate(${labelWidth}, ${jagHeight + height / 2})`}
        >
          <path
            d={outlinePathData}
            fill="none"
            stroke="white"
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
          />

          {showVerticalGridLines &&
            _.range(1, throws.length).map((beat) => (
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
        </g>

        {/* Layer 3: Text */}
        <g
          id="layer3"
          className="text"
          transform={`translate(0, ${jagHeight})`}
        >
          {/* Label text */}
          <g transform={`translate(${labelWidth - 5}, ${height / 2})`}>
            <text
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize="18"
              fontWeight="bold"
              fill="white"
              transform="rotate(90)"
            >
              {label}
            </text>
          </g>

          {/* Throw duration numbers */}
          <g transform={`translate(${labelWidth}, 3)`}>
            {throws.map((thrw, beat) => {
              if (thrw) {
                return (
                  <text
                    key={beat}
                    x={beat * beatWidth + beatWidth / 2}
                    y={height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="30"
                    fontWeight="bold"
                    fill="white"
                  >
                    {thrw.duration.toString(36)}
                  </text>
                );
              }
              return null;
            })}
          </g>
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
  inset: number = 0,
): string {
  const numBeats = shapes.length;
  const width = numBeats * beatWidth;
  const parts: string[] = [];

  // Apply inset to dimensions (only affects baseline, not jag height)
  // TODO: Left and right should also be fully inset, but this leads to weird angles
  // when there is a jag on the first or last beat, which is hard to fix. so we allow
  // horizontal edges to be slightly closer to the border.
  // const left = inset;
  const left = inset / 2;
  const right = width - inset / 2;
  const top = -height / 2 + inset;
  const bottom = height / 2 - inset;

  // Start at top left (with vertical origin centered)
  parts.push(`M ${left},${top}`);

  // Draw top edge (left to right) with jags
  for (let i = 0; i < numBeats; i++) {
    const xEnd = i === numBeats - 1 ? right : (i + 1) * beatWidth;
    const xMid = (i * beatWidth + (i + 1) * beatWidth) / 2;

    if (shapes[i] === "straight") {
      parts.push(`L ${xEnd},${top}`);
    } else if (shapes[i] === "outwards") {
      // Jag upwards (away from inside)
      parts.push(`L ${xMid},${top - jagHeight}`);
      parts.push(`L ${xEnd},${top}`);
    } else if (shapes[i] === "inwards") {
      // Jag downwards (towards inside)
      parts.push(`L ${xMid},${top + jagHeight}`);
      parts.push(`L ${xEnd},${top}`);
    }
  }

  // Draw right edge (top to bottom)
  parts.push(`L ${right},${bottom}`);

  // Draw bottom edge (right to left) with jags
  for (let i = numBeats - 1; i >= 0; i--) {
    const xStart = i === 0 ? left : i * beatWidth;
    const xMid = (i * beatWidth + (i + 1) * beatWidth) / 2;

    if (shapes[i] === "straight") {
      parts.push(`L ${xStart},${bottom}`);
    } else if (shapes[i] === "outwards") {
      // Jag downwards (away from inside)
      parts.push(`L ${xMid},${bottom + jagHeight}`);
      parts.push(`L ${xStart},${bottom}`);
    } else if (shapes[i] === "inwards") {
      // Jag upwards (towards inside)
      parts.push(`L ${xMid},${bottom - jagHeight}`);
      parts.push(`L ${xStart},${bottom}`);
    }
  }

  // Draw left edge (bottom to top) - close the path
  parts.push(`L ${left},${top}`);
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

/** Formats the label of a jagged piece. */
function generateLabel(throws: (FullThrow | null)[]): string {
  const sum = throws
    .map((thrw) => (thrw ? thrw.duration : 0))
    .reduce((a, b) => a + b, 0);
  const numObjects = sum / throws.length;
  return (
    (Number.isInteger(numObjects)
      ? numObjects.toString()
      : numObjects.toFixed(1)) + " C"
  );
}
