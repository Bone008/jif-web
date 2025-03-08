import { createContext, useContext, useState, ReactNode } from "react";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";

export interface ViewSettings {
  arrowMode: "orbits" | "causal" | "ladder" | "none";
  wrapArrows: boolean;
  showHands: boolean;
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
    wrapArrows: true,
    showHands: false,
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

  useKeyboardShortcut({
    key: "o",
    onKeyPressed: () =>
      setViewSettings({ ...viewSettings, arrowMode: "orbits" }),
  });
  useKeyboardShortcut({
    key: "c",
    onKeyPressed: () =>
      setViewSettings({ ...viewSettings, arrowMode: "causal" }),
  });
  useKeyboardShortcut({
    key: "l",
    onKeyPressed: () =>
      setViewSettings({ ...viewSettings, arrowMode: "ladder" }),
  });
  useKeyboardShortcut({
    key: "n",
    onKeyPressed: () => setViewSettings({ ...viewSettings, arrowMode: "none" }),
  });

  return (
    <p style={{ display: "flex", gap: "2em" }}>
      <label>
        Show arrows:&nbsp;&nbsp;
        <select
          value={viewSettings.arrowMode}
          onChange={(e) =>
            setViewSettings({
              ...viewSettings,
              arrowMode: e.target.value as ViewSettings["arrowMode"],
            })
          }
        >
          <option value="none">None</option>
          <option value="orbits">Object orbits</option>
          <option value="ladder">Objects</option>
          <option value="causal">Causal</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={viewSettings.wrapArrows}
          onChange={(e) =>
            setViewSettings({ ...viewSettings, wrapArrows: e.target.checked })
          }
        />
        Wrap arrows
      </label>
      <label>
        <input
          type="checkbox"
          checked={viewSettings.showHands}
          onChange={(e) =>
            setViewSettings({
              ...viewSettings,
              showHands: e.target.checked,
            })
          }
        />
        Show hands
      </label>
    </p>
  );
}
