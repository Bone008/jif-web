import { MathJaxContext } from "better-react-mathjax";
import { useLayoutEffect } from "react";
import { OrbitsCalculator } from "./components/OrbitsCalculator";
import { ViewSettingsContainer } from "./components/ViewSettings";
import { useEmbedMode } from "./hooks/useEmbedMode";
import { SearchParamsContainer } from "./hooks/useSearchParams";

export function App() {
  const isEmbed = useEmbedMode();

  useLayoutEffect(() => {
    if (isEmbed) {
      document.body.classList.add("embed");
    } else {
      document.body.classList.remove("embed");
    }
  }, [isEmbed]);

  return (
    <MathJaxContext>
      <SearchParamsContainer.Provider>
        <ViewSettingsContainer.Provider>
          <OrbitsCalculator />
        </ViewSettingsContainer.Provider>
      </SearchParamsContainer.Provider>
    </MathJaxContext>
  );
}
