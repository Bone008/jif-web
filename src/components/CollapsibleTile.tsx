import React, { useState } from "react";
import { getUrlWithoutEmbedMode } from "../hooks/useEmbedMode";
import "./CollapsibleTile.scss";

export function CollapsibleTile({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`collapsible-tile ${isOpen ? "open" : ""}`}>
      <div className="collapsible-tile__panel">
        {children}
        <a
          className="showMoreButton"
          href={getUrlWithoutEmbedMode()}
          target="_blank"
          title="Show more details"
        >
          ↗️
        </a>
      </div>
      <button
        className="collapsible-tile__settings"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle settings"
      >
        ⚙️
      </button>
    </div>
  );
}
