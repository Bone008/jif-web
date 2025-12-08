/** @file Defines raw input format for JIF.  */

export interface JIF {
  jugglers?: Juggler[];
  limbs?: Limb[];
  objects?: JifObject[];
  throws?: Throw[];
  repetition?: PassistRepetition;
}

export interface Juggler {
  label?: string;

  /** Relabelling that happens at the end of a period, used by this project. */
  becomes?: number;

  // Used by Passist, but not implemented here.
  //position?: [number, number];
}

export type LimbKind = "right_hand" | "left_hand" | "other";
export type PassistLimbType = "right hand" | "left hand" | "other";
export interface Limb {
  juggler?: number;
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
  isManipulated?: boolean;
}

/** Repetition block as needed by Passist */
export interface PassistRepetition {
  period?: number;
  limbPermutation?: number[];
}
