import { MouseEvent, useState } from "react";
import "./EmbedLink.scss";

export function EmbedLink() {
  const embedUrl = location.href + (location.search ? "&" : "?") + "embed=1";
  const [isCopied, setIsCopied] = useState(false);

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    navigator.clipboard.writeText(embedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 800);
  }

  return (
    <div className="embedLink">
      <a
        href={embedUrl}
        onClick={handleClick}
        target="_blank"
        title="Copy embed link for display in a different website"
        className="button"
      >
        {isCopied ? "Copied!" : "</>"}
      </a>
    </div>
  );
}
