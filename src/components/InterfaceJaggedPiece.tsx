import _ from "lodash";
import { useCallback, useRef, useState } from "react";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import {
  computeInterfaceShapes,
  InterfaceBeatShape,
} from "../jif/interface_shapes";
import { FullJIF, FullThrow } from "../jif/jif_loader";
import { getThrowsTableByJuggler } from "../jif/orbits";
import { inferIsSynchronousPattern } from "../jif/util";
import { renderJaggedPieceSVGString } from "../utils/jaggedPieceSvg";
import "./InterfaceJaggedPiece.scss";

// Layout constants — single source of truth, used by both the live component
// and the static-string renderer.
export const JAGGED_PIECE_LAYOUT = {
  beatWidth: 20,
  height: 80,
  jagHeight: 10,
  strokeWidth: 1.5,
  strokeInset: 5, // should be >=strokeWidth/2 to avoid clipping
  labelWidth: 100,
} as const;

const UI_COLORS = {
  fill: "#4b3673",
  stroke: "white",
  throwText: "white",
  labelText: "lightgreen",
} as const;

const EXPORT_COLORS = {
  fill: "#4b3673",
  stroke: "black",
  throwText: "black",
  labelText: "black",
} as const;

interface JaggedPieceSvgProps {
  jif: FullJIF;
  juggler: number;
  /** Extra horizontal offset (in beats) — used for B in puzzle mode. */
  beatShift?: number;
  /** Debug overlay: vertical lines at every beat boundary. */
  showVerticalGridLines?: boolean;
  /** Render with export-friendly black colors instead of UI white/green. */
  forExport?: boolean;
}

/**
 * Pure SVG rendering of one juggler's jagged piece. No clipboard, no keypress
 * shortcuts — used by both the interactive InterfaceJaggedPiece component and
 * by renderJaggedPieceSVGString (via react-dom/server) for bulk export.
 */
export function JaggedPieceSvg({
  jif,
  juggler,
  beatShift = 0,
  showVerticalGridLines = false,
  forExport = false,
}: JaggedPieceSvgProps) {
  const colors = forExport ? EXPORT_COLORS : UI_COLORS;
  const { beatWidth, height, jagHeight, strokeWidth, strokeInset, labelWidth } =
    JAGGED_PIECE_LAYOUT;

  const interfaceShapes = computeInterfaceShapes(jif, juggler);
  const throwsTable = getThrowsTableByJuggler(jif);
  const throws = throwsTable[juggler].slice();
  const label = generateLabel(throws);

  // Pad to avoid throws sitting right on the edge. Mirror the opposite end's
  // shape so the jag looks continuous.
  const firstBeatOccupied = throws[0] !== null;
  const lastBeatOccupied = _.last(throws) !== null;
  if (firstBeatOccupied) {
    throws.unshift(null);
    interfaceShapes.unshift(_.last(interfaceShapes)!);
  } else if (lastBeatOccupied) {
    throws.push(null);
    interfaceShapes.push(interfaceShapes[0]);
  }

  const width = throws.length * beatWidth;
  // When the first original beat is empty (juggler-1 in async patterns), shift
  // the whole piece right by one beat so it visually aligns with the paired
  // piece. This used to live as marginLeft on the wrapper; now baked into the
  // SVG so the static-rendered export looks identical to the live UI.
  const naturalShift = firstBeatOccupied ? 0 : 1;
  const xOffset = (naturalShift + beatShift) * beatWidth;
  const totalWidth = width + labelWidth + xOffset;

  const pathData = generateJaggedPath(
    interfaceShapes,
    beatWidth,
    height,
    jagHeight,
  );
  const outlinePathData = generateJaggedPath(
    interfaceShapes,
    beatWidth,
    height,
    jagHeight,
    strokeInset,
  );

  return (
    <svg
      width={totalWidth}
      height={height + jagHeight * 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Layer 1: Filled surface */}
      <g
        id="layer1"
        className="base"
        transform={`translate(${xOffset}, ${jagHeight})`}
      >
        <rect
          x={0}
          y={jagHeight}
          width={labelWidth}
          height={height - jagHeight * 2}
          fill={colors.fill}
          stroke="none"
        />
        <g transform={`translate(${labelWidth}, ${height / 2})`}>
          <path d={pathData} fill={colors.fill} stroke="none" />
        </g>
      </g>

      {/* Layer 2: Outline and (optional) vertical grid lines */}
      <g
        id="layer2"
        className="outline"
        transform={`translate(${xOffset + labelWidth}, ${jagHeight + height / 2})`}
      >
        <path
          d={outlinePathData}
          fill="none"
          stroke={colors.stroke}
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
              stroke={colors.stroke}
              strokeWidth={0.5}
              opacity={0.5}
            />
          ))}
      </g>

      {/* Layer 3: Throw duration numbers */}
      <g
        id="layer3"
        className="text"
        transform={`translate(${xOffset}, ${jagHeight})`}
      >
        <g transform={`translate(${labelWidth}, 3)`}>
          {throws.map((thrw, beat) =>
            thrw ? (
              <text
                key={beat}
                x={beat * beatWidth + beatWidth / 2}
                y={height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="30"
                fontWeight="bold"
                fill={colors.throwText}
              >
                {thrw.duration.toString(36)}
              </text>
            ) : null,
          )}
        </g>
      </g>

      {/* Layer 4: Label text */}
      <g
        id="layer4"
        className="label"
        transform={`translate(${xOffset}, ${jagHeight})`}
      >
        <text
          x={15}
          y={height / 2}
          textAnchor="start"
          dominantBaseline="central"
          fontSize="30"
          fontWeight="bold"
          fill={colors.labelText}
        >
          {label}
        </text>
      </g>
    </svg>
  );
}

export function InterfaceJaggedPiece({
  jif,
  juggler,
  beatShift = 0,
}: {
  jif: FullJIF;
  juggler: number;
  beatShift?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showVerticalGridLines, setShowVerticalGridLines] = useState(false);

  useKeyboardShortcut({
    key: "v",
    onKeyPressed() {
      setShowVerticalGridLines((value) => !value);
    },
  });

  const copyToClipboard = useCallback(() => {
    const svg = renderJaggedPieceSVGString(jif, juggler);
    if (svg) navigator.clipboard.writeText(svg);
  }, [jif, juggler]);

  if (inferIsSynchronousPattern(jif)) {
    return (
      <div className="secondary">
        Puzzle pieces for synchronous patterns are not supported yet.
      </div>
    );
  }

  return (
    <div className="jagged-piece" ref={containerRef}>
      <JaggedPieceSvg
        jif={jif}
        juggler={juggler}
        beatShift={beatShift}
        showVerticalGridLines={showVerticalGridLines}
      />
      <button onClick={copyToClipboard} title="Copy SVG to clipboard">
        📋
      </button>
    </div>
  );
}

export function generateJaggedPath(
  shapes: InterfaceBeatShape[],
  beatWidth: number,
  height: number,
  jagHeight: number,
  inset: number = 0,
): string {
  const numBeats = shapes.length;
  const width = numBeats * beatWidth;
  const parts: string[] = [];

  const left = inset / 2;
  const right = width - inset / 2;
  const top = -height / 2 + inset;
  const bottom = height / 2 - inset;

  // When the first or last beat is a jag, the inset corner must lie on the
  // same diagonal as the jag itself — otherwise the outline tilts away from
  // the background fill at the start/end of the piece. The peak is at
  // `beatWidth/2` from the edge; the corner is at `inset/2` from the edge.
  // Project the jag's diagonal back to x=left/right to get the corner y.
  const cornerYOffset = (s: InterfaceBeatShape) => {
    if (s === "straight") return 0;
    const offset = (jagHeight * inset) / beatWidth;
    return s === "outwards" ? -offset : +offset;
  };
  const firstOffset = cornerYOffset(shapes[0]);
  const lastOffset = cornerYOffset(shapes[numBeats - 1]);
  const topLeftY = top + firstOffset;
  const topRightY = top + lastOffset;
  const bottomLeftY = bottom - firstOffset;
  const bottomRightY = bottom - lastOffset;

  parts.push(`M ${left},${topLeftY}`);

  // Top edge (left → right)
  for (let i = 0; i < numBeats; i++) {
    const isLast = i === numBeats - 1;
    const xEnd = isLast ? right : (i + 1) * beatWidth;
    const xMid = (i * beatWidth + (i + 1) * beatWidth) / 2;
    const endY = isLast ? topRightY : top;

    if (shapes[i] === "straight") {
      parts.push(`L ${xEnd},${endY}`);
    } else if (shapes[i] === "outwards") {
      parts.push(`L ${xMid},${top - jagHeight}`);
      parts.push(`L ${xEnd},${endY}`);
    } else if (shapes[i] === "inwards") {
      parts.push(`L ${xMid},${top + jagHeight}`);
      parts.push(`L ${xEnd},${endY}`);
    }
  }

  // Right edge (top-right → bottom-right)
  parts.push(`L ${right},${bottomRightY}`);

  // Bottom edge (right → left)
  for (let i = numBeats - 1; i >= 0; i--) {
    const isFirst = i === 0;
    const xStart = isFirst ? left : i * beatWidth;
    const xMid = (i * beatWidth + (i + 1) * beatWidth) / 2;
    const endY = isFirst ? bottomLeftY : bottom;

    if (shapes[i] === "straight") {
      parts.push(`L ${xStart},${endY}`);
    } else if (shapes[i] === "outwards") {
      parts.push(`L ${xMid},${bottom + jagHeight}`);
      parts.push(`L ${xStart},${endY}`);
    } else if (shapes[i] === "inwards") {
      parts.push(`L ${xMid},${bottom - jagHeight}`);
      parts.push(`L ${xStart},${endY}`);
    }
  }

  // Left edge (bottom-left → top-left), then close
  parts.push(`L ${left},${topLeftY}`);
  parts.push(`Z`);

  return parts.join(" ");
}

export function computeInterfaceShapes(
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

  return _.range(jif.repetition.period).map((beat) => {
    if (beatsWithOutgoing[beat]) {
      return "outwards";
    } else if (ownThrows[beat] && !beatsWithSelf[beat]) {
      return "inwards";
    } else {
      return "straight";
    }
  });
}

/** Formats the label of a jagged piece. */
export function generateLabel(throws: (FullThrow | null)[]): string {
  const sum = throws
    .map((thrw) => (thrw ? thrw.duration : 0))
    .reduce((a, b) => a + b, 0);
  const numObjects = sum / throws.length;
  return numObjects.toFixed(1);
}
