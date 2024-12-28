import { createContext, useContext, useState, ReactNode } from "react";

export interface ViewSettings {
  arrowMode: "orbits" | "causal" | "ladder" | "none";
}

const ViewSettingsContext = createContext<{
  viewSettings: ViewSettings;
  setViewSettings: (newSettings: ViewSettings) => void;
} | null>(null);

export function ViewSettingsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    arrowMode: "none",
  });

  return (
    <ViewSettingsContext.Provider value={{ viewSettings, setViewSettings }}>
      {children}
    </ViewSettingsContext.Provider>
  );
}

export function useViewSettings(): {
  viewSettings: ViewSettings;
  setViewSettings: (newSettings: ViewSettings) => void;
} {
  const context = useContext(ViewSettingsContext);
  if (!context) {
    throw new Error(
      "useViewSettings must be used within a ViewSettingsProvider",
    );
  }
  return context;
}

export function ViewSettingsControls() {
  const { viewSettings, setViewSettings } = useViewSettings();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setViewSettings({
      ...viewSettings,
      arrowMode: event.target.value as ViewSettings["arrowMode"],
    });
  };

  return (
    <p>
      <label>
        Show arrows:&nbsp;&nbsp;
        <select value={viewSettings.arrowMode} onChange={handleChange}>
          <option value="orbits">Orbits</option>
          <option value="causal">Causal</option>
          <option value="ladder">Ladder</option>
          <option value="none">None</option>
        </select>
      </label>
    </p>
  );
}
