import { useId, useState } from "react";
import { downloadPieceZip, FormatOptions } from "../utils/zipPieces";
import "./PuzzlePieceDownload.scss";

/**
 * Default selection when the component first mounts. STL and OpenSCAD are
 * still WIP, so they're off — users can opt in via the disclosure.
 */
const DEFAULT_FORMATS: FormatOptions = {
  originalSvg: true,
  simplifiedSvg: true,
  scadTemplate: false,
  stl: false,
};

/** One download button with its own set of patterns. */
export interface PieceDownloadSpec {
  /** Adjective shown in the button label, e.g. "collapsed". */
  label: string;
  /** Local siteswaps to include in the downloaded ZIP. */
  locals: string[];
  /** Maps a local pattern to a filename basename (no extension). */
  svgNameFor: (local: string) => string;
  /** Filename of the downloaded ZIP. */
  filename: string;
  /** Render merged pieces with locally equivalent throws stacked. */
  merged: boolean;
}

interface Props {
  /** One button per entry; all share the selected formats. */
  downloads: PieceDownloadSpec[];
}

type FormatKey = keyof FormatOptions;

interface FormatSpec {
  key: FormatKey;
  label: string;
  description: string;
}

const FORMATS: FormatSpec[] = [
  {
    key: "originalSvg",
    label: "Original SVGs",
    description:
      "One SVG per pattern, identical to the live preview. Good for digital compositing and further editing.",
  },
  {
    key: "simplifiedSvg",
    label: "Simplified SVGs",
    description:
      "Per-layer SVGs with text and strokes flattened to filled paths — input for OpenSCAD, or directly usable by some slicers.",
  },
  {
    key: "scadTemplate",
    label: "OpenSCAD template",
    description:
      "Single .scad file that extrudes a Simplified SVG. Tweak thickness or scale, then re-render the STLs yourself.",
  },
  {
    key: "stl",
    label: "3D-printable STLs",
    description:
      "Pre-built per-layer STLs (4 per pattern). Drop into a slicer and print as a multi-material piece.",
  },
];

export function PuzzlePieceDownload({ downloads }: Props) {
  const [formats, setFormats] = useState<FormatOptions>(DEFAULT_FORMATS);
  const [errors, setErrors] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [formatsOpen, setFormatsOpen] = useState(false);
  const formatsId = useId();

  const selectedCount = countSelected(formats);
  const noneSelected = selectedCount === 0;
  const noPatterns = downloads.every((d) => d.locals.length === 0);

  function toggle(key: FormatKey) {
    setFormats((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isDisabled(spec: PieceDownloadSpec) {
    return downloading || noneSelected || spec.locals.length === 0;
  }

  async function handleDownload(spec: PieceDownloadSpec) {
    if (isDisabled(spec)) return;
    setDownloading(true);
    setErrors([]);
    try {
      const result = await downloadPieceZip(spec.locals, {
        doubled: true,
        filename: spec.filename,
        svgNameFor: spec.svgNameFor,
        formats,
        merged: spec.merged,
      });
      setErrors(result.errors);
    } finally {
      setDownloading(false);
    }
  }

  const buttonLabel = (spec: PieceDownloadSpec) =>
    downloading
      ? "Building ZIP …"
      : `Download ${spec.locals.length} ${spec.label} pattern${spec.locals.length === 1 ? "" : "s"}`;

  const disclosureLabel = disclosureStatus({
    noPatterns,
    selectedCount,
    total: FORMATS.length,
  });

  return (
    <section className="puzzle-piece-download">
      <div className="puzzle-piece-download__action">
        {downloads.map((spec) => (
          <button
            key={spec.label}
            type="button"
            onClick={() => handleDownload(spec)}
            disabled={isDisabled(spec)}
            className="button--primary"
          >
            {buttonLabel(spec)}
          </button>
        ))}
        <button
          type="button"
          className="puzzle-piece-download__disclosure"
          onClick={() => setFormatsOpen((open) => !open)}
          aria-expanded={formatsOpen}
          aria-controls={formatsId}
        >
          <span
            className="puzzle-piece-download__disclosure-arrow"
            aria-hidden="true"
          >
            {formatsOpen ? "▾" : "▸"}
          </span>
          {disclosureLabel}
        </button>
      </div>

      {formatsOpen && (
        <ul
          id={formatsId}
          className="puzzle-piece-download__formats"
          role="list"
        >
          {FORMATS.map((spec) => (
            <li key={spec.key} className="puzzle-piece-download__format">
              <label className="puzzle-piece-download__format-label">
                <input
                  type="checkbox"
                  checked={formats[spec.key]}
                  onChange={() => toggle(spec.key)}
                />
                <span className="puzzle-piece-download__format-text">
                  <span className="puzzle-piece-download__format-name">
                    {spec.label}
                  </span>
                  <span className="puzzle-piece-download__format-desc">
                    {spec.description}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <div className="puzzle-piece-download__errors" role="alert">
          <strong>Some files could not be included:</strong>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function countSelected(formats: FormatOptions): number {
  return Object.values(formats).filter(Boolean).length;
}

function disclosureStatus(state: {
  noPatterns: boolean;
  selectedCount: number;
  total: number;
}): string {
  if (state.noPatterns) return "No patterns selected";
  if (state.selectedCount === 0) return "Pick a format";
  return `${state.selectedCount} of ${state.total} formats included`;
}
