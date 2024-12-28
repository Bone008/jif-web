import { MathJaxContext } from "better-react-mathjax";
import { OrbitsCalculator } from "./components/OrbitsCalculator";
import { ViewSettingsContextProvider } from "./components/ViewSettings";

export function App() {
  return (
    <MathJaxContext>
      <ViewSettingsContextProvider>
        <OrbitsCalculator />
      </ViewSettingsContextProvider>
    </MathJaxContext>
  );
}
