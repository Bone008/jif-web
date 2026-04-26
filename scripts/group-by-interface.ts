import { readFileSync, writeFileSync } from "fs";
import {
  fractionalClubsLabel,
  groupLocalsByInterface,
} from "../src/utils/interface_shapes.ts";

// --- main ---
const inputFile = process.argv[2] || "scripts/data/P6.txt";
const outputFile =
  process.argv[3] || inputFile.replace(/\.txt$/, "_grouped.txt");

const lines = readFileSync(inputFile, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

const groups = groupLocalsByInterface(lines);

const out: string[] = [];
for (const group of groups) {
  const localPasses = (group.shapeKey.match(/O/g) || []).length / 2;
  const frac = fractionalClubsLabel(group.locals[0]);
  out.push(`[${group.shapeKey}] (passes: ${localPasses}, clubs: ${frac})`);
  for (const ss of group.locals) {
    out.push(ss);
  }
  out.push("");
}

writeFileSync(outputFile, out.join("\n"));
console.log(
  `Grouped ${lines.length} siteswaps into ${groups.length} shapes → ${outputFile}`,
);
