import { useMemo, useState } from "react";
import {
  PERIOD_6_LOCALS,
  PUZZLE_THROW_DIGITS,
  PuzzleThrowDigit,
} from "../data/period6_locals";
import {
  clubCountLabel,
  groupLocalsByPuzzleCategory,
} from "../utils/interface_shapes";
import { downloadPieceZip } from "../utils/zipPieces";
import "./PuzzleBulkExport.scss";

/** Version string to include in the downloaded ZIP filename. */
const VERSION_FOR_ZIP = "v3";

interface Props {
  onAssignA: (local: string) => void;
  onAssignB: (local: string) => void;
}

// Hard-coded layout: complementary fractional groups sit in the same row.
const GROUP_ROWS: string[][] = [
  ["x.2, 1 pass", "x.8, 1 pass"],
  ["x.3, 2 passes", "x.7, 2 passes"],
  ["x.5, 1 pass", "x.0, 2 passes"],
  ["x.5, 3 passes"],
];

const DEFAULT_CHECKED: Record<PuzzleThrowDigit, boolean> = {
  "2": true,
  "4": true,
  "5": true,
  "6": true,
  "7": true,
  "8": true,
  "9": true,
  a: true,
  b: false,
};

export function PuzzleBulkExport({ onAssignA, onAssignB }: Props) {
  const [checked, setChecked] =
    useState<Record<PuzzleThrowDigit, boolean>>(DEFAULT_CHECKED);
  const [errors, setErrors] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  const qualifying = useMemo(() => {
    const allowed = new Set(
      PUZZLE_THROW_DIGITS.filter((d) => checked[d]) as string[],
    );
    return PERIOD_6_LOCALS.filter((local) =>
      local.split("").every((ch) => allowed.has(ch)),
    );
  }, [checked]);

  const groups = useMemo(
    () => groupLocalsByPuzzleCategory(qualifying),
    [qualifying],
  );

  function toggle(digit: PuzzleThrowDigit) {
    setChecked((prev) => ({ ...prev, [digit]: !prev[digit] }));
  }

  async function handleDownload() {
    if (qualifying.length === 0) return;
    setDownloading(true);
    setErrors([]);
    try {
      const checkedDigits = PUZZLE_THROW_DIGITS.filter((d) => checked[d]).join(
        "",
      );
      const filename = `puzzle-pieces-${VERSION_FOR_ZIP}-${checkedDigits}.zip`;
      // Build a local → category-prefix map so SVGs are named e.g. "x.2--a45".
      // For the "x.5, ..." groups, drop the ", N passes" suffix.
      const categoryByLocal = new Map<string, string>();
      for (const [groupLabel, groupLocals] of groups.entries()) {
        const prefix = groupLabel.split(",")[0].trim();
        for (const local of groupLocals) {
          categoryByLocal.set(local, prefix);
        }
      }
      const result = await downloadPieceZip(qualifying, {
        doubled: true,
        filename,
        svgNameFor: (local) => {
          const prefix = categoryByLocal.get(local);
          return prefix ? `${prefix}--${local}` : local;
        },
      });
      setErrors(result.errors);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <h3>List of Period 6 Building Blocks</h3>
      <p className="puzzle-bulk-export__info">
        Puzzle pieces can be created for any even period pattern. Here is an
        exhaustive list of all possible combinations for the local period 3
        halves of period 6 patterns.
      </p>
      <p className="puzzle-bulk-export__info">
        The <span className="puzzle-bulk-export__highlight">object counts</span>{" "}
        of both patterns must add up to an integer to be a valid combination.
      </p>
      <div className="puzzle-bulk-export">
        <div className="puzzle-bulk-export__filters">
          <span className="puzzle-bulk-export__filters-label">Throws:</span>
          {PUZZLE_THROW_DIGITS.map((digit) => (
            <label key={digit} className="puzzle-bulk-export__chip">
              <input
                type="checkbox"
                checked={checked[digit]}
                onChange={() => toggle(digit)}
              />
              <span>{digit}</span>
            </label>
          ))}
        </div>

        <div className="puzzle-bulk-export__summary">
          <button
            type="button"
            onClick={handleDownload}
            disabled={qualifying.length === 0 || downloading}
          >
            {downloading ? "Building ZIP …" : "Download SVGs"}
          </button>
          <span className="puzzle-bulk-export__count">
            {qualifying.length} pattern{qualifying.length === 1 ? "" : "s"}{" "}
            match
          </span>
        </div>

        <div className="puzzle-bulk-export__groups">
          {GROUP_ROWS.map((row, rowIndex) => {
            const cells = row
              .map((label) => ({ label, locals: groups.get(label) ?? [] }))
              .filter((cell) => cell.locals.length > 0);
            if (cells.length === 0) return null;
            return (
              <div key={rowIndex} className="puzzle-bulk-export__group-row">
                {cells.map(({ label, locals }) => (
                  <section key={label} className="puzzle-bulk-export__group">
                    <h4 className="puzzle-bulk-export__group-header">
                      {label}
                    </h4>
                    <ul className="puzzle-bulk-export__list">
                      {locals.map((local) => (
                        <li key={local} className="puzzle-bulk-export__item">
                          <span className="puzzle-bulk-export__pattern">
                            {local}
                          </span>
                          <span className="puzzle-bulk-export__clubs">
                            {clubCountLabel(local)}
                          </span>
                          <button
                            type="button"
                            className="puzzle-bulk-export__assign"
                            onClick={() => onAssignA(local)}
                            title={`Set juggler A to ${local}`}
                          >
                            ↑A
                          </button>
                          <button
                            type="button"
                            className="puzzle-bulk-export__assign"
                            onClick={() => onAssignB(local)}
                            title={`Set juggler B to ${local}`}
                          >
                            ↑B
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            );
          })}
        </div>

        {errors.length > 0 && (
          <div className="puzzle-bulk-export__errors">
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
