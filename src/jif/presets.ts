import {
  RAW_DATA_3_COUNT_PASSING,
  RAW_DATA_3_COUNT_PASSING_2X,
  RAW_DATA_4_COUNT_PASSING,
  RAW_DATA_4_COUNT_PASSING_2X,
  RAW_DATA_PASS_PASS_SELF,
  RAW_DATA_PASS_PASS_SELF_2X,
  RAW_DATA_PASS_PASS_SELF_3X,
  RAW_DATA_WALKING_FEED_10C,
  RAW_DATA_WALKING_FEED_10C_RIGHT_HANDED_DS,
  RAW_DATA_WALKING_FEED_9C,
  RAW_DATA_WALKING_FEED_9C_2X,
} from "./test_data";

export interface Preset {
  name: string;
  slug?: string;
  instructions: string[];
  manipulators?: string[];
  warningNote?: string;
}

/** Presets organized by category. The order in the file is preserved. */
export const ALL_PRESETS_BY_CATEGORY: Record<string, Preset[]> = {
  "2 Person Base Patterns": [
    {
      name: "3-count",
      instructions: RAW_DATA_3_COUNT_PASSING,
    },
    {
      name: "3-count 2x",
      instructions: RAW_DATA_3_COUNT_PASSING_2X,
    },
    {
      name: "4-count",
      instructions: RAW_DATA_4_COUNT_PASSING,
    },
    {
      name: "4-count 2x",
      instructions: RAW_DATA_4_COUNT_PASSING_2X,
    },
    {
      name: "Pass Pass Self",
      instructions: RAW_DATA_PASS_PASS_SELF,
    },
    {
      name: "Pass Pass Self 2x",
      instructions: RAW_DATA_PASS_PASS_SELF_2X,
    },
    {
      name: "Pass Pass Self 3x",
      instructions: RAW_DATA_PASS_PASS_SELF_3X,
    },
  ],

  "2 Person Async Patterns": [
    {
      name: "5-count popcorn",
      slug: "popcorn",
      instructions: ["7a6667a6667a666"],
    },
    {
      name: "7-club one-count",
      slug: "one-count",
      instructions: ["777777777"],
    },
    {
      name: "786 - French 3-count",
      slug: "french-3-count",
      instructions: ["786786786"],
    },
    {
      name: "975 - Holy Grail",
      slug: "holy-grail",
      instructions: ["975975975"],
    },
    {
      name: "77862 - Why Not",
      slug: "why-not",
      instructions: ["778627786277862"],
    },
    {
      name: "777786 - Example of Period 6",
      slug: "period-6",
      instructions: ["777786777786"],
    },
  ],

  "3 Person Base Patterns": [
    {
      name: "Walking feed 9c",
      instructions: RAW_DATA_WALKING_FEED_9C,
    },
    {
      name: "Walking feed 9c 2x",
      instructions: RAW_DATA_WALKING_FEED_9C_2X,
    },
    {
      name: "Walking feed 10c",
      instructions: RAW_DATA_WALKING_FEED_10C,
    },
  ],

  "Manipulation Patterns": [
    {
      name: "3-count Roundabout",
      instructions: RAW_DATA_3_COUNT_PASSING_2X,
      manipulators: ["- - - sa - i1b"],
    },
    {
      name: "4-count Roundabout",
      instructions: RAW_DATA_4_COUNT_PASSING_2X,
      manipulators: ["sa - sb - ia -"],
    },
    {
      name: "Ronjabout",
      instructions: ["4B 3  5  3  4B 3  5  3  4B", "3  4A 3  3  3  4A 3  3  3"],
      manipulators: ["sa - - sb - ia - - -"],
    },
    {
      name: "Phoenician Waltz",
      instructions: RAW_DATA_PASS_PASS_SELF_3X,
      manipulators: ["sA - - sA - - i1A - -"],
    },
    {
      name: "Göttinger Opernball",
      slug: "goettinger-opernball",
      instructions: [
        "3B 3B  3  3B 3B  3  3B 3B  3",
        "3A 3A  3  3A 3A  3  3A 3A  3",
      ],
      manipulators: [
        "sA - - sA - - i1A - -",
        "sB - - i1B - - sA - -",
        "i1A - - sB - - sB - -",
      ],
    },
    {
      name: "7-club PPS-about",
      instructions: [
        "4b 4b 3 4b 4b 3 4b 4b 3 4b 4b 3 -> A",
        "3 3a 4a 3 3a 4a 3 3a 4a 3 3a 4a -> B",
      ],
      manipulators: ["- iA - - - - - iB"],
    },
    {
      name: "Dolby 5.1",
      instructions: ["3B 3  3  3  3", "3A 3  3  3  3"],
      manipulators: ["sA i2B -  -  -"],
      warningNote:
        "The carry is crossing, which the orbits calculation does not handle yet!",
    },
    {
      name: "Dolby 5.1 with Doppelgänger",
      instructions: ["3B 3  3  3  3", "3A 3  3  3  3"],
      manipulators: ["sA i2B -  -  -", "sB i2A -  -  -"],
      warningNote:
        "The carry is crossing, which the orbits calculation does not handle yet!",
    },
    {
      name: "Dumb Ways to Die",
      instructions: [
        "3B 3C 3 3B 3C 3 3C 3B 3 3C 3B 3 -> A",
        "3A 3  3 3A 3  3 3  3A 3 3  3A 3 -> B",
        "3  3A 3 3  3A 3 3A 3  3 3A 3  3 -> C",
      ],
      manipulators: ["- i1A - - - i2B - - - i1C - -"],
    },
    {
      name: "Muckabout (TODO)",
      slug: "muckabout",
      instructions: ["3 3c 3 3 3b 3", "3 3 3 3 3a 3", "3 3a 3 3 3 3"],
      manipulators: ["- sa - i2c - -", "i2b - - - sb -"],
      warningNote: "Instructions for this pattern are unfinished / unverified.",
    },
  ],

  Scrambled: [
    // Group 1: cX sX iX patterns
    {
      name: "#1.1 - cA sA iA - Aidan",
      slug: "aidan",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sC - i2B -"],
    },
    {
      name: "#1.2 - cA sB iA - Casbia",
      slug: "casbia",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sB - i2B -"],
    },
    {
      name: "#1.3 - cA sC iA - Cascia",
      slug: "cascia",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sA - i2B -"],
    },
    {
      name: "#1.4 - cC sA iB - Scrambled 3",
      slug: "scrambled-3",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sC - i2A -"],
    },
    {
      name: "#1.5 - cC sB iB - Wrong One",
      slug: "wrong-one",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sB - i2A -"],
    },
    {
      name: "#1.6 - cC sC iB - Zig Zag",
      slug: "zig-zag",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sA - i2A -"],
    },
    {
      name: "#1.7 - cB sA iC - Chopped up V",
      slug: "chopped-up-v",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sC - i2C -"],
    },
    {
      name: "#1.8 - cB sB iC - Scrambled V",
      slug: "scrambled-v",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sB - i2C -"],
    },
    {
      name: "#1.9 - cB sC iC - Postmen",
      slug: "postmen",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["- - sA - i2C -"],
    },
    // Group 2: iX cX sX patterns
    {
      name: "#2.1 - iA cC sA - Around the World",
      slug: "around-the-world",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2B - - - sB -"],
    },
    {
      name: "#2.2 - iA cC sB - Unscrambled LB",
      slug: "unscrambled-lb",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2B - - - sA -"],
    },
    {
      name: "#2.3 - iA cC sC - Ivy",
      slug: "ivy",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2B - - - sC -"],
    },
    {
      name: "#2.4 - iB cB sA - Unscrambled B",
      slug: "unscrambled-b",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2A - - - sB -"],
    },
    {
      name: "#2.5 - iB cB sB - Chopped up B",
      slug: "chopped-up-b",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2A - - - sA -"],
    },
    {
      name: "#2.6 - iB cB sC - Gentle Romble",
      slug: "gentle-romble",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2A - - - sC -"],
    },
    {
      name: "#2.7 - iC cA sA - Moonwalk",
      slug: "moonwalk",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2C - - - sB -"],
    },
    {
      name: "#2.8 - iC cA sB - 3 Variation",
      slug: "3-variation",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2C - - - sA -"],
    },
    {
      name: "#2.9 - iC cA sC - Wankle Engine",
      slug: "wankle-engine",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["i2C - - - sC -"],
    },
    // Group 3: sX iX cX patterns
    {
      name: "#3.1 - sB iA cB - Anna-Maria",
      slug: "anna-maria",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sA - i2C - - -"],
    },
    {
      name: "#3.2 - sC iA cB - Panto",
      slug: "panto",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sC - i2C - - -"],
    },
    {
      name: "#3.3 - sA iA cB - Buddy Check",
      slug: "buddy-check",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sB - i2C - - -"],
    },
    {
      name: "#3.4 - sB iB cA - Last One",
      slug: "last-one",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sA - i2B - - -"],
    },
    {
      name: "#3.5 - sC iB cA - WUST",
      slug: "wust",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sC - i2B - - -"],
    },
    {
      name: "#3.6 - sA iB cA - Saibca",
      slug: "saibca",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sB - i2B - - -"],
    },
    {
      name: "#3.7 - sB iC cC - Toast",
      slug: "toast",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sA - i2A - - -"],
    },
    {
      name: "#3.8 - sC iC cC - Right One",
      slug: "right-one",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sC - i2A - - -"],
    },
    {
      name: "#3.9 - sA iC cC - Vegemite Toast",
      slug: "vegemite-toast",
      instructions: RAW_DATA_WALKING_FEED_9C,
      manipulators: ["sB - i2A - - -"],
    },
  ],

  Ambled: [
    {
      name: "#1.1 - JHAL",
      slug: "ambled-jhal",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - i2B - - sA"],
    },
    {
      name: "#1.2 - Ambled Back to the Future",
      slug: "ambled-back-to-the-future",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["sA - - i2B - - -"],
    },
    {
      name: "#1.3 - Ambled Wust",
      slug: "ambled-wust",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- sC - i2B - - -"],
    },
    {
      name: "#1.4 - Ambled Saibca",
      slug: "ambled-saibca",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- sB - i2B - - -"],
    },
    {
      name: "#2.1 - Zap Me Maybe",
      slug: "ambled-zap-me-maybe",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["sA - - i2C - - -"],
    },
    {
      name: "#2.2 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- sC - i2C - - -"],
    },
    {
      name: "#2.3 - Choptopus",
      slug: "ambled-choptopus",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- sB - i2C - - -"],
    },
    {
      name: "#2.4 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - sB i2C - - -"],
    },
    {
      name: "#2.5 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - sA i2C - - -"],
    },
    {
      name: "#3.1 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- sB - - - i2C -"],
    },
    {
      name: "#3.2 - Ambled V",
      slug: "ambled-v",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - sB - i2C -"],
    },
    {
      name: "#3.3 - Ambled Postmen",
      slug: "ambled-postmen",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - sA - - i2C -"],
    },
    {
      name: "#3.4 - Ambled Chopped V",
      slug: "ambled-chopped-v",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - sC - i2C -"],
    },
    {
      name: "#4.1 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- sB - - i2A - -"],
    },
    {
      name: "#4.2 - Ambled Wrong One",
      slug: "ambled-wrong-one",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - sB i2A - -"],
    },
    {
      name: "#4.3 - Ambled Zig Zag",
      slug: "ambled-zig-zag",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - sA - i2A - -"],
    },
    {
      name: "#4.4 - Ambled 3",
      slug: "ambled-3",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - sC i2A - -"],
    },
    {
      name: "#5.1 - Ambled Casbia",
      slug: "ambled-casbia",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - sB - i2B -"],
    },
    {
      name: "#5.2 - Ambled Cascia",
      slug: "ambled-cascia",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - sA - - i2B -"],
    },
    {
      name: "#5.3 - Ambled Aidan",
      slug: "ambled-aidan",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - sC - i2B -"],
    },
    {
      name: "#5.4 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - - sA i2B -"],
    },
    {
      name: "#5.5 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C_RIGHT_HANDED_DS,
      manipulators: ["- - - - - i2B - -"],
      warningNote:
        "There is a sC-C on beat 5 -- notated on the same beat as the intercept, " +
        "which the tool does not support yet.",
    },
    {
      name: "#6.1 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["i2A - - - - - -"],
      warningNote:
        "There is a sC-A on beat 4 -- notated on the same beat as the carry, " +
        "which the tool does not support yet.",
    },
    {
      name: "#6.2 - Ambled Chopped B",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["i2A - - - sA - -"],
    },
    {
      name: "#6.3 - Ambled Gentle Romble",
      slug: "ambled-gentle-romble",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["i2A - - - - sC -"],
    },
    {
      name: "#6.4 - Ambled B",
      slug: "ambled-b",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["i2A - - - - sB -"],
    },
    {
      name: "#6.5 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["i2A - - - - - sA"],
    },
    {
      name: "#6.6 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["sC i2A - - - - - -"],
    },
    {
      name: "#7.1 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - sC - - i2A"],
    },
    {
      name: "#7.2 - Ambled LB",
      slug: "ambled-lb",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - - sA - i2A"],
    },
    {
      name: "#7.3 - Ambled Ivy",
      slug: "ambled-ivy",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - - - sC i2A"],
    },
    {
      name: "#7.4 - Around the Ambled World",
      slug: "around-the-ambled-world",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - - - - sB i2A"],
    },
    {
      name: "#8.1 - Ambled 3 Variation",
      slug: "ambled-3-variation",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- i2C - - sA - -"],
    },
    {
      name: "#8.2 - Ambled Wankle Engine",
      slug: "ambled-wankle-engine",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- i2C - - - sC -"],
    },
    {
      name: "#8.3 - Ambled Moonwalk",
      slug: "ambled-moonwalk",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- i2C - - - sB -"],
    },
    {
      name: "#8.4 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- i2C - - - - sA"],
    },
    {
      name: "#9.1 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- i2B - - - sB -"],
    },
    {
      name: "#9.2 - Ambled Buddy Check (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- i2B - - - - sA"],
    },
    {
      name: "#9.3 - Ambled Panto",
      slug: "ambled-panto",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["sC i2B - - - - -"],
    },
    {
      name: "#9.4 - Ambled Anna-Maria",
      slug: "ambled-anna-maria",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["sA i2B - - - - -"],
    },
    {
      name: "#10.1 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - i2A - - - -"],
      warningNote:
        "There is a sB-A on beat 6 -- notated on the same beat as the carry, " +
        "which the tool does not support yet.",
    },
    {
      name: "#10.2 - Ambled Vegemite Toast",
      slug: "ambled-vegemite-toast",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- - i2A - - - sA"],
    },
    {
      name: "#10.3 - Ambled Right One",
      slug: "ambled-right-one",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["sC - i2A - - - -"],
    },
    {
      name: "#10.4 - Ambled Toast",
      slug: "ambled-toast",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["sA - i2A - - - -"],
    },
    {
      name: "#10.5 - Unnamed (to juggle!)",
      instructions: RAW_DATA_WALKING_FEED_10C,
      manipulators: ["- sB i2A - - - -"],
    },
  ],

  "Tool Demonstration": [
    {
      name: "Solo Self Substitute",
      instructions: ["3 3 3 3 3 3 3 3"],
      manipulators: ["- - sA"],
    },
    {
      name: "Happy Holds",
      instructions: ["2 2 2 2 2 2", "2 2 2 2 2 2"],
    },
  ],
};

export function sanitizeName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

/** Returns the slug for a preset (uses explicit slug if set, otherwise sanitized name). */
export function getPresetSlug(preset: Preset): string {
  return preset.slug ?? sanitizeName(preset.name);
}

/** Returns a preset by looking it up by its slug. */
export function findPresetBySlug(slug: string): Preset | null {
  for (const presets of Object.values(ALL_PRESETS_BY_CATEGORY)) {
    const found = presets.find((preset) => getPresetSlug(preset) === slug);
    if (found) return found;
  }
  return null;
}

export interface Category {
  name: string;
  presets: Preset[];
}

/** Returns a category with its presets by looking it up by its sanitized name. */
export function findCategoryByName(name: string): Category | null {
  for (const [category, presets] of Object.entries(ALL_PRESETS_BY_CATEGORY)) {
    if (sanitizeName(category) === name) {
      return { name: category, presets };
    }
  }
  return null;
}
