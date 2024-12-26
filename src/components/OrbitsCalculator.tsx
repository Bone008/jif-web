import { MathJax } from "better-react-mathjax";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { JIF } from "../jif/jif";
import { FullJIF, FullThrow, loadWithDefaults } from "../jif/jif_loader";
import { getThrowsTable, ThrowsTableData } from "../jif/orbits";
import {
  RAW_DATA_3_COUNT_PASSING,
  RAW_DATA_3_COUNT_PASSING_2X,
  RAW_DATA_4_COUNT_PASSING,
  RAW_DATA_4_COUNT_PASSING_2X,
  RAW_DATA_WALKING_FEED_10C,
  RAW_DATA_WALKING_FEED_9C,
  RAW_DATA_WALKING_FEED_9C_2X,
  DATA_5_COUNT_POPCORN,
  DATA_HOLY_GRAIL,
} from "../jif/test_data";
import "./OrbitsCalculator.scss";
import { prechacToJif } from "../jif/high_level_converter";

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
  const [jifInput, setJifInput] = useState<string>("");
  const { error, jif, throwsTable } = useMemo(
    () => processInput(jifInput),
    [jifInput]
  );

  useEffect(() => {
    setJifInput(ALL_PRESET_STRINGS[presetIndex][1]);
  }, [presetIndex]);

  return (
    <>
      <h1>Orbits Calculator</h1>
      <p>
        <label>
          Preset:&nbsp;&nbsp;
          <select
            value={presetIndex}
            onChange={(e) => setPresetIndex(Number(e.target.value))}
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

      {error && <p className="error">{error}</p>}
      {jif && throwsTable && <ThrowsTable jif={jif} data={throwsTable} />}
    </>
  );
}

function ThrowsTable({
  jif,
  data: throws,
}: {
  jif: FullJIF;
  data: ThrowsTableData;
}) {
  const isSynchronous = _.some(
    _.countBy(
      throws.flat().filter((thrw) => !!thrw),
      (thrw) => thrw.time
    ),
    (count) => count > 1
  );
  const maxThrowHeight = _.max(
    throws.flat().map((thrw) => thrw?.duration ?? 0)
  );
  const useLetters = isSynchronous && maxThrowHeight == 3;

  return (
    <table className="throws">
      <thead>
        <tr className="line__underline">
          <th>Beat</th>
          {throws[0]?.map((_, i) => <th key={i}>{i + 1}</th>)}
          <th></th>
        </tr>
      </thead>
      <tbody>
        {throws.map((row, j) => (
          <tr key={j}>
            <td>{jif.jugglers[j].label}</td>
            {row.map((thrw, t) => (
              <td key={t}>
                {thrw && (
                  <ThrowCell
                    jif={jif}
                    thrw={thrw}
                    isSynchronous={isSynchronous}
                    useLetters={useLetters}
                  />
                )}
              </td>
            ))}
            <td>&rarr; {jif.jugglers[jif.jugglers[j].becomes].label}</td>
          </tr>
        ))}
        <tr>
          <td colSpan={(throws[0]?.length ?? 0) + 2}></td>
        </tr>
      </tbody>
    </table>
  );
}

function ThrowCell({
  jif,
  thrw,
  isSynchronous,
  useLetters,
}: {
  jif: FullJIF;
  thrw: FullThrow;
  isSynchronous: boolean;
  useLetters: boolean;
}) {
  const fromJuggler = jif.limbs[thrw.from]?.juggler;
  const toJuggler = jif.limbs[thrw.to]?.juggler;
  const isPass = fromJuggler !== toJuggler;
  let label: string;
  if (useLetters && thrw.duration === 3) {
    label = isPass ? "P" : "S";
  } else {
    label = thrw.duration.toString(36);
    if (isPass && isSynchronous) {
      label += "p";
    }
  }
  if (isPass) {
    label += "_" + (jif.jugglers[toJuggler]?.label ?? "?");
  }

  return (
    <div className="supsub" title={JSON.stringify(thrw)}>
      {/* key is needed to avoid caching issues */}
      <MathJax key={label}>$${label}$$</MathJax>
    </div>
  );
}

function processInput(value: string): {
  error?: string;
  jif?: FullJIF;
  throwsTable?: ThrowsTableData;
} {
  let jif: JIF;
  try {
    if (value.startsWith("{")) {
      jif = JSON.parse(value);
    } else {
      jif = prechacToJif(getPrechacLines(value));
    }

    const fullJif = loadWithDefaults(jif);
    return { jif: fullJif, throwsTable: getThrowsTable(fullJif) };
  } catch (e) {
    return { error: String(e) };
  }
}

function getPrechacLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim().replace(/[^\w\s:]/g, ""))
    .filter((line) => line.length > 0);
}
