import { MathJaxContext } from "better-react-mathjax";
import { OrbitsCalculator } from "./components/OrbitsCalculator";
import { ViewSettingsContextProvider } from "./components/ViewSettings";
import { useEffect } from "react";
import { useEmbedMode } from "./hooks/useEmbedMode";

export function App() {
  const isEmbed = useEmbedMode();

  useEffect(() => {
    if (isEmbed) {
      document.body.classList.add("embed");
    } else {
      document.body.classList.remove("embed");
    }
  }, [isEmbed]);

  return (
    <MathJaxContext>
      <ViewSettingsContextProvider>
        <OrbitsCalculator />
      </ViewSettingsContextProvider>
    </MathJaxContext>
  );
}
