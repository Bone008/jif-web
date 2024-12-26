import { useState } from "react";
import { DATA_3_COUNT_PASSING } from "./jif/test_data";

export function OrbitsCalculator() {
  const defaultJif = DATA_3_COUNT_PASSING;
  const [jifInput, setJifInput] = useState<string>(JSON.stringify(defaultJif));

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
    </>
  );
}
