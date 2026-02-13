import JSZip from "jszip";
import { useState } from "react";
import { siteswapToJIF } from "../jif/high_level_converter";
import { loadWithDefaults } from "../jif/jif_loader";
import "./BulkJaggedPieceExport.scss";
import { renderJaggedPieceSVGString } from "./jaggedPieceSvg";

export function BulkJaggedPieceExport() {
  const [input, setInput] = useState("");

  /** Doubles a siteswap by interleaving 0s: "524" → "502040". */
  function interleaveLocalSiteswap(siteswap: string): string {
    return siteswap
      .split("")
      .map((ch) => ch + "0")
      .join("");
  }

  async function handleDownload() {
    const siteswaps = input
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (siteswaps.length === 0) return;

    const zip = new JSZip();
    const errors: string[] = [];

    for (const ss of siteswaps) {
      try {
        const interleaved = interleaveLocalSiteswap(ss);
        const doubled = interleaved + interleaved; // repeat for 2 periods
        const jif = siteswapToJIF(doubled, 2);
        const fullJif = loadWithDefaults(jif);
        const svg = renderJaggedPieceSVGString(fullJif, 0);
        if (svg === null) {
          errors.push(`${ss}: synchronous pattern, not supported`);
          continue;
        }
        zip.file(`${ss}.svg`, svg);
      } catch (e) {
        errors.push(`${ss}: ${e}`);
      }
    }

    setErrors(errors);

    if (Object.keys(zip.files).length > 0) {
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jagged-pieces.zip";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  const [errors, setErrors] = useState<string[]>([]);

  return (
    <div className="bulk-export">
      <h3>Bulk Jagged Piece Export</h3>
      <textarea
        className="bulk-export__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter comma-separated siteswaps, e.g. 524, 665"
        rows={2}
      />
      <div>
        <button onClick={handleDownload} disabled={input.trim().length === 0}>
          Download ZIP
        </button>
      </div>
      {errors.length > 0 && (
        <div className="bulk-export__errors">
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}
    </div>
  );
}
