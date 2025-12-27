import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

export interface ArrowData {
  j1: number;
  t1: number;
  j2: number;
  t2: number;
  color: string;
  hovered: boolean;
}

export interface ArrowOverlayProps {
  containerSelector: string;
  arrows: ArrowData[];
}

/**
 * ArrowOverlay renders SVG arrows overlaid on the throws table.
 * The SVG is positioned absolutely within the throws-container.
 */
export function ArrowOverlay({ containerSelector, arrows }: ArrowOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    left: 0,
  });
  const markerIdPrefix = useId().replace(/:/g, "x");

  // Get unique colors from arrows to create markers
  const uniqueColors = Array.from(new Set(arrows.map((a) => a.color)));

  // Measure the table dimensions to size the SVG appropriately
  useLayoutEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const updateDimensions = () => {
      const table = container.querySelector("table");
      if (!table) return;

      const firstHeader = table.querySelector("th:first-child") as HTMLElement;
      const lastHeader = table.querySelector("th:last-child") as HTMLElement;

      if (!firstHeader || !lastHeader) return;

      const tableRect = table.getBoundingClientRect();
      const firstRect = firstHeader.getBoundingClientRect();
      const lastRect = lastHeader.getBoundingClientRect();

      // SVG spans from right edge of first column to left edge of last column
      const left = firstRect.right - tableRect.left;
      const right = lastRect.left - tableRect.left;
      const width = right - left;
      const height = tableRect.height;

      setDimensions({ width, height, left });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [containerSelector]);

  // Calculate arrow paths
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const container = document.querySelector(containerSelector);
    const table = container?.querySelector("table");
    if (!container || !table) return;

    const tableRect = table.getBoundingClientRect();

    // Clear existing paths
    const svg = svgRef.current;
    while (svg.lastChild && svg.lastChild !== svg.firstChild) {
      svg.removeChild(svg.lastChild);
    }

    arrows.forEach(({ j1, t1, j2, t2, color, hovered }) => {
      const fromCell = container.querySelector(
        `tr[data-juggler="${j1}"] td[data-time="${t1}"] .throw`,
      ) as HTMLElement;
      const toCell = container.querySelector(
        `tr[data-juggler="${j2}"] td[data-time="${t2}"] .throw`,
      ) as HTMLElement;

      if (!fromCell || !toCell) {
        console.warn(
          `Arrow cells not found: from (${j1}, ${t1}) to (${j2}, ${t2})`,
        );
        return;
      }

      const fromRect = fromCell.getBoundingClientRect();
      const toRect = toCell.getBoundingClientRect();

      // Calculate positions relative to the SVG viewport
      let x1: number, y1: number, x2: number, y2: number;

      const selfArrow = t1 === t2 && j1 === j2;

      if (selfArrow) {
        // Self-throw: create a loop on the right side
        x1 = fromRect.right - tableRect.left - dimensions.left;
        y1 = fromRect.top + fromRect.height / 2 - tableRect.top;
        x2 = x1;
        y2 = y1;
      } else {
        // Determine direction for both dimensions independently
        const horizontalDir = Math.sign(t2 - t1); // -1 (left), 0 (same), 1 (right)
        const verticalDir = Math.sign(j2 - j1); // -1 (up), 0 (same), 1 (down)

        // Calculate horizontal positions (x1, x2)
        if (horizontalDir > 0) {
          // Going right: from right edge to left edge
          x1 = fromRect.right - tableRect.left - dimensions.left;
          x2 = toRect.left - tableRect.left - dimensions.left;
        } else if (horizontalDir < 0) {
          // Going left: from left edge to right edge
          x1 = fromRect.left - tableRect.left - dimensions.left;
          x2 = toRect.right - tableRect.left - dimensions.left;
        } else {
          // Same column: center to center
          x1 =
            fromRect.left +
            fromRect.width / 2 -
            tableRect.left -
            dimensions.left;
          x2 =
            toRect.left + toRect.width / 2 - tableRect.left - dimensions.left;
        }

        // Calculate vertical positions (y1, y2)
        if (verticalDir > 0) {
          // Going down: from bottom edge to top edge
          y1 = fromRect.bottom - tableRect.top;
          y2 = toRect.top - tableRect.top;
        } else if (verticalDir < 0) {
          // Going up: from top edge to bottom edge
          y1 = fromRect.top - tableRect.top;
          y2 = toRect.bottom - tableRect.top;
        } else {
          // Same row: middle to middle
          y1 = fromRect.top + fromRect.height / 2 - tableRect.top;
          y2 = toRect.top + toRect.height / 2 - tableRect.top;
        }
      }

      // Create curved path (only for same row, otherwise straight)
      const sameRow = j1 === j2;
      const path = createCurvedPath(x1, y1, x2, y2, selfArrow, sameRow);

      const pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      pathElement.setAttribute("d", path);
      pathElement.setAttribute("stroke", color);
      pathElement.setAttribute("stroke-width", "1.2");
      pathElement.setAttribute("fill", "none");
      pathElement.setAttribute(
        "marker-end",
        `url(#${markerIdPrefix}-${color.replace(/[^a-z0-9]/gi, "")})`,
      );
      pathElement.setAttribute(
        "class",
        hovered ? "arrow-path hovered" : "arrow-path",
      );
      svg.appendChild(pathElement);
    });
  }, [containerSelector, arrows, dimensions, markerIdPrefix]);

  if (dimensions.width === 0) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      className="arrow-overlay-svg"
      style={{
        position: "absolute",
        left: `${dimensions.left}px`,
        top: 0,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        {uniqueColors.map((color) => (
          <marker
            key={color}
            id={`${markerIdPrefix}-${color.replace(/[^a-z0-9]/gi, "")}`}
            markerUnits="strokeWidth"
            viewBox="-1 -1 12 12"
            orient="auto"
            markerWidth="8"
            markerHeight="8"
            refX="8"
            refY="5"
          >
            <polygon points="0,0 10,5 0,10" fill={color} />
          </marker>
        ))}
      </defs>
    </svg>
  );
}

/**
 * Creates a curved path between two points.
 * - Arrows on the same row: curved (right curves upward, left curves downward)
 * - Arrows to different rows: straight line
 * - Self-throws: create a loop
 */
function createCurvedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  sameColumn: boolean,
  sameRow: boolean,
): string {
  if (sameColumn) {
    // Create a loop for self-throws
    const loopSize = 25;
    return `M ${x1} ${y1 - loopSize / 10} 
            C ${x1 + loopSize} ${y1 - loopSize}, 
              ${x1 + loopSize} ${y1 + loopSize}, 
              ${x2} ${y2 + loopSize / 10}`;
  }

  // Arrows to different rows are straight
  if (!sameRow) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  // Arrows on the same row are curved
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Control point offset (% of distance, perpendicular to the line)
  const curvature = 0.25;
  const offset = distance * curvature;

  // Calculate control point
  // For right arrows: curve upward (negative y offset)
  // For left arrows: curve downward (positive y offset)
  const perpX = -dy / distance;
  const perpY = dx / distance;

  // Always use -1 as sign since perpY already encodes direction
  // (positive for right arrows, negative for left arrows)
  const cx = (x1 + x2) / 2 + perpX * offset * -1;
  const cy = (y1 + y2) / 2 + perpY * offset * -1;

  return `M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}`;
}
