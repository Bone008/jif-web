import { useCallback, useRef, useState } from "react";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { FullJIF } from "../jif/jif_loader";
import { inferIsSynchronousPattern } from "../jif/util";
import { renderJaggedPieceSVGString } from "../utils/jaggedPieceSvg";
import { JaggedPieceSvg } from "./JaggedPieceSvg";
import "./InterfaceJaggedPiece.scss";

export {
  JAGGED_PIECE_LAYOUT,
  JaggedPieceSvg,
  generateJaggedPath,
  generateLabel,
} from "./JaggedPieceSvg";

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
