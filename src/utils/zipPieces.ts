import JSZip from "jszip";
import scadTemplate from "../../scad/puzzle_piece.scad?raw";
import { renderJaggedPieceSVGString } from "./jaggedPieceSvg";
import { siteswapToJIF } from "../jif/high_level_converter";
import { loadWithDefaults } from "../jif/jif_loader";
import { interleaveLocalSiteswap } from "../jif/local_pattern";

export const DEFAULT_ZIP_FILENAME = "puzzle-pieces.zip";

/** Number of detail layers per piece (layer1 = base, layer2..N = details). */
const LAYERS = [1, 2, 3, 4] as const;

/** Concurrent fetches when downloading STL/preprocessed-SVG assets. */
const FETCH_CONCURRENCY = 8;

export interface BuildPieceZipOptions {
  /** Whether to render two periods of the pattern (twice repeated). */
  doubled: boolean;
  /**
   * Maps a local pattern to the file basename inside the zip (without
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
 * into a JSZip alongside the OpenSCAD template. Sync; STL/preprocessed-SVG
 * assets that require network fetches are added later by `downloadPieceZip`.
 * Returned `errors` capture per-pattern SVG rendering failures so the caller
 * can surface them without aborting the whole download.
 */
export function buildPieceZip(
  locals: string[],
  options: BuildPieceZipOptions,
): { zip: JSZip; errors: string[] } {
  const zip = new JSZip();
  const errors: string[] = [];
  const nameFor = options.svgNameFor ?? ((local: string) => local);

  zip.file("scad/puzzle_piece.scad", scadTemplate);

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
      zip.file(`svg/${nameFor(local)}.svg`, svg);
    } catch (e) {
      errors.push(`${local}: ${e}`);
    }
  }

  return { zip, errors };
}

/**
 * Fetches the CI-built preprocessed SVGs (under /scad/svg/) and per-layer STLs
 * (under /stl/) for each local and adds them to the zip. Network failures
 * append to `errors` so users still get whatever assets succeeded. Filenames
 * inside the zip follow `svgNameFor`; fetch URLs use the raw local since CI
 * builds artifacts by local name.
 */
async function addPrintAssets(
  zip: JSZip,
  locals: string[],
  options: BuildPieceZipOptions,
  errors: string[],
): Promise<void> {
  const nameFor = options.svgNameFor ?? ((local: string) => local);

  const tasks: (() => Promise<void>)[] = [];
  for (const local of locals) {
    const name = nameFor(local);
    for (const layer of LAYERS) {
      tasks.push(async () => {
        try {
          const blob = await fetchAsset(`/scad/svg/${local}_layer${layer}.svg`);
          zip.file(`scad/svg/${name}_layer${layer}.svg`, blob);
        } catch (e) {
          errors.push(`${local}: scad/svg layer${layer} fetch failed: ${e}`);
        }
      });
      tasks.push(async () => {
        try {
          const blob = await fetchAsset(`/stl/${local}_layer${layer}.stl`);
          zip.file(`stl/${name}_layer${layer}.stl`, blob);
        } catch (e) {
          errors.push(`${local}: stl layer${layer} fetch failed: ${e}`);
        }
      });
    }
  }

  await runWithConcurrency(tasks, FETCH_CONCURRENCY);
}

async function fetchAsset(path: string): Promise<Blob> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.blob();
}

async function runWithConcurrency(
  tasks: (() => Promise<void>)[],
  concurrency: number,
): Promise<void> {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, async () => {
      while (true) {
        const idx = cursor++;
        if (idx >= tasks.length) return;
        await tasks[idx]();
      }
    }),
  );
}

/**
 * Renders a jagged-piece SVG for each given local siteswap, fetches the
 * CI-built STLs + preprocessed SVGs, and downloads everything bundled in a
 * single zip. Returns any per-pattern errors so the caller can surface them
 * (no throw on partial failure).
 */
export async function downloadPieceZip(
  locals: string[],
  options: DownloadPieceZipOptions,
): Promise<{ errors: string[] }> {
  const { zip, errors } = buildPieceZip(locals, options);

  await addPrintAssets(zip, locals, options, errors);

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
