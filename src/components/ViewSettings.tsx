import { HTMLAttributes, useMemo } from "react";
import { createContainer } from "unstated-next";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useSearchParams } from "../hooks/useSearchParams";

const ARROW_MODES = ["orbits", "causal", "ladder", "none"] as const;
type ArrowMode = (typeof ARROW_MODES)[number];

export interface ViewSettings {
  arrowMode: ArrowMode;
  wrapArrows: boolean;
  onlyManipulatedArrows: boolean;
  showHands: boolean;
  isLimbsTable: boolean;
}

export const ViewSettingsContainer = createContainer(() => {
  const searchParams = useSearchParams();

  const viewSettings: ViewSettings = useMemo(() => {
    const arrowModeParam = searchParams.get("arrowMode");
    const wrapArrowsParam = searchParams.get("wrapArrows");
    const onlyManipulatedArrowsParam = searchParams.get(
      "onlyManipulatedArrows",
    );
    const showHandsParam = searchParams.get("showHands");
    const isLimbsTableParam = searchParams.get("isLimbsTable");

    return {
      arrowMode: ARROW_MODES.includes(arrowModeParam as any)
        ? (arrowModeParam as ArrowMode)
        : "none",
      wrapArrows: wrapArrowsParam === "0" ? false : true,
      onlyManipulatedArrows: onlyManipulatedArrowsParam === "0" ? false : true,
      showHands: showHandsParam === "1" ? true : false,
      isLimbsTable: isLimbsTableParam === "1" ? true : false,
    };
  }, [searchParams]);

  const setViewSettings = (newSettings: ViewSettings) => {
    searchParams.setAll({
      arrowMode: newSettings.arrowMode,
      wrapArrows: newSettings.wrapArrows ? "1" : "0",
      onlyManipulatedArrows: newSettings.onlyManipulatedArrows ? null : "0",
      showHands: newSettings.showHands ? "1" : "0",
      isLimbsTable: newSettings.isLimbsTable ? "1" : null,
    });
  };

  return { viewSettings, setViewSettings };
});

export const useViewSettings = ViewSettingsContainer.useContainer;

export function ViewSettingsControls({
  style,
  hasManipulator = false,
  ...other
}: HTMLAttributes<HTMLDivElement> & { hasManipulator?: boolean }) {
  const { viewSettings, setViewSettings } = useViewSettings();

  useKeyboardShortcut({
    key: "o",
    onKeyPressed: () =>
      setViewSettings({ ...viewSettings, arrowMode: "orbits" }),
    deps: [viewSettings],
  });
  useKeyboardShortcut({
    key: "c",
    onKeyPressed: () =>
      setViewSettings({ ...viewSettings, arrowMode: "causal" }),
    deps: [viewSettings],
  });
  useKeyboardShortcut({
    key: "l",
    onKeyPressed: () =>
      setViewSettings({ ...viewSettings, arrowMode: "ladder" }),
    deps: [viewSettings],
  });
  useKeyboardShortcut({
    key: "n",
    onKeyPressed: () => setViewSettings({ ...viewSettings, arrowMode: "none" }),
    deps: [viewSettings],
  });
  useKeyboardShortcut({
    key: "w",
    onKeyPressed: () =>
      setViewSettings({
        ...viewSettings,
        wrapArrows: !viewSettings.wrapArrows,
      }),
    deps: [viewSettings],
  });
  useKeyboardShortcut({
    key: "m",
    onKeyPressed: () =>
      setViewSettings({
        ...viewSettings,
        onlyManipulatedArrows: !viewSettings.onlyManipulatedArrows,
      }),
    deps: [viewSettings],
  });
  useKeyboardShortcut({
    key: "h",
    onKeyPressed: () =>
      setViewSettings({
        ...viewSettings,
        showHands: !viewSettings.showHands,
      }),
    deps: [viewSettings],
  });

  return (
    <div
      style={{ display: "flex", gap: "2em", flexWrap: "wrap", ...style }}
      {...other}
    >
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
      <label
        style={{
          display:
            viewSettings.arrowMode === "none" ||
            viewSettings.arrowMode === "orbits" ||
            !hasManipulator
              ? "none"
              : undefined,
        }}
      >
        <input
          type="checkbox"
          checked={viewSettings.onlyManipulatedArrows}
          onChange={(e) =>
            setViewSettings({
              ...viewSettings,
              onlyManipulatedArrows: e.target.checked,
            })
          }
        />
        Only manipulated arrows
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
      <label>
        <input
          type="checkbox"
          checked={viewSettings.isLimbsTable}
          onChange={(e) =>
            setViewSettings({ ...viewSettings, isLimbsTable: e.target.checked })
          }
        />
        Limbs table
      </label>
    </div>
  );
}
