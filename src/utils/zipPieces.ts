import JSZip from "jszip";
import { renderJaggedPieceSVGString } from "./jaggedPieceSvg";
import { siteswapToJIF } from "../jif/high_level_converter";
import { loadWithDefaults } from "../jif/jif_loader";
import { interleaveLocalSiteswap } from "../jif/local_pattern";

export const DEFAULT_ZIP_FILENAME = "puzzle-pieces.zip";

export interface BuildPieceZipOptions {
  /** Whether to render two periods of the pattern (twice repeated). */
  doubled: boolean;
  /**
   * Maps a local pattern to the SVG filename inside the zip (without `.svg`
   * extension). Defaults to using the local pattern itself.
   */
  svgNameFor?: (local: string) => string;
}

export interface DownloadPieceZipOptions extends BuildPieceZipOptions {
  /** Output filename. Defaults to DEFAULT_ZIP_FILENAME. */
  filename?: string;
}

/**
 * Renders a jagged-piece SVG for each given local siteswap and assembles them
 * into a JSZip without triggering any download. Returns the zip and any
 * per-pattern errors. Used both by the download helper and by tests.
 */
export function buildPieceZip(
  locals: string[],
  options: BuildPieceZipOptions,
): { zip: JSZip; errors: string[] } {
  const zip = new JSZip();
  const errors: string[] = [];
  const svgNameFor = options.svgNameFor ?? ((local: string) => local);

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
      zip.file(`${svgNameFor(local)}.svg`, svg);
    } catch (e) {
      errors.push(`${local}: ${e}`);
    }
  }

  return { zip, errors };
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
  const { zip, errors } = buildPieceZip(locals, options);

  if (Object.keys(zip.files).length > 0) {
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = options.filename ?? DEFAULT_ZIP_FILENAME;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { errors };
}
