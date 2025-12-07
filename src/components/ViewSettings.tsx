import { HTMLAttributes, useState } from "react";
import { createContainer } from "unstated-next";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";

export interface ViewSettings {
  arrowMode: "orbits" | "causal" | "ladder" | "none";
  wrapArrows: boolean;
  showHands: boolean;
}

export const ViewSettingsContainer = createContainer(() => {
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    arrowMode: "none",
    wrapArrows: true,
    showHands: false,
  });

  return { viewSettings, setViewSettings };
});

export const useViewSettings = ViewSettingsContainer.useContainer;

export function ViewSettingsControls({
  style,
  ...other
}: HTMLAttributes<HTMLDivElement>) {
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
    <div style={{ display: "flex", gap: "2em", ...style }} {...other}>
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
      <label
        style={{
          display: viewSettings.arrowMode === "none" ? "none" : undefined,
        }}
      >
        <input
          type="checkbox"
          checked={viewSettings.wrapArrows}
          onChange={(e) =>
            setViewSettings({ ...viewSettings, wrapArrows: e.target.checked })
          }
        />
        Wrap arrows
      </label>
    </div>
  );
}
