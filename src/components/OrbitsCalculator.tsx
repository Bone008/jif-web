import { useMemo, useState } from "react";
import {
  parseManipulator,
  prechacToJif,
  siteswapToJIF,
} from "../jif/high_level_converter";
import { JIF } from "../jif/jif";
import _ from "lodash";
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
import { ALL_PRESETS } from "../jif/presets";
import "./OrbitsCalculator.scss";
import { FormattedManipulatorInstruction, ThrowsTable } from "./ThrowsTable";
import { ViewSettingsControls } from "./ViewSettings";

export function OrbitsCalculator() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [jifInput, setJifInput] = useState<string>(
    ALL_PRESETS[presetIndex].instructions,
  );
  const [disabledInstructions, setDisabledInstructions] = useState<boolean[][]>(
    [],
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
    () =>
      jif
        ? processManipulationInput(manipulationInput, disabledInstructions, jif)
        : {},
    [jif, manipulationInput, disabledInstructions],
  );

  const {
    error: applyManipulatorsError,
    jif: jifWithManipulation,
    throwsTable: throwsTableWithManipulation,
  } = useMemo(
    () =>
      jif && manipulators
        ? applyManipulators(jif, manipulators, disabledInstructions)
        : {},
    [jif, manipulators, disabledInstructions],
  );

  function updatePreset(value: number) {
    setPresetIndex(value);
    setJifInput(ALL_PRESETS[value].instructions);
    setManipulationInput(ALL_PRESETS[value].manipulators?.join("\n") ?? "");
    setDisabledInstructions([]);
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
              {ALL_PRESETS.map((preset, i) => (
                <option key={i} value={i}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
        </p>
        <div style={{ display: "flex", gap: "0.5em" }}>
          <label style={{ flexGrow: 2 }}>
            <div>Enter social siteswap, 4-handed siteswap, or JIF:</div>
            <textarea
              value={jifInput}
              onChange={(e) => setJifInput(e.target.value)}
              placeholder=""
              rows={6}
              style={{ width: "100%", resize: "vertical" }}
            ></textarea>
          </label>
          <label
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>Full JIF:</div>
            <textarea
              value={JSON.stringify(jifWithManipulation, null, 2)}
              readOnly
              style={{
                width: "100%",
                flexGrow: 1,
                fontSize: "80%",
                background: "lightgray",
              }}
            />
          </label>
        </div>
        <label>
          Enter manipulator instructions (without carry, with <b>source</b>{" "}
          juggler label):
          <textarea
            value={manipulationInput}
            onChange={(e) => setManipulationInput(e.target.value)}
            placeholder=""
            rows={2}
            style={{ width: "100%", resize: "vertical" }}
          ></textarea>
        </label>
        <ViewSettingsControls />
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
            manipulationOptions={
              formattedManipulators
                ? {
                    formattedManipulators,
                    onSetInstructionDisabled: (m, i, disabled) => {
                      const newDisabledInstructions =
                        _.cloneDeep(disabledInstructions);
                      newDisabledInstructions[m] =
                        newDisabledInstructions[m] ?? [];
                      newDisabledInstructions[m][i] = disabled;
                      setDisabledInstructions(newDisabledInstructions);
                    },
                  }
                : undefined
            }
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
    } else if (!jifInput.match(/\s/)) {
      jif = siteswapToJIF(jifInput, 2);
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
  disabledInstructions: boolean[][],
  jif: FullJIF,
): {
  error?: string;
  manipulators?: ManipulatorInstruction[][];
  formattedManipulators?: FormattedManipulatorInstruction[][];
} {
  const lines = getCleanedLines(manipulationInput);
  try {
    const manipulators = lines.map(parseManipulator);
    const formattedManipulators = manipulators.map((spec, m) =>
      formatManipulator(jif, spec, disabledInstructions[m] ?? []),
    );
    return { manipulators, formattedManipulators };
  } catch (e) {
    console.error(e);
    return { error: String(e) };
  }
}

function applyManipulators(
  jif: FullJIF,
  manipulators: ManipulatorInstruction[][],
  disabledInstructions: boolean[][],
): {
  error?: string;
  jif?: FullJIF;
  throwsTable?: ThrowsTableData;
} {
  try {
    let jifWithManipulation = jif;
    for (let m = 0; m < manipulators.length; m++) {
      const manipulator = manipulators[m];
      // Strip out disabled instructions.
      const disabledLine = disabledInstructions[m] ?? [];
      const activeManipulator = manipulator.filter((_, i) => !disabledLine[i]);

      jifWithManipulation = addManipulator(
        jifWithManipulation,
        activeManipulator,
      );
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
  disabledInstructions: boolean[],
): FormattedManipulatorInstruction[] {
  const period = inferPeriod(jif);
  const result: FormattedManipulatorInstruction[] = Array.from(
    { length: period },
    () => ({ label: "-" }),
  );
  for (const [i, { type, throwTime, throwFromJuggler }] of spec.entries()) {
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
    result[throwTime] = {
      label: `${letter}^{${source}}_{${destination}}`,
      disabled: disabledInstructions[i],
      originalIndex: i,
    };
  }
  return result;
}

function getCleanedLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim().replace(/[^\w\s:-]/g, ""))
    .filter((line) => line.length > 0);
}
