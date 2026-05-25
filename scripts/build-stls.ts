/**
 * Generates per-layer STL files for every period-6 local in
 * `src/data/P6.txt`. Output goes to:
 *
 *   public/scad/svg/<local>_layer<n>.svg  - single-layer preprocessed SVG
 *   public/stl/<local>_layer<n>.stl       - 3D-printable layer (n = 1..4)
 *
 * Pipeline per pattern:
 *   1. Render the same JaggedPieceSvg the live UI uses, with forExport=true
 *      and doubled=true (matches the bulk-export ZIP).
 *   2. Run Inkscape to convert <text> to filled paths and strokes to filled
 *      paths. OpenSCAD silently drops both of those, so this preprocessing
 *      is mandatory for layers 2/3/4.
 *   3. Split the flattened SVG into four single-layer SVGs (OpenSCAD 2021.01
 *      ignores the `id=` parameter on import() for SVG, so per-layer files
 *      are the only reliable way to isolate one <g id="layerN"> group).
 *   4. Invoke OpenSCAD once per layer, importing that layer's SVG.
 *
 * Requires `inkscape` and `openscad` on PATH. Run with:
 *   npm run build:stls
 *
 * Built artifacts live in `public/` so Vite copies them into `dist/`. They
 * are gitignored — CI rebuilds them on every deploy so layout changes to
 * the SVG renderer flow through to the printed pieces automatically.
 */

import { mkdtempSync, existsSync } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { renderJaggedPieceSVGString } from "../src/utils/jaggedPieceSvg.tsx";
import { siteswapToJIF } from "../src/jif/high_level_converter.ts";
import { loadWithDefaults } from "../src/jif/jif_loader.ts";
import { interleaveLocalSiteswap } from "../src/jif/local_pattern.ts";

const execFileAsync = promisify(execFile);

const REPO_ROOT = resolve(import.meta.dirname, "..");
const P6_FILE = join(REPO_ROOT, "src/data/P6.txt");
const SCAD_FILE = join(REPO_ROOT, "scad/puzzle_piece.scad");
const STL_OUT = join(REPO_ROOT, "public/stl");
const PREPROCESSED_SVG_OUT = join(REPO_ROOT, "public/scad/svg");

const CONCURRENCY = Number(process.env.STL_CONCURRENCY ?? "4");

async function main() {
  for (const tool of ["inkscape", "openscad"]) {
    if (!(await hasCommand(tool))) {
      console.error(`Missing required tool: ${tool}. Please install it.`);
      process.exit(1);
    }
  }
  if (!existsSync(SCAD_FILE)) {
    console.error(`Missing scad template: ${SCAD_FILE}`);
    process.exit(1);
  }

  await mkdir(STL_OUT, { recursive: true });
  await mkdir(PREPROCESSED_SVG_OUT, { recursive: true });

  // mkdtempSync is fine here — runs once at startup, not in a hot loop.
  const tmpRoot = mkdtempSync(join(tmpdir(), "jif-stl-"));

  const locals = (await readFile(P6_FILE, "utf-8"))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(
    `Building STLs for ${locals.length} patterns (${CONCURRENCY}× concurrency)…`,
  );

  const start = Date.now();
  let done = 0;
  const failures: { local: string; error: string }[] = [];
  await pmap(locals, CONCURRENCY, async (local) => {
    try {
      await buildPiece(local, tmpRoot);
    } catch (e) {
      failures.push({ local, error: e instanceof Error ? e.message : `${e}` });
    } finally {
      done++;
      if (done % 10 === 0 || done === locals.length) {
        console.log(`  ${done}/${locals.length}`);
      }
    }
  });

  await rm(tmpRoot, { recursive: true, force: true });

  if (failures.length > 0) {
    console.error(`\n${failures.length} pattern(s) failed:`);
    for (const f of failures) {
      console.error(`  ${f.local}: ${f.error}`);
    }
    process.exit(1);
  }

  const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Done in ${elapsedSec}s. STLs in ${STL_OUT}`);
}

async function buildPiece(local: string, tmpRoot: string): Promise<void> {
  const interleaved = interleaveLocalSiteswap(local);
  const siteswap = interleaved + interleaved; // doubled, matches bulk export
  const jif = loadWithDefaults(siteswapToJIF(siteswap, 2));
  const svg = renderJaggedPieceSVGString(jif, 0);
  if (svg === null) {
    throw new Error("synchronous pattern, not supported");
  }

  const rawSvgPath = join(tmpRoot, `${local}.raw.svg`);
  const flattenedSvgPath = join(tmpRoot, `${local}.flat.svg`);
  await writeFile(rawSvgPath, svg);

  // Inkscape: flatten <text> to <path>, then stroked outlines to filled
  // paths. Both conversions are required because OpenSCAD's import() for SVG
  // only renders filled regions.
  const inkscapeActions = [
    "select-all:all",
    "object-to-path",
    "select-all:all",
    "object-stroke-to-path",
    "export-overwrite",
    `export-filename:${flattenedSvgPath}`,
    "export-plain-svg",
    "export-do",
  ].join(";");
  await execFileAsync("inkscape", [`--actions=${inkscapeActions}`, rawSvgPath]);

  // OpenSCAD 2021.01 ignores the `id=` parameter on import() for SVG, so we
  // split the flattened 4-layer SVG into 4 single-layer SVGs. Each kept SVG
  // has the same root <svg> attributes so all four layers share one XY frame
  // and stack correctly when merged in a slicer.
  // Layers are processed serially within a pattern so the outer pmap's
  // concurrency cap fully controls the number of in-flight subprocesses.
  // Parallelism across patterns is what gets the wall-clock win; fanning out
  // here too would multiply STL_CONCURRENCY by 4 and oversubscribe CI cores.
  const flattened = await readFile(flattenedSvgPath, "utf-8");
  for (const layer of [1, 2, 3, 4]) {
    const layerSvg = extractLayerSvg(flattened, `layer${layer}`);
    const layerSvgPath = join(
      PREPROCESSED_SVG_OUT,
      `${local}_layer${layer}.svg`,
    );
    await writeFile(layerSvgPath, layerSvg);

    const stlPath = join(STL_OUT, `${local}_layer${layer}.stl`);
    await execFileAsync("openscad", [
      "-o",
      stlPath,
      "-D",
      `svg_file="${layerSvgPath}"`,
      "-D",
      `layer=${layer}`,
      SCAD_FILE,
    ]);
  }
}

/**
 * Extracts the top-level `<g id="...">` matching `layerId` from a flattened
 * SVG and returns a new self-contained SVG document containing only that
 * group. The new document reuses the original `<svg>` root attributes, so
 * coordinates and dimensions are preserved across layers — critical for the
 * four resulting STLs to stack with no XY drift.
 */
export function extractLayerSvg(svg: string, layerId: string): string {
  const svgOpen = /<svg\b[^>]*>/.exec(svg);
  if (!svgOpen) throw new Error("missing <svg> root");

  const openTagRe = new RegExp(`<g\\b[^>]*\\bid=["']${layerId}["'][^>]*>`, "g");
  const openMatch = openTagRe.exec(svg);
  if (!openMatch) throw new Error(`layer "${layerId}" not found in SVG`);

  // Walk forward from the opening tag, balancing <g> and </g> to find the
  // matching close. Only counts well-formed `<g ` / `<g>` opens (so <glyph>,
  // <g style="..."/> self-close, etc. don't confuse the depth tracker).
  const gOpen = /<g\b[^>]*?>/g;
  const gClose = /<\/g\s*>/g;
  let depth = 1;
  let cursor = openMatch.index + openMatch[0].length;
  while (depth > 0) {
    gOpen.lastIndex = cursor;
    gClose.lastIndex = cursor;
    const nextOpen = gOpen.exec(svg);
    const nextClose = gClose.exec(svg);
    if (!nextClose) throw new Error(`unbalanced <g> for "${layerId}"`);
    if (nextOpen && nextOpen.index < nextClose.index) {
      // Inline self-closing groups (<g .../>) wouldn't match gOpen since the
      // regex requires `>` at the end without `/`. We're safe.
      if (!nextOpen[0].endsWith("/>")) depth++;
      cursor = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      cursor = nextClose.index + nextClose[0].length;
    }
  }

  const groupBlock = svg.slice(openMatch.index, cursor);
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${svgOpen[0]}\n${groupBlock}\n</svg>\n`;
}

async function hasCommand(cmd: string): Promise<boolean> {
  try {
    await execFileAsync("which", [cmd]);
    return true;
  } catch {
    return false;
  }
}

async function pmap<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, async () => {
      while (true) {
        const idx = cursor++;
        if (idx >= items.length) return;
        await fn(items[idx]);
      }
    }),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
