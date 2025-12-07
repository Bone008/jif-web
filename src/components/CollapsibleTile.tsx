import React, { useState } from "react";
import "./CollapsibleTile.scss";

interface CollapsibleTileProps {
  children: React.ReactNode;
}

export const CollapsibleTile: React.FC<CollapsibleTileProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`collapsible-tile ${isOpen ? "open" : ""}`}>
      <div className="collapsible-tile__panel">{children}</div>
      <button
        className="collapsible-tile__settings"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle settings"
      >
        ⚙️
      </button>
    </div>
  );
};
