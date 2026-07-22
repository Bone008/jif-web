import { renderToStaticMarkup } from "react-dom/server";
import { JaggedPieceSvg } from "../components/JaggedPieceSvg";
import { FullJIF } from "../jif/jif_loader";
import { inferIsSynchronousPattern } from "../jif/util";

/**
 * Renders the puzzle piece for the given juggler as a self-contained SVG XML
 * string. Uses export colors (black strokes/text). Returns null for synchronous
 * patterns. Internally renders the same React component the live UI uses, so
 * the two paths can never drift.
 */
export function renderJaggedPieceSVGString(
  jif: FullJIF,
  juggler: number,
  difficulty?: number,
): string | null {
  if (inferIsSynchronousPattern(jif)) {
    return null;
  }
  return renderToStaticMarkup(
    <JaggedPieceSvg
      jif={jif}
      juggler={juggler}
      difficulty={difficulty}
      forExport
    />,
  );
}
