/** @file Defines raw input format for JIF.  */

export interface JIF {
  jugglers?: Juggler[];
  limbs?: Limb[];
  objects?: JifObject[];
  throws?: Throw[];
  repetition?: Repetition;
}

export interface Juggler {
  /** Human-facing name of the juggler/role. */
  label?: string;

  /**
   * Juggler relabelling that happens at the end of a period.
   *
   * @deprecated Use repetition.limbPermutation instead.
   */
  becomes?: number;

  // Used by Passist, but not implemented here.
  //position?: [number, number];
}

export type LimbKind = "right_hand" | "left_hand" | "other";
export type PassistLimbType = "right hand" | "left hand" | "other";
export interface Limb {
  /** Index of the juggler this limb belongs to. */
  juggler?: number;

  /* Human-facing label of the limb. */
  label?: string;

  /** The kind of limb as used by this project. */
  kind?: LimbKind;

  /** The kind of limb as required by Passist. */
  type?: PassistLimbType;
}

export interface JifObject {
  type?: "ball" | "club" | "ring";
  color?: string;
}

export interface Throw {
  time?: number;
  duration?: number;
  from?: number;
  to?: number;

  /** Marker attribute to indicate that a throw is handled by a manipulator. */
  isManipulated?: boolean;
}

/** Repetition info about the pattern. */
export interface Repetition {
  /** Number of beats after which the pattern repeats. */
  period?: number;

  /**
   * Relabelling of limbs after each period. A limb at index `i` in this array
   * follows the instructions of limb `limbPermutation[i]` in the next period.
   */
  limbPermutation?: number[];
}
