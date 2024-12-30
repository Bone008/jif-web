// Manual typings provided for the arrow-line module:
// https://github.com/stanko-arbutina/arrow-line/tree

declare module "arrow-line" {
  export type ArrowPosition =
    | "topLeft"
    | "topRight"
    | "topCenter"
    | "middleRight"
    | "middleLeft"
    | "bottomLeft"
    | "bottomCenter"
    | "bottomRight";

  export interface ArrowLineOptions {
    source: string | { x: number; y: number };
    destination: string | { x: number; y: number };
    sourcePosition?: ArrowPosition;
    destinationPosition?: ArrowPosition;
    svgParentSelector?: string;
    color?: string;
    thickness?: number;
    curvature?: number;
    endpoint?: any; // TODO: Define this type.
    // Note: Not complete!
  }

  export default function arrowLine(options: ArrowLineOptions): {
    remove(): void;
    update(options: Partial<Omit<ArrowLineOptions, "svgParentSelector">>);
  };
}
