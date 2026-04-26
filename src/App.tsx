import { MathJaxContext } from "better-react-mathjax";
import { useLayoutEffect } from "react";
import { OrbitsCalculator } from "./components/OrbitsCalculator";
import { PuzzlePage } from "./components/PuzzlePage";
import { ViewSettingsContainer } from "./components/ViewSettings";
import { useEmbedMode } from "./hooks/useEmbedMode";
import {
  SearchParamsContainer,
  useSearchParams,
} from "./hooks/useSearchParams";

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
          <RouteSwitch />
        </ViewSettingsContainer.Provider>
      </SearchParamsContainer.Provider>
    </MathJaxContext>
  );
}

function RouteSwitch() {
  const search = useSearchParams();
  if (search.get("puzzle") !== null) {
    return <PuzzlePage />;
  }
  return <OrbitsCalculator />;
}
