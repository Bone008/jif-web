import { MathJaxContext } from "better-react-mathjax";
import { OrbitsCalculator } from "./components/OrbitsCalculator";

export function App() {
  return (
    <MathJaxContext>
      <OrbitsCalculator />
    </MathJaxContext>
  );
}
