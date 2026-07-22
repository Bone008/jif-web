import { useMemo, useState } from "react";
import { useSearchParams } from "../hooks/useSearchParams";
import { siteswapToJIF } from "../jif/high_level_converter";
import { FullJIF, loadWithDefaults } from "../jif/jif_loader";
import {
  combineLocalsToGlobal,
  interleaveLocalSiteswap,
} from "../jif/local_pattern";
import {
  getThrowsTableByJuggler,
  getThrowsTableByLimb,
  ThrowsTableData,
} from "../jif/orbits";
import { InterfaceJaggedPiece } from "./InterfaceJaggedPiece";
import "./PuzzlePage.scss";
import { PuzzleBulkExport } from "./PuzzleBulkExport";
import { ThrowsTable } from "./ThrowsTable";
import { useViewSettings, ViewSettingsControls } from "./ViewSettings";

const PA_PARAM = "pa";
const PB_PARAM = "pb";

interface BuiltLocal {
  jif: FullJIF;
  error?: undefined;
}
interface BuiltLocalError {
  jif?: undefined;
  error: string;
}
type BuiltResult = BuiltLocal | BuiltLocalError;

export function PuzzlePage() {
  const search = useSearchParams();
  const localA = normalizeLocal(search.get(PA_PARAM) ?? "");
  const localB = normalizeLocal(search.get(PB_PARAM) ?? "");
  const setLocalA = (value: string) => {
    const v = normalizeLocal(value);
    if (v) search.set(PA_PARAM, v, true);
    else search.delete(PA_PARAM);
  };
  const setLocalB = (value: string) => {
    const v = normalizeLocal(value);
    if (v) search.set(PB_PARAM, v, true);
    else search.delete(PB_PARAM);
  };
  const [doubled, setDoubled] = useState(true);
  const { viewSettings } = useViewSettings();

  const combined = useMemo(() => {
    if (!localA || !localB) return null;
    return combineLocalsToGlobal(localA, localB);
  }, [localA, localB]);

  const globalResult = useMemo(() => {
    if (!combined) return null;
    return buildGlobalJif(combined.global, doubled, viewSettings.isLimbsTable);
  }, [combined, doubled, viewSettings.isLimbsTable]);

  const aResult = useMemo(
    () => buildLocalJif(localA, doubled),
    [localA, doubled],
  );
  const bResult = useMemo(
    () => buildLocalJif(localB, doubled),
    [localB, doubled],
  );

  const showError =
    !!localA &&
    !!localB &&
    localA.length !== localB.length &&
    "Juggler A and B must have the same length.";
  const noValidGlobal =
    !!localA &&
    !!localB &&
    localA.length === localB.length &&
    combined === null &&
    "No rotation of A and B produces a valid global siteswap.";

  return (
    <div className="puzzle-page">
      <div className="pageHeader">
        <div>
          <h1>Puzzle Pieces</h1>
          <p className="subtitle">
            Pair two local siteswaps and inspect the resulting puzzle pieces.
          </p>
        </div>
        <a
          href="?"
          className="button pageHeader__puzzle-link"
          title="Back to the main pattern visualizer"
        >
          <span className="pageHeader__puzzle-icon">←</span>
          <span className="pageHeader__puzzle-label">Back to main</span>
        </a>
      </div>

      <div className="card stretch puzzle-page__editor">
        <div className="puzzle-page__inputs">
          <label className="puzzle-page__input-label">
            <span className="label-text">Juggler A</span>
            <input
              type="text"
              value={localA}
              onChange={(e) => setLocalA(e.target.value)}
              placeholder="e.g. 788"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className="puzzle-page__input-label">
            <span className="label-text">Juggler B</span>
            <input
              type="text"
              value={localB}
              onChange={(e) => setLocalB(e.target.value)}
              placeholder="e.g. 766"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className="puzzle-page__doubled-label">
            <input
              type="checkbox"
              checked={doubled}
              onChange={(e) => setDoubled(e.target.checked)}
            />
            <span>Repeat twice</span>
          </label>
        </div>

        {combined && (
          <>
            <div className="puzzle-page__global">
              <span className="label-text">Global siteswap:</span>
              <code>{combined.global}</code>
              {combined.rotationOfB > 0 && (
                <span className="puzzle-page__rotation-note">
                  (B rotated by {combined.rotationOfB} beat
                  {combined.rotationOfB === 1 ? "" : "s"})
                </span>
              )}
            </div>
            <div className="puzzle-page__global">
              <a
                href={`https://passist.org/siteswap/${combined.global}?jugglers=2`}
                target="_blank"
                rel="noopener noreferrer"
                className="puzzle-piece-download__button"
              >
                Open in Passist
              </a>
            </div>
          </>
        )}
      </div>

      {(aResult?.jif || bResult?.jif) && (
        <div className="card start">
          <h3>Interface Puzzle Pieces</h3>
          <div>
            {aResult?.jif && (
              <InterfaceJaggedPiece jif={aResult.jif} juggler={0} />
            )}
            {bResult?.jif && (
              <InterfaceJaggedPiece
                jif={bResult.jif}
                juggler={0}
                beatShift={
                  combined && localA.length === localB.length
                    ? 1 +
                      2 *
                        ((localA.length - combined.rotationOfB) % localA.length)
                    : aResult?.jif
                      ? 1
                      : 0
                }
              />
            )}
          </div>
        </div>
      )}

      {showError && (
        <div className="card error-card">
          <span className="error-card__icon">!</span>
          <p className="error-card__message">{showError}</p>
        </div>
      )}
      {noValidGlobal && (
        <div className="card error-card">
          <span className="error-card__icon">!</span>
          <p className="error-card__message">{noValidGlobal}</p>
        </div>
      )}
      {globalResult && "error" in globalResult && (
        <div className="card error-card">
          <span className="error-card__icon">!</span>
          <p className="error-card__message">{globalResult.error}</p>
        </div>
      )}

      {globalResult && "jif" in globalResult && (
        <div className="card start">
          <ViewSettingsControls />
          <ThrowsTable
            jif={globalResult.jif}
            throws={globalResult.throwsTable}
            isLimbsTable={viewSettings.isLimbsTable}
          />
        </div>
      )}

      <div className="card start">
        <PuzzleBulkExport onAssignA={setLocalA} onAssignB={setLocalB} />
      </div>
    </div>
  );
}

function buildLocalJif(local: string, doubled: boolean): BuiltResult | null {
  if (local.length === 0) return null;
  try {
    const interleaved = interleaveLocalSiteswap(local);
    const siteswap = doubled ? interleaved + interleaved : interleaved;
    return { jif: loadWithDefaults(siteswapToJIF(siteswap, 2)) };
  } catch (e) {
    return { error: String(e) };
  }
}

function buildGlobalJif(
  global: string,
  doubled: boolean,
  isLimbsTable: boolean,
): { jif: FullJIF; throwsTable: ThrowsTableData } | { error: string } {
  try {
    const siteswap = doubled ? global + global : global;
    const jif = loadWithDefaults(siteswapToJIF(siteswap, 2));
    const throwsTable = isLimbsTable
      ? getThrowsTableByLimb(jif)
      : getThrowsTableByJuggler(jif);
    return { jif, throwsTable };
  } catch (e) {
    return { error: String(e) };
  }
}

function normalizeLocal(value: string): string {
  return value.trim().toLowerCase();
}
