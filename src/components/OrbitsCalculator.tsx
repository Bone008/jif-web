import { useMemo, useState } from "react";
import { parseManipulator, prechacToJif } from "../jif/high_level_converter";
import { JIF } from "../jif/jif";
import {
  FullJIF,
  FullThrow,
  inferPeriod,
  loadWithDefaults,
} from "../jif/jif_loader";
import {
  addManipulator,
  getThrowFromJuggler,
  ManipulatorInstruction,
} from "../jif/manipulation";
import { getThrowsTable, ThrowsTableData } from "../jif/orbits";
import {
  DATA_5_COUNT_POPCORN,
  DATA_HOLY_GRAIL,
  RAW_DATA_3_COUNT_PASSING,
  RAW_DATA_3_COUNT_PASSING_2X,
  RAW_DATA_4_COUNT_PASSING,
  RAW_DATA_4_COUNT_PASSING_2X,
  RAW_DATA_WALKING_FEED_10C,
  RAW_DATA_WALKING_FEED_9C,
  RAW_DATA_WALKING_FEED_9C_2X,
} from "../jif/test_data";
import "./OrbitsCalculator.scss";
import { ThrowsTable } from "./ThrowsTable";

const ALL_PRESET_STRINGS: [string, string][] = [
  ["3-count", RAW_DATA_3_COUNT_PASSING.join("\n")],
  ["3-count 2x", RAW_DATA_3_COUNT_PASSING_2X.join("\n")],
  ["4-count", RAW_DATA_4_COUNT_PASSING.join("\n")],
  ["4-count 2x", RAW_DATA_4_COUNT_PASSING_2X.join("\n")],
  ["Walking feed 9c", RAW_DATA_WALKING_FEED_9C.join("\n")],
  ["Walking feed 9c 2x", RAW_DATA_WALKING_FEED_9C_2X.join("\n")],
  ["Walking feed 10c", RAW_DATA_WALKING_FEED_10C.join("\n")],
  ["5-count popcorn", JSON.stringify(DATA_5_COUNT_POPCORN, null, 2)],
  ["Holy Grail", JSON.stringify(DATA_HOLY_GRAIL, null, 2)],
];

export function OrbitsCalculator() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [jifInput, setJifInput] = useState<string>(
    ALL_PRESET_STRINGS[presetIndex][1],
  );
  const {
    error: jifError,
    jif,
    throwsTable,
  } = useMemo(() => processInput(jifInput), [jifInput]);

  const [manipulationInput, setManipulationInput] = useState<string>("");
  const {
    error: manipulationError,
    manipulators,
    formattedManipulators,
  } = useMemo(
    () => (jif ? processManipulationInput(manipulationInput, jif) : {}),
    [jif, manipulationInput],
  );

  const {
    error: applyManipulatorsError,
    jif: jifWithManipulation,
    throwsTable: throwsTableWithManipulation,
  } = useMemo(
    () => (jif && manipulators ? applyManipulators(jif, manipulators) : {}),
    [jif, manipulators],
  );

  function updatePreset(value: number) {
    setPresetIndex(value);
    setJifInput(ALL_PRESET_STRINGS[value][1]);
  }

  return (
    <>
      <h1>Orbits Calculator</h1>
      <div className="card stretch">
        <p>
          <label>
            Preset:&nbsp;&nbsp;
            <select
              value={presetIndex}
              onChange={(e) => updatePreset(Number(e.target.value))}
            >
              {ALL_PRESET_STRINGS.map(([label], i) => (
                <option key={i} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </p>
        <label>
          Enter social siteswap or JIF:
          <textarea
            value={jifInput}
            onChange={(e) => setJifInput(e.target.value)}
            placeholder=""
            rows={6}
            style={{ width: "100%", resize: "vertical" }}
          ></textarea>
        </label>
        <label>
          Enter manipulator instructions (without carry):
          <textarea
            value={manipulationInput}
            onChange={(e) => setManipulationInput(e.target.value)}
            placeholder=""
            rows={2}
            style={{ width: "100%", resize: "vertical" }}
          ></textarea>
        </label>
      </div>

      {jifError && <p className="card error">{jifError}</p>}
      {manipulationError && <p className="card error">{manipulationError}</p>}
      {applyManipulatorsError && (
        <p className="card error">{applyManipulatorsError}</p>
      )}

      {jif && throwsTable && (
        <div className="card">
          <ThrowsTable
            jif={jif}
            throws={throwsTable}
            formattedManipulators={formattedManipulators}
          />
        </div>
      )}
      {manipulators?.length !== 0 &&
        jifWithManipulation &&
        throwsTableWithManipulation && (
          <div className="card">
            <h3>With Manipulation Applied</h3>
            <ThrowsTable
              jif={jifWithManipulation}
              throws={throwsTableWithManipulation}
            />
          </div>
        )}
    </>
  );
}

function processInput(jifInput: string): {
  error?: string;
  jif?: FullJIF;
  throwsTable?: ThrowsTableData;
} {
  let jif: JIF;
  try {
    if (jifInput.startsWith("{")) {
      jif = JSON.parse(jifInput);
    } else {
      jif = prechacToJif(getCleanedLines(jifInput));
    }

    const fullJif = loadWithDefaults(jif);
    return { jif: fullJif, throwsTable: getThrowsTable(fullJif) };
  } catch (e) {
    return { error: String(e) };
  }
}

function processManipulationInput(
  manipulationInput: string,
  jif: FullJIF,
): {
  error?: string;
  manipulators?: ManipulatorInstruction[][];
  formattedManipulators?: string[][];
} {
  const lines = getCleanedLines(manipulationInput);
  try {
    const manipulators = lines.map(parseManipulator);
    const formattedManipulators = manipulators.map((spec) =>
      formatManipulator(jif, spec),
    );
    return { manipulators, formattedManipulators };
  } catch (e) {
    return { error: String(e) };
  }
}

function applyManipulators(
  jif: FullJIF,
  manipulators: ManipulatorInstruction[][],
): {
  error?: string;
  jif?: FullJIF;
  throwsTable?: ThrowsTableData;
} {
  try {
    let jifWithManipulation = jif;
    for (const manipulator of manipulators) {
      jifWithManipulation = addManipulator(jifWithManipulation, manipulator);
    }

    return {
      jif: jifWithManipulation,
      throwsTable: getThrowsTable(jifWithManipulation),
    };
  } catch (e) {
    return { error: String(e) };
  }
}

function formatManipulator(
  jif: FullJIF,
  spec: ManipulatorInstruction[],
): string[] {
  const period = inferPeriod(jif);
  const result: string[] = Array(period).fill("-");
  for (const { type, throwTime, throwFromJuggler } of spec) {
    const thrw = getThrowFromJuggler(
      jif,
      throwFromJuggler,
      throwTime,
    ) as FullThrow;
    if (!thrw) {
      throw new Error(
        `Could not find throw for manipulation at beat ${throwTime + 1} from juggler ${throwFromJuggler}!`,
      );
    }
    const source = jif.jugglers[jif.limbs[thrw.from].juggler].label;
    const destination = jif.jugglers[jif.limbs[thrw.to].juggler].label;
    const letter =
      type === "substitute" ? "S" : type === "intercept1b" ? "I" : "Ii";
    result[throwTime] = `${letter}^{${source}}_{${destination}}`;
  }
  return result;
}

function getCleanedLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim().replace(/[^\w\s:-]/g, ""))
    .filter((line) => line.length > 0);
}
