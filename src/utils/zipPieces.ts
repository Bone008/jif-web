import JSZip from "jszip";
import { renderJaggedPieceSVGString } from "../components/jaggedPieceSvg";
import { siteswapToJIF } from "../jif/high_level_converter";
import { loadWithDefaults } from "../jif/jif_loader";
import { interleaveLocalSiteswap } from "../jif/local_pattern";

export interface DownloadPieceZipOptions {
  /** Whether to render two periods of the pattern (twice repeated). */
  doubled: boolean;
  /** Output filename. Defaults to "puzzle-pieces.zip". */
  filename?: string;
}

/**
 * Renders a jagged-piece SVG for each given local siteswap and downloads them
 * bundled in a single zip. Returns any per-pattern errors so the caller can
 * surface them (no throw on partial failure).
 */
export async function downloadPieceZip(
  locals: string[],
  options: DownloadPieceZipOptions,
): Promise<{ errors: string[] }> {
  const zip = new JSZip();
  const errors: string[] = [];

  for (const local of locals) {
    try {
      const interleaved = interleaveLocalSiteswap(local);
      const siteswap = options.doubled
        ? interleaved + interleaved
        : interleaved;
      const jif = loadWithDefaults(siteswapToJIF(siteswap, 2));
      const svg = renderJaggedPieceSVGString(jif, 0);
      if (svg === null) {
        errors.push(`${local}: synchronous pattern, not supported`);
        continue;
      }
      zip.file(`${local}.svg`, svg);
    } catch (e) {
      errors.push(`${local}: ${e}`);
    }
  }

  if (Object.keys(zip.files).length > 0) {
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = options.filename ?? "puzzle-pieces.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  return { errors };
}
