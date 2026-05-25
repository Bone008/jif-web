import { readFileSync, writeFileSync } from "fs";

// Renormalize a list of siteswap patterns by choosing, for each pattern, the
// cyclic rotation whose comparison key is lexicographically maximal. The
// comparison key treats 8 as equivalent to 2 and a (= 10) as equivalent to 4.

const inputFile = process.argv[2] || "src/data/P6.txt";
const outputFile = process.argv[3] || inputFile;

function substitute(c: string): string {
  if (c === "8") return "2";
  if (c === "a") return "4";
  return c;
}

function comparisonKey(s: string): string {
  return s.split("").map(substitute).join("");
}

function lexMaxRotation(pattern: string): string {
  const n = pattern.length;
  let best = pattern;
  let bestKey = comparisonKey(pattern);
  // Rotate by shifting the last char to the front, i times.
  for (let i = 1; i < n; i++) {
    const rotated = pattern.slice(n - i) + pattern.slice(0, n - i);
    const k = comparisonKey(rotated);
    if (k > bestKey || (k === bestKey && rotated > best)) {
      best = rotated;
      bestKey = k;
    }
  }
  return best;
}

const lines = readFileSync(inputFile, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

const rotated = lines.map(lexMaxRotation);
rotated.sort((a, b) => {
  const ka = comparisonKey(a);
  const kb = comparisonKey(b);
  if (ka !== kb) return ka < kb ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
});

writeFileSync(outputFile, rotated.join("\n") + "\n");
console.log(`Renormalized ${rotated.length} patterns -> ${outputFile}`);
