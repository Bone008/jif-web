import { useMemo, useState } from "react";
import {
  PERIOD_6_LOCALS,
  PUZZLE_THROW_DIGITS,
  PuzzleThrowDigit,
} from "../data/period6_locals";
import { downloadPieceZip } from "../utils/zipPieces";
import "./PuzzleBulkExport.scss";

interface Props {
  onAssignA: (local: string) => void;
  onAssignB: (local: string) => void;
}

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

  function toggle(digit: PuzzleThrowDigit) {
    setChecked((prev) => ({ ...prev, [digit]: !prev[digit] }));
  }

  async function handleDownload() {
    if (qualifying.length === 0) return;
    setDownloading(true);
    setErrors([]);
    try {
      const result = await downloadPieceZip(qualifying, { doubled: true });
      setErrors(result.errors);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <h3>List of Period 6 Building Blocks</h3>
      <p className="puzzle-bulk-export__info">
        Puzzle pieces work for any even period pattern, but here is an
        exhaustive list of all possible combinations for the local period 3
        halves of period 6 patterns.
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
            {downloading
              ? "Building ZIP …"
              : `Download SVGs (${qualifying.length})`}
          </button>
          <span className="puzzle-bulk-export__count">
            {qualifying.length} pattern{qualifying.length === 1 ? "" : "s"}{" "}
            match
          </span>
        </div>

        <ul className="puzzle-bulk-export__list">
          {qualifying.map((local) => (
            <li key={local} className="puzzle-bulk-export__item">
              <span className="puzzle-bulk-export__pattern">{local}</span>
              <button
                type="button"
                className="puzzle-bulk-export__assign"
                onClick={() => onAssignA(local)}
                title={`Set juggler A to ${local}`}
              >
                ↑ A
              </button>
              <button
                type="button"
                className="puzzle-bulk-export__assign"
                onClick={() => onAssignB(local)}
                title={`Set juggler B to ${local}`}
              >
                ↑ B
              </button>
            </li>
          ))}
        </ul>

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
