import {
  JifObject,
  Juggler,
  Limb,
  JIF,
  Throw,
  LimbKind,
  PassistLimbType,
  PassistRepetition,
} from "./jif";

const LIMB_LABELS_BY_KIND: Record<LimbKind, string> = {
  right_hand: "R",
  left_hand: "L",
  other: "O",
};

const LIMB_TYPES_BY_KIND: Record<LimbKind, PassistLimbType> = {
  right_hand: "right hand",
  left_hand: "left hand",
  other: "other",
};

type RequiredRecursive<T> = {
  [P in keyof T]-?: T[P] extends (infer U)[]
    ? RequiredRecursive<U>[]
    : T[P] extends object | undefined
      ? RequiredRecursive<T[P]>
      : T[P];
};

export type FullJIF = RequiredRecursive<JIF>;
export type FullJuggler = RequiredRecursive<Juggler>;
export type FullLimb = RequiredRecursive<Limb>;
export type FullThrow = RequiredRecursive<Throw>;
export type FullObject = RequiredRecursive<JifObject>;

export function loadWithDefaults(jif: JIF): FullJIF {
  const rawJugglers = jif.jugglers || [{}];
  const jugglers = rawJugglers.map<FullJuggler>((juggler, j) => ({
    label: def(juggler.label, indexToJugglerName(j)),
    becomes: def(juggler.becomes, j),
    //position: def(juggler.position, [0, 0]),
  }));

  const rawLimbs = jif.limbs || emptyObjects(jugglers.length * 2);
  const limbs = rawLimbs.map<FullLimb>((limb, i) => {
    const kind: LimbKind = def(
      limb.kind,
      i < jugglers.length
        ? "right_hand"
        : i < jugglers.length * 2
          ? "left_hand"
          : "other",
    );
    return {
      juggler: def(limb.juggler, i % jugglers.length),
      kind,
      label: def(limb.label, LIMB_LABELS_BY_KIND[kind]),
      type: LIMB_TYPES_BY_KIND[kind],
    };
  });

  const rawThrows = jif.throws || [];
  const throws = rawThrows.map<FullThrow>((thrw, i) => {
    const time = def(thrw.time, i);
    const duration = def(thrw.duration, 3);
    return {
      time,
      duration,
      from: def(thrw.from, time % limbs.length),
      to: def(thrw.to, (time + duration) % limbs.length),
      isManipulated: def(thrw.isManipulated, false),
    };
  });

  // Compute data for the repetition block for Passist
  const rawRepetition = jif.repetition || {};
  const period = def(rawRepetition.period, inferPeriod({ throws }));
  if (jif.repetition?.limbPermutation) {
    console.warn(
      "setting limbPermutations is not supported, use juggler[].becomes!",
    );
  }
  const limbsSwitchHandedness = period % 2 === 1;
  const limbPermutation = limbs.map((limb) =>
    limbs.findIndex(
      (other) =>
        // Find the limb belonging to the juggler who this limb's juggler becomes.
        other.juggler === jugglers[limb.juggler].becomes &&
        // If the period is odd, right hands become left hands and vice versa.
        // If the period is even, handedness stays the same.
        (other.kind === limb.kind) === !limbsSwitchHandedness,
    ),
  );
  const repetition = { period, limbPermutation };

  const objects: FullObject[] = [
    /* TODO */
  ];
  return {
    jugglers,
    limbs,
    throws,
    objects,
    repetition,
  };
}

export function inferPeriod(jif: JIF): number {
  return jif.throws?.length
    ? Math.max(...jif.throws.map((t, i) => def(t.time, i))) + 1
    : 0;
}

// Util

export function emptyObjects<T extends {}>(num: number): Array<Partial<T>> {
  const result = Array<Partial<T>>(num);
  for (let i = 0; i < num; i++) {
    result[i] = {};
  }
  return result;
}

export function indexToJugglerName(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

/** Returns a value, unless it is undefined, then it returns defaultValue. */
function def<T>(value: T | undefined, defaultValue: T): T {
  return value !== undefined ? value : defaultValue;
}
