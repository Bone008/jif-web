import { describe, expect, it } from "vitest";
import { siteswapToJIF } from "../jif/high_level_converter";
import { loadWithDefaults } from "../jif/jif_loader";
import { renderJaggedPieceSVGString } from "./jaggedPieceSvg";

describe("renderJaggedPieceSVGString", () => {
  it("returns an SVG string for a valid async pattern", () => {
    const jif = loadWithDefaults(siteswapToJIF("502040", 2));
    const svg = renderJaggedPieceSVGString(jif, 0);
    expect(svg).not.toBeNull();
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("uses black strokes instead of white", () => {
    const jif = loadWithDefaults(siteswapToJIF("502040", 2));
    const svg = renderJaggedPieceSVGString(jif, 0)!;
    expect(svg).toContain('stroke="black"');
    expect(svg).not.toContain('stroke="white"');
  });

  it("uses black fill for text", () => {
    const jif = loadWithDefaults(siteswapToJIF("502040", 2));
    const svg = renderJaggedPieceSVGString(jif, 0)!;
    expect(svg).toContain('fill="black"');
  });

  it("returns null for synchronous patterns", () => {
    // A 1-juggler pattern is detected as synchronous
    const jif = loadWithDefaults(siteswapToJIF("3", 1));
    const svg = renderJaggedPieceSVGString(jif, 0);
    expect(svg).toBeNull();
  });

  it("includes throw durations as text", () => {
    const jif = loadWithDefaults(siteswapToJIF("606050", 2));
    const svg = renderJaggedPieceSVGString(jif, 0)!;
    // The doubled "665" should contain throw values
    expect(svg).toContain("<text");
  });
});
