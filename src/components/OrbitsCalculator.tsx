import _ from "lodash";
import { useMemo, useState } from "react";
import { useEmbedMode } from "../hooks/useEmbedMode";
import { useSearchParams } from "../hooks/useSearchParams";
import {
  parseManipulator,
  prechacToJif,
  siteswapToJIF,
} from "../jif/high_level_converter";
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
import { getThrowsTable, ThrowsTableData, wrapAround } from "../jif/orbits";
import {
  ALL_PRESETS,
  findPresetByName,
  Preset,
  sanitizePresetName,
} from "../jif/presets";
import { CollapsibleTile } from "./CollapsibleTile";
import { EmbedLink } from "./EmbedLink";
import "./OrbitsCalculator.scss";
import { FormattedManipulatorInstruction, ThrowsTable } from "./ThrowsTable";
import { ViewSettingsControls } from "./ViewSettings";

const PRESET_NAME_PARAM = "pattern";
const INSTRUCTIONS_PARAM = "q";
const MANIPULATION_PARAM = "m";

type HeaderDisplayState = "embed" | "compact" | "full";

export function OrbitsCalculator() {
  const search = useSearchParams();
  const isEmbed = useEmbedMode();

  const presetSearchName = search.get(PRESET_NAME_PARAM);
  const preset = findPresetByName(presetSearchName ?? "");
  const jifInput = search.get(INSTRUCTIONS_PARAM) ?? preset?.instructions ?? "";
  const manipulationInput =
    search.get(MANIPULATION_PARAM) ?? preset?.manipulators?.join("\n") ?? "";

  function setPreset(newPreset: Preset | null) {
    if (newPreset === preset) {
      return;
    }

    if (newPreset) {
      search.setAll({
        [PRESET_NAME_PARAM]: sanitizePresetName(newPreset.name),
        [INSTRUCTIONS_PARAM]: null,
        [MANIPULATION_PARAM]: null,
      });
    } else {
      // When setting to "custom", fill in the inputs with the preset values.
      search.setAll({
        [PRESET_NAME_PARAM]: null,
        [INSTRUCTIONS_PARAM]: preset!.instructions,
        [MANIPULATION_PARAM]: preset!.manipulators?.join("\n") ?? null,
      });
    }
  }

  function setJifInput(value: string | null) {
    if (value) {
      setPreset(null);
      search.set(INSTRUCTIONS_PARAM, value, true);
    } else {
      search.delete(INSTRUCTIONS_PARAM);
    }
  }

  function setManipulationInput(value: string | null) {
    if (value) {
      setPreset(null);
      search.set(MANIPULATION_PARAM, value, true);
    } else {
      search.delete(MANIPULATION_PARAM);
    }
  }

  const [disabledInstructions, setDisabledInstructions] = useState<boolean[][]>(
    [],
  );
  const {
    error: jifError,
    jif,
    throwsTable,
  } = useMemo(() => processInput(jifInput), [jifInput]);

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

  function updatePreset(name: string) {
    const newPreset = findPresetByName(name);
    setPreset(newPreset);
    setDisabledInstructions([]);
  }

  // TODO: move header to a separate component
  const [headerDisplayState, setHeaderDisplayState] =
    useState<HeaderDisplayState>(
      isEmbed ? "embed" : preset !== null ? "compact" : "full",
    );

  return (
    <>
      <div className="pageHeader">
        <h1>Passing Pattern Notations</h1>
        <EmbedLink />
      </div>
      {headerDisplayState === "embed" && (
        <CollapsibleTile>
          <ViewSettingsControls />
        </CollapsibleTile>
      )}
      {headerDisplayState === "compact" && (
        <div className="card stretch">
          <div style={{ display: "flex", gap: "2em" }}>
            <h2 style={{ margin: 0 }}>{preset?.name ?? "Unnamed pattern"}</h2>
            <button type="button" onClick={() => setHeaderDisplayState("full")}>
              Edit
            </button>
          </div>
          <ViewSettingsControls style={{ marginTop: "1rem" }} />
        </div>
      )}
      {headerDisplayState === "full" && (
        <div className="card stretch">
          <p style={{ display: "flex" }}>
            <label style={{ flexGrow: 1 }}>
              Select preset:&nbsp;&nbsp;
              <select
                value={preset ? sanitizePresetName(preset.name) : "custom"}
                onChange={(e) => updatePreset(e.target.value)}
              >
                {ALL_PRESETS.map((preset, i) => (
                  <option key={i} value={sanitizePresetName(preset.name)}>
                    {preset.name}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setHeaderDisplayState("compact")}
            >
              Hide
            </button>
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
            Enter manipulator instructions (with <b>source</b> juggler label,{" "}
            <code>i</code> = intercept with 2-beat carry, <code>i1</code> = with
            1-beat carry):
            <textarea
              value={manipulationInput}
              onChange={(e) => setManipulationInput(e.target.value)}
              placeholder=""
              rows={2}
              style={{ width: "100%", resize: "vertical" }}
            ></textarea>
          </label>
          <ViewSettingsControls style={{ marginTop: "1.5rem" }} />
        </div>
      )}

      {jifError && <p className="card error">{jifError}</p>}
      {manipulationError && <p className="card error">{manipulationError}</p>}
      {applyManipulatorsError && (
        <p className="card error">{applyManipulatorsError}</p>
      )}

      {jif && throwsTable && (
        <div className="card start">
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
          <div className="card start">
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

  function markThrow(thrw: FullThrow, letter: string, i: number) {
    const source = jif.jugglers[jif.limbs[thrw.from].juggler].label;
    const destination = jif.jugglers[jif.limbs[thrw.to].juggler].label;
    result[thrw.time] = {
      label: `${letter}^{${source}}_{${destination}}`,
      disabled: disabledInstructions[i],
      originalIndex: i,
    };
  }

  for (const [i, instruction] of spec.entries()) {
    const { type, throwTime, throwFromJuggler } = instruction;
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
    const letter = type === "substitute" ? "S" : "I";
    markThrow(thrw, letter, i);

    if (type !== "substitute") {
      const carryThrow = calculateTheCarry(jif, instruction);
      markThrow(carryThrow, "C", i);
    }
  }
  return result;
}

// TODO: Remove this hard-coded workaround once carries are generalized.
function calculateTheCarry(
  jif: FullJIF,
  intercept: ManipulatorInstruction,
): FullThrow {
  const numThrowsLater = intercept.type === "intercept1b" ? 1 : 2;
  const causalBeats = 2; // TODO: hardcoded assumption of sync pattern

  const throwsTable = getThrowsTable(jif);
  // Follow the causal chain of arrows to identify the throw that is being carried.
  let time = intercept.throwTime;
  let throwingJuggler = intercept.throwFromJuggler;
  let thrw: FullThrow | null = null;
  // Loop N+1 times, since N=0 just resolves the intercepted throw itself.
  for (let i = 0; i <= numThrowsLater; i++) {
    thrw = throwsTable[throwingJuggler][time];
    if (!thrw) {
      throw new Error(
        `Could not find throw for manipulation at beat ${time + 1} from juggler ${throwingJuggler}!`,
      );
    }
    time += thrw.duration - causalBeats;
    throwingJuggler = jif.limbs[thrw.to].juggler;
    [time, throwingJuggler] = wrapAround(time, throwingJuggler, jif);
  }

  return thrw!;
}

function getCleanedLines(value: string) {
  // Split by newline, trim whitespace, remove non-alphanumeric characters.
  return value
    .split("\n")
    .map((line) => line.trim().replace(/[^\w\s:\->]/g, ""))
    .filter((line) => line.length > 0);
}
