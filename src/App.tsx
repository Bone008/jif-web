import { MathJaxContext } from "better-react-mathjax";
import { useEffect } from "react";
import { OrbitsCalculator } from "./components/OrbitsCalculator";
import { ViewSettingsContainer } from "./components/ViewSettings";
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
      <ViewSettingsContainer.Provider>
        <OrbitsCalculator />
      </ViewSettingsContainer.Provider>
    </MathJaxContext>
  );
}
