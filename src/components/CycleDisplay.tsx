import "./CycleDisplay.scss";
import { FullJIF } from "../jif/jif_loader";
import { getJugglerCycle, getLimbCycle } from "../jif/cycles";

/** Shows the full cycle of roles that jugglers go through for a pattern. */
export function CycleDisplay({
  jif,
  isLimbsTable,
}: {
  jif: FullJIF;
  isLimbsTable: boolean;
}) {
  const cycle = isLimbsTable ? getLimbCycle(jif) : getJugglerCycle(jif);

  if (cycle === null) {
    // Not a full cycle, show nothing for now to keep things simple.
    return null;
  }

  return (
    <div className="card start">
      <p className="cycleText">
        Cycle:&nbsp;&nbsp;&nbsp;
        {cycle.map((label, i) => (
          <span key={i}>
            {label}
            {i < cycle.length - 1 ? <> &rarr; </> : ""}
          </span>
        ))}
      </p>
    </div>
  );
}
