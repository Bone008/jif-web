import "./OrbitsCalculator.scss";
import { useMemo, useState } from "react";
import { JIF } from "../jif/jif";
import { FullJIF, FullThrow, loadWithDefaults } from "../jif/jif_loader";
import { getThrowsTable, ThrowsTableData } from "../jif/orbits";
import { DATA_3_COUNT_PASSING } from "../jif/test_data";
import { MathJax } from "better-react-mathjax";

export function OrbitsCalculator() {
  const defaultJif = DATA_3_COUNT_PASSING;
  const [jifInput, setJifInput] = useState<string>(JSON.stringify(defaultJif));
  const { error, jif, throwsTable } = useMemo(
    () => processInput(jifInput),
    [jifInput]
  );

  return (
    <>
      <h1>Orbits Calculator</h1>
      <textarea
        value={jifInput}
        onChange={(e) => setJifInput(e.target.value)}
        placeholder="Enter JIF ..."
        rows={6}
        style={{ width: "100%" }}
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
  const maxThrowHeight = Math.max(
    ...throws.flat().map((thrw) => thrw?.duration ?? 0)
  );
  const useLetters = maxThrowHeight == 3;

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
                  <ThrowCell jif={jif} thrw={thrw} useLetters={useLetters} />
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
  useLetters,
}: {
  jif: FullJIF;
  thrw: FullThrow;
  useLetters: boolean;
}) {
  const fromJuggler = jif.limbs[thrw.from].juggler;
  const toJuggler = jif.limbs[thrw.to].juggler;
  const isPass = fromJuggler !== toJuggler;
  let label: string;
  if (useLetters && thrw.duration === 3) {
    label = isPass ? "P" : "S";
  } else {
    label = `${thrw.duration.toString(36)}${isPass ? "p" : ""}`;
  }
  if (isPass) {
    label += "_" + jif.jugglers[toJuggler].label;
  }

  return (
    <div className="supsub">
      <MathJax>$${label}$$</MathJax>
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
