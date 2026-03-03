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
  onSelectPreset,
  allowCustom,
  ...props
}: {
  selectedPreset: Preset | null;
  categoryFilter: Category | null;
  onSelectPreset: (presetSlug: string) => void;
  allowCustom: boolean;
} & React.HTMLAttributes<HTMLLabelElement>) {
  const value = selectedPreset ? getPresetSlug(selectedPreset) : "";

  function renderPresets(presets: Preset[]) {
    return presets.map((p) => (
      <option key={getPresetSlug(p)} value={getPresetSlug(p)}>
        {p.name}
      </option>
    ));
  }

  return (
    <label className="editor-card__preset-selector" {...props}>
      <span className="label-text">
        {categoryFilter ? `Select ${categoryFilter.name}` : "Select pattern"}
      </span>
      <select
        value={allowCustom && !selectedPreset ? "custom" : value}
        onChange={(e) => onSelectPreset(e.target.value)}
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
          : Object.entries(ALL_PRESETS_BY_CATEGORY).map(
              ([category, presets]) => (
                <optgroup key={category} label={category}>
                  {renderPresets(presets)}
                </optgroup>
              ),
            )}
      </select>
    </label>
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
  const jifInput =
    search.get(INSTRUCTIONS_PARAM) ?? preset?.instructions.join("\n") ?? "";
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
        [INSTRUCTIONS_PARAM]: preset!.instructions.join("\n"),
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
  const [showJifOutput, setShowJifOutput] = useState(false);
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
        <div>
          <h1>Passing Pattern Notations</h1>
          <p className="subtitle">Visualize juggling passing patterns</p>
        </div>
        <EmbedLink />
      </div>
      {headerDisplayState === "embed" && (
        <>
          <CollapsibleTile>
            <ViewSettingsControls
              hasManipulator={!!manipulators && manipulators.length > 0}
            />
          </CollapsibleTile>
          {categoryFilter !== null && (
            <div className="card stretch">
              <PresetSelector
                selectedPreset={preset}
                categoryFilter={categoryFilter}
                onSelectPreset={updatePreset}
                allowCustom={false}
              />
            </div>
          )}
          {preset?.warningNote && (
            <div className="card">
              <div className="warningNote">{preset.warningNote}</div>
            </div>
          )}
        </>
      )}
      {headerDisplayState === "compact" && (
        <div className="card stretch">
          <div className="compact-header">
            <h2 className="compact-header__title">
              {preset?.name ?? "Unnamed pattern"}
            </h2>
            <button type="button" onClick={() => setHeaderDisplayState("full")}>
              Edit pattern
            </button>
          </div>
          {preset?.warningNote && (
            <div className="warningNote">{preset.warningNote}</div>
          )}
          <ViewSettingsControls
            style={{ marginTop: "1rem" }}
            hasManipulator={!!manipulators && manipulators.length > 0}
          />
        </div>
      )}
      {headerDisplayState === "full" && (
        <div className="card stretch editor-card">
          <div className="editor-card__top-row">
            <PresetSelector
              selectedPreset={preset}
              categoryFilter={categoryFilter}
              onSelectPreset={updatePreset}
              allowCustom={true}
            />
            <button
              type="button"
              onClick={() => setHeaderDisplayState("compact")}
            >
              Hide editor
            </button>
          </div>

          <div className="editor-card__input-section">
            <label className="editor-card__pattern-label">
              <div className="label-text">Pattern notation</div>
              <div className="hint">
                e.g. &quot;3B 3 3&quot; (prechac) or &quot;77862&quot;
                (siteswap)
              </div>
              <textarea
                value={jifInput}
                onChange={(e) => setJifInput(e.target.value)}
                placeholder="3B 3 3&#10;3A 3 3"
                rows={6}
                style={{ width: "100%", resize: "vertical" }}
              ></textarea>
            </label>

            <div className="jif-toggle-section">
              <button
                type="button"
                className="jif-toggle-btn"
                onClick={() => setShowJifOutput(!showJifOutput)}
              >
                {showJifOutput ? "Hide" : "Show"} JIF output
              </button>
              {showJifOutput && (
                <textarea
                  value={JSON.stringify(jifWithManipulation, null, 2)}
                  readOnly
                  className="jif-output"
                />
              )}
            </div>
          </div>

          <label className="editor-card__manipulation-label">
            <div className="label-text">Manipulator instructions</div>
            <div className="hint">
              e.g. &quot;sA - - i2B&quot; &mdash; s = substitute, i = intercept
              (2-beat carry), i1 = 1-beat carry
            </div>
            <textarea
              value={manipulationInput}
              onChange={(e) => setManipulationInput(e.target.value)}
              placeholder="sA - - i2B"
              rows={2}
              style={{ width: "100%", resize: "vertical" }}
            ></textarea>
          </label>

          <div className="settings-section">
            <div className="settings-section__header">Display settings</div>
            <ViewSettingsControls
              hasManipulator={!!manipulators && manipulators.length > 0}
            />
          </div>
        </div>
      )}

      {preset?.warningNote && headerDisplayState === "full" && (
        <div className="card">
          <div className="warningNote">{preset.warningNote}</div>
        </div>
      )}
      {jifError && (
        <div className="card error-card">
          <span className="error-card__icon">!</span>
          <p className="error-card__message">{jifError}</p>
        </div>
      )}
      {manipulationError && (
        <div className="card error-card">
          <span className="error-card__icon">!</span>
          <p className="error-card__message">{manipulationError}</p>
        </div>
      )}
      {applyManipulatorsError && (
        <div className="card error-card">
          <span className="error-card__icon">!</span>
          <p className="error-card__message">{applyManipulatorsError}</p>
        </div>
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
      originalThrow: thrw,
      originalIndex: i,
      disabled: disabledInstructions[i],
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
