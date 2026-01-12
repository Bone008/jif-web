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
import { FullJIF, FullThrow, loadWithDefaults } from "../jif/jif_loader";
import {
  addManipulator,
  getThrowFromJuggler,
  ManipulatorInstruction,
} from "../jif/manipulation";
import {
  getThrowsTableByJuggler,
  getThrowsTableByLimb,
  ThrowsTableData,
} from "../jif/orbits";
import {
  ALL_PRESETS_BY_CATEGORY,
  Category,
  findCategoryByName,
  findPresetBySlug,
  getPresetSlug,
  Preset,
} from "../jif/presets";
import { CollapsibleTile } from "./CollapsibleTile";
import { EmbedLink } from "./EmbedLink";
import "./OrbitsCalculator.scss";
import { FormattedManipulatorInstruction, ThrowsTable } from "./ThrowsTable";
import { useViewSettings, ViewSettingsControls } from "./ViewSettings";
import { wrapJuggler } from "../jif/util";
import { InterfaceJaggedPiece } from "./InterfaceJaggedPiece";
import { CycleDisplay } from "./CycleDisplay";

const PRESET_NAME_PARAM = "pattern";
const INSTRUCTIONS_PARAM = "q";
const MANIPULATION_PARAM = "m";
const CATEGORY_FILTER_PARAM = "category";

type HeaderDisplayState = "embed" | "compact" | "full";

function PresetSelector({
  selectedPreset,
  categoryFilter,
  onChange,
  allowCustom,
}: {
  selectedPreset: Preset | null;
  categoryFilter: Category | null;
  onChange: (presetSlug: string) => void;
  allowCustom: boolean;
}) {
  const value = selectedPreset ? getPresetSlug(selectedPreset) : "";

  function renderPresets(presets: Preset[]) {
    return presets.map((p) => (
      <option key={getPresetSlug(p)} value={getPresetSlug(p)}>
        {p.name}
      </option>
    ));
  }

  return (
    <select
      value={allowCustom && !selectedPreset ? "custom" : value}
      onChange={(e) => onChange(e.target.value)}
    >
      {allowCustom ? (
        <option value="custom">Custom</option>
      ) : (
        <option value="" disabled>
          Choose a pattern ...
        </option>
      )}
      {categoryFilter
        ? renderPresets(categoryFilter.presets)
        : Object.entries(ALL_PRESETS_BY_CATEGORY).map(([category, presets]) => (
            <optgroup key={category} label={category}>
              {renderPresets(presets)}
            </optgroup>
          ))}
    </select>
  );
}

export function OrbitsCalculator() {
  const search = useSearchParams();
  const isEmbed = useEmbedMode();
  const { viewSettings } = useViewSettings();

  // Category filter (read-only from URL, not settable via UI)
  const categoryFilterParam = search.get(CATEGORY_FILTER_PARAM);
  const categoryFilter = useMemo(
    () => findCategoryByName(categoryFilterParam ?? ""),
    [categoryFilterParam],
  );

  const presetSearchName = search.get(PRESET_NAME_PARAM);
  const preset = findPresetBySlug(presetSearchName ?? "");
  const jifInput = search.get(INSTRUCTIONS_PARAM) ?? preset?.instructions ?? "";
  const manipulationInput =
    search.get(MANIPULATION_PARAM) ?? preset?.manipulators?.join("\n") ?? "";

  function setPreset(newPreset: Preset | null) {
    if (newPreset === preset) {
      return;
    }

    if (newPreset) {
      search.setAll({
        [PRESET_NAME_PARAM]: getPresetSlug(newPreset),
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
  } = useMemo(
    () => processInput(jifInput, viewSettings.isLimbsTable),
    [jifInput, viewSettings.isLimbsTable],
  );

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
        ? applyManipulators(
            jif,
            manipulators,
            disabledInstructions,
            viewSettings.isLimbsTable,
          )
        : {},
    [jif, manipulators, disabledInstructions, viewSettings.isLimbsTable],
  );

  function updatePreset(slug: string) {
    const newPreset = findPresetBySlug(slug);
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
      {categoryFilter !== null && (
        <div className="card stretch">
          <label>
            Select {categoryFilter.name} pattern:&nbsp;&nbsp;
            <PresetSelector
              selectedPreset={preset}
              categoryFilter={categoryFilter}
              onChange={updatePreset}
              allowCustom={false}
            />
          </label>
        </div>
      )}
      {headerDisplayState === "compact" && (
        <div className="card stretch">
          <div style={{ display: "flex", gap: "2em" }}>
            <h2 style={{ margin: 0 }}>{preset?.name ?? "Unnamed pattern"}</h2>
            <button type="button" onClick={() => setHeaderDisplayState("full")}>
              Edit
            </button>
          </div>
          {preset?.warningNote && (
            <div className="warningNote">{preset.warningNote}</div>
          )}
          <ViewSettingsControls style={{ marginTop: "1rem" }} />
        </div>
      )}
      {headerDisplayState === "full" && (
        <div className="card stretch">
          <p style={{ display: "flex" }}>
            <label style={{ flexGrow: 1 }}>
              {categoryFilter
                ? `Select ${categoryFilter.name} pattern:`
                : "Select preset:"}
              &nbsp;&nbsp;
              <PresetSelector
                selectedPreset={preset}
                categoryFilter={categoryFilter}
                onChange={updatePreset}
                allowCustom={true}
              />
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

      {preset?.warningNote && headerDisplayState === "full" && (
        <div className="card">
          <div className="warningNote">{preset.warningNote}</div>
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
            isLimbsTable={viewSettings.isLimbsTable}
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
          <>
            <CycleDisplay
              jif={jifWithManipulation}
              isLimbsTable={viewSettings.isLimbsTable}
            />
            <div className="card start">
              <h3>With Manipulation Applied</h3>
              <ThrowsTable
                jif={jifWithManipulation}
                throws={throwsTableWithManipulation}
                isLimbsTable={viewSettings.isLimbsTable}
              />
            </div>
          </>
        )}

      {jif?.jugglers.length === 2 &&
        jif.jugglers[0].becomes === 0 &&
        jif.jugglers[1].becomes === 1 &&
        jif.throws.length > 0 &&
        !manipulators?.length &&
        throwsTable && (
          <div className="card start">
            <h3>Interface Puzzle Pieces</h3>
            <div>
              <InterfaceJaggedPiece jif={jif} juggler={0} />
              <InterfaceJaggedPiece jif={jif} juggler={1} />
            </div>
          </div>
        )}
    </>
  );
}

function processInput(
  jifInput: string,
  isLimbsTable: boolean,
): {
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
    const throwsTable = isLimbsTable
      ? getThrowsTableByLimb(fullJif)
      : getThrowsTableByJuggler(fullJif);
    return { jif: fullJif, throwsTable };
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
  isLimbsTable: boolean,
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

    const throwsTable = isLimbsTable
      ? getThrowsTableByLimb(jifWithManipulation)
      : getThrowsTableByJuggler(jifWithManipulation);
    return {
      jif: jifWithManipulation,
      throwsTable,
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
  const result: FormattedManipulatorInstruction[] = Array.from(
    { length: jif.repetition.period },
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

  const throwsTable = getThrowsTableByJuggler(jif);
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
    [time, throwingJuggler] = wrapJuggler(time, throwingJuggler, jif);
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
