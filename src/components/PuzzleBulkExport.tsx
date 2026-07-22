import { useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  PERIOD_6_LOCALS,
  PUZZLE_THROW_DIGITS,
  PuzzleThrowDigit,
} from "../data/period6_locals";
import {
  clubCountLabel,
  groupLocalsByPuzzleCategory,
} from "../utils/interface_shapes";
import { PuzzlePieceDownload } from "./PuzzlePieceDownload";
import "./PuzzleBulkExport.scss";

/** Version string to include in the downloaded ZIP filename. */
const VERSION_FOR_ZIP = "v4";

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

const DEFAULT_ALLOWED: Record<PuzzleThrowDigit, boolean> = {
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

const DEFAULT_REQUIRED: Record<PuzzleThrowDigit, boolean> = {
  "2": false,
  "4": false,
  "5": false,
  "6": false,
  "7": false,
  "8": false,
  "9": false,
  a: false,
  b: false,
};

export function PuzzleBulkExport({ onAssignA, onAssignB }: Props) {
  const [allowedChecked, setAllowedChecked] = useLocalStorage<
    Record<PuzzleThrowDigit, boolean>
  >("puzzleAllowedThrows", DEFAULT_ALLOWED);
  const [requiredChecked, setRequiredChecked] = useLocalStorage<
    Record<PuzzleThrowDigit, boolean>
  >("puzzleRequiredThrows", DEFAULT_REQUIRED);
  const [includeOneCounts, setIncludeOneCounts] = useLocalStorage<boolean>(
    "puzzleIncludeOneCounts",
    true,
  );

  const qualifying = useMemo(() => {
    const allowedDigits = new Set(
      PUZZLE_THROW_DIGITS.filter((d) => allowedChecked[d]) as string[],
    );
    const requiredDigits = PUZZLE_THROW_DIGITS.filter(
      (d) => requiredChecked[d],
    );
    return PERIOD_6_LOCALS.filter((local) => {
      if (!local.split("").every((ch) => allowedDigits.has(ch))) return false;
      if (!requiredDigits.every((d) => local.includes(d))) return false;
      // "one counts" are patterns where every throw (hex digit) is odd.
      if (
        !includeOneCounts &&
        local.split("").every((ch) => parseInt(ch, 16) % 2 === 1)
      ) {
        return false;
      }
      return true;
    });
  }, [allowedChecked, requiredChecked, includeOneCounts]);

  const groups = useMemo(
    () => groupLocalsByPuzzleCategory(qualifying),
    [qualifying],
  );

  // Build a local → category-prefix map so files are named e.g. "x.2--a45".
  // For the "x.5, ..." groups, drop the ", N passes" suffix.
  const { svgNameFor, filename } = useMemo(() => {
    const categoryByLocal = new Map<string, string>();
    for (const [groupLabel, groupLocals] of groups.entries()) {
      const prefix = groupLabel.split(",")[0].trim();
      for (const local of groupLocals) {
        categoryByLocal.set(local, prefix);
      }
    }
    const checkedDigits = PUZZLE_THROW_DIGITS.filter(
      (d) => allowedChecked[d],
    ).join("");
    return {
      svgNameFor: (local: string) => {
        const prefix = categoryByLocal.get(local);
        return prefix ? `${prefix}--${local}` : local;
      },
      filename: `puzzle-pieces-${VERSION_FOR_ZIP}-${checkedDigits}.zip`,
    };
  }, [groups, allowedChecked]);

  function toggleAllowed(digit: PuzzleThrowDigit) {
    setAllowedChecked((prev) => ({ ...prev, [digit]: !prev[digit] }));
  }

  function toggleRequired(digit: PuzzleThrowDigit) {
    setRequiredChecked((prev) => ({ ...prev, [digit]: !prev[digit] }));
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
          <span className="puzzle-bulk-export__filters-label">
            Allowed throws:
          </span>
          {PUZZLE_THROW_DIGITS.map((digit) => (
            <label key={digit} className="puzzle-bulk-export__chip">
              <input
                type="checkbox"
                checked={allowedChecked[digit]}
                onChange={() => toggleAllowed(digit)}
              />
              <span>{digit}</span>
            </label>
          ))}
        </div>

        <div className="puzzle-bulk-export__filters">
          <span className="puzzle-bulk-export__filters-label">
            Required throws:
          </span>
          {PUZZLE_THROW_DIGITS.map((digit) => (
            <label key={digit} className="puzzle-bulk-export__chip">
              <input
                type="checkbox"
                checked={requiredChecked[digit]}
                onChange={() => toggleRequired(digit)}
              />
              <span>{digit}</span>
            </label>
          ))}
        </div>

        <div className="puzzle-bulk-export__filters">
          <label className="puzzle-bulk-export__chip puzzle-bulk-export__chip--text">
            <span className="puzzle-bulk-export__filters-label">
              Include one counts:
            </span>
            <input
              type="checkbox"
              checked={includeOneCounts}
              onChange={() => setIncludeOneCounts((prev) => !prev)}
            />
          </label>
        </div>

        <PuzzlePieceDownload
          locals={qualifying}
          svgNameFor={svgNameFor}
          filename={filename}
        />

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
      </div>
    </>
  );
}
