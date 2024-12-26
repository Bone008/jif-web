import { MathJax } from "better-react-mathjax";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { JIF } from "../jif/jif";
import { FullJIF, FullThrow, loadWithDefaults } from "../jif/jif_loader";
import { getThrowsTable, ThrowsTableData } from "../jif/orbits";
import {
  DATA_3_COUNT_PASSING,
  DATA_3_COUNT_PASSING_2X,
  DATA_4_COUNT_PASSING,
  DATA_4_COUNT_PASSING_2X,
  DATA_5_COUNT_POPCORN,
  DATA_HOLY_GRAIL,
  DATA_WALKING_FEED_10C,
  DATA_WALKING_FEED_9C,
  DATA_WALKING_FEED_9C_2X,
  DATA_WEIRD_PASSING,
} from "../jif/test_data";
import "./OrbitsCalculator.scss";

const ALL_PRESETS: [string, object][] = [
  ["3-count", DATA_3_COUNT_PASSING],
  ["3-count 2x", DATA_3_COUNT_PASSING_2X],
  ["4-count", DATA_4_COUNT_PASSING],
  ["4-count 2x", DATA_4_COUNT_PASSING_2X],
  ["Walking feed 9c", DATA_WALKING_FEED_9C],
  ["Walking feed 9c 2x", DATA_WALKING_FEED_9C_2X],
  ["Walking feed 10c", DATA_WALKING_FEED_10C],
  ["5-count popcorn", DATA_5_COUNT_POPCORN],
  ["Holy Grail", DATA_HOLY_GRAIL],
  ["Weird passing", DATA_WEIRD_PASSING],
];
const ALL_PRESET_STRINGS = ALL_PRESETS.map(([label, obj]) => [
  label,
  JSON.stringify(obj, null, 2),
]);

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
            {ALL_PRESETS.map(([label], i) => (
              <option key={i} value={i}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </p>
      <textarea
        value={jifInput}
        onChange={(e) => setJifInput(e.target.value)}
        placeholder="Enter JIF ..."
        rows={6}
        style={{ width: "100%", resize: "vertical" }}
      ></textarea>
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
          {throws[0].map((_, i) => (
            <th key={i}>{i + 1}</th>
          ))}
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
          <td colSpan={throws[0].length + 2}></td>
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
    jif = JSON.parse(value);
  } catch (e) {
    return { error: String(e) };
  }

  const fullJif = loadWithDefaults(jif);
  return { jif: fullJif, throwsTable: getThrowsTable(fullJif) };
}
