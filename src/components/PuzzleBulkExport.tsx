import { useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  classifyDifficulty,
  PERIOD_6_LOCALS,
  PUZZLE_THROW_DIGITS,
  PuzzleThrowDigit,
} from "../data/period6_locals";
import {
  clubCountLabel,
  groupLocalsByPuzzleCategory,
} from "../utils/interface_shapes";
import { DifficultyHexagons } from "./JaggedPieceSvg";
import { PuzzlePieceDownload } from "./PuzzlePieceDownload";
import "./PuzzleBulkExport.scss";

/** Version string to include in the downloaded ZIP filename. */
const VERSION_FOR_ZIP = "v5";

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

// Allowed-throw presets used by the set picker.
const ALLOWED_UP_TO_9: Record<PuzzleThrowDigit, boolean> = {
  "2": true,
  "4": true,
  "5": true,
  "6": true,
  "7": true,
  "8": true,
  "9": true,
  a: false,
  b: false,
};

const ALLOWED_UP_TO_B: Record<PuzzleThrowDigit, boolean> = {
  "2": true,
  "4": true,
  "5": true,
  "6": true,
  "7": true,
  "8": true,
  "9": true,
  a: true,
  b: true,
};

type SetId = "beginner" | "main" | "triple";

interface SetConfig {
  id: SetId;
  label: string;
  /** Difficulty level this set maps to; selecting it filters by this exactly. */
  difficulty: number;
  allowed: Record<PuzzleThrowDigit, boolean>;
  includeOneCounts: boolean;
}

// Each set maps to a full filter configuration. While a set is selected the
// list is filtered to exactly that difficulty level; the other fields keep the
// filter combo boxes in sync. The beginner set only contains throws 2-9.
const SET_CONFIGS: SetConfig[] = [
  {
    id: "beginner",
    label: "Beginner set",
    difficulty: 1,
    allowed: ALLOWED_UP_TO_9,
    includeOneCounts: false,
  },
  {
    id: "main",
    label: "Main set",
    difficulty: 2,
    allowed: ALLOWED_UP_TO_9,
    includeOneCounts: false,
  },
  {
    id: "triple",
    label: "Triples set",
    difficulty: 3,
    allowed: ALLOWED_UP_TO_B,
    includeOneCounts: false,
  },
];

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
  const [selectedSet, setSelectedSet] = useLocalStorage<SetId | null>(
    "puzzleSelectedSet",
    null,
  );

  const qualifying = useMemo(() => {
    const allowedDigits = new Set(
      PUZZLE_THROW_DIGITS.filter((d) => allowedChecked[d]) as string[],
    );
    const requiredDigits = PUZZLE_THROW_DIGITS.filter(
      (d) => requiredChecked[d],
    );
    return PERIOD_6_LOCALS.filter((local) => {
      // A selected set filters the list to exactly its difficulty level.
      if (selectedSet) {
        const level = SET_CONFIGS.find((c) => c.id === selectedSet)?.difficulty;
        if (classifyDifficulty(local) !== level) {
          return false;
        }
      }

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
  }, [selectedSet, allowedChecked, requiredChecked, includeOneCounts]);

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
    // Encode the active filter state into the filename so different exports are
    // easy to tell apart.
    const parts = ["puzzle-pieces", VERSION_FOR_ZIP];
    const set = SET_CONFIGS.find((c) => c.id === selectedSet);
    if (set) {
      parts.push(set.label.toLowerCase().replace(/\s+/g, "-"));
    }
    parts.push(PUZZLE_THROW_DIGITS.filter((d) => allowedChecked[d]).join(""));
    const requiredDigits = PUZZLE_THROW_DIGITS.filter(
      (d) => requiredChecked[d],
    ).join("");
    if (requiredDigits) {
      parts.push(`req${requiredDigits}`);
    }
    if (!includeOneCounts) {
      parts.push("no1counts");
    }
    return {
      svgNameFor: (local: string) => {
        const prefix = categoryByLocal.get(local);
        return prefix ? `${prefix}--${local}` : local;
      },
      filename: `${parts.join("-")}.zip`,
    };
  }, [groups, selectedSet, allowedChecked, requiredChecked, includeOneCounts]);

  // Applies a set preset to all filters at once. Clicking the active set again
  // clears the selection (reverting to the combo-box filters).
  function applySet(config: SetConfig) {
    if (selectedSet === config.id) {
      setSelectedSet(null);
      return;
    }
    setAllowedChecked(config.allowed);
    setRequiredChecked(DEFAULT_REQUIRED);
    setIncludeOneCounts(config.includeOneCounts);
    setSelectedSet(config.id);
  }

  function toggleAllowed(digit: PuzzleThrowDigit) {
    setAllowedChecked((prev) => ({ ...prev, [digit]: !prev[digit] }));
  }

  function toggleRequired(digit: PuzzleThrowDigit) {
    setRequiredChecked((prev) => ({ ...prev, [digit]: !prev[digit] }));
  }

  function toggleIncludeOneCounts() {
    setIncludeOneCounts((prev) => !prev);
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
          <span className="puzzle-bulk-export__filters-label">Set:</span>
          <div className="puzzle-bulk-export__segmented" role="group">
            {SET_CONFIGS.map((config) => (
              <button
                key={config.id}
                type="button"
                className={
                  "puzzle-bulk-export__segment" +
                  (selectedSet === config.id
                    ? " puzzle-bulk-export__segment--active"
                    : "")
                }
                aria-pressed={selectedSet === config.id}
                onClick={() => applySet(config)}
              >
                <DifficultyHexagons
                  difficulty={config.difficulty}
                  className="puzzle-bulk-export__segment-hex"
                />
                {config.label}
              </button>
            ))}
          </div>
        </div>

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
              onChange={toggleIncludeOneCounts}
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
                          <span className="puzzle-bulk-export__item-hex">
                            <DifficultyHexagons
                              difficulty={classifyDifficulty(local)}
                            />
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
