import _ from "lodash";
import { FullJIF } from "../jif/jif_loader";
import { getThrowsTableByJuggler } from "../jif/orbits";
import { inferIsSynchronousPattern } from "../jif/util";
import {
  computeInterfaceShapes,
  generateJaggedPath,
  generateLabel,
} from "./InterfaceJaggedPiece";

/**
 * Renders the InterfaceJaggedPiece for the given juggler as an SVG XML string.
 * Uses black strokes/text (suitable for export). Returns null for synchronous patterns.
 */
export function renderJaggedPieceSVGString(
  jif: FullJIF,
  juggler: number,
): string | null {
  if (inferIsSynchronousPattern(jif)) {
    return null;
  }

  const interfaceShapes = computeInterfaceShapes(jif, juggler);

  const beatWidth = 20;
  const height = 80;
  const jagHeight = 10;
  const strokeWidth = 1.5;
  const strokeInset = 5;
  const labelWidth = 90;

  const throwsTable = getThrowsTableByJuggler(jif);
  const throws = throwsTable[juggler].slice();
  const label = generateLabel(throws);

  // Padding logic (same as component)
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

  // Build throw number elements
  const throwTexts = throws
    .map((thrw, beat) => {
      if (!thrw) return "";
      return `<text x="${beat * beatWidth + beatWidth / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="30" font-weight="bold" fill="black">${thrw.duration.toString(36)}</text>`;
    })
    .filter(Boolean)
    .join("\n          ");

  return `<svg width="${width + labelWidth}" height="${height + jagHeight * 2}" xmlns="http://www.w3.org/2000/svg">
  <g id="layer1" transform="translate(0, ${jagHeight})">
    <rect x="0" y="${jagHeight}" width="${labelWidth}" height="${height - jagHeight * 2}" fill="#4b3673" stroke="none"/>
    <g transform="translate(${labelWidth}, ${height / 2})">
      <path d="${pathData}" fill="#4b3673" stroke="none"/>
    </g>
  </g>
  <g id="layer2" transform="translate(${labelWidth}, ${jagHeight + height / 2})">
    <path d="${outlinePathData}" fill="none" stroke="black" stroke-width="${strokeWidth}" stroke-linejoin="miter"/>
  </g>
  <g id="layer3" transform="translate(0, ${jagHeight})">
    <g transform="translate(${labelWidth - 5}, ${height / 2})">
      <text text-anchor="middle" dominant-baseline="hanging" font-size="18" font-weight="bold" fill="black" transform="rotate(90)">${escapeXml(label)}</text>
    </g>
    <g transform="translate(${labelWidth}, 3)">
      ${throwTexts}
    </g>
  </g>
</svg>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
