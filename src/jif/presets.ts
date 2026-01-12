import {
  RAW_DATA_3_COUNT_PASSING,
  RAW_DATA_3_COUNT_PASSING_2X,
  RAW_DATA_4_COUNT_PASSING,
  RAW_DATA_4_COUNT_PASSING_2X,
  RAW_DATA_PASS_PASS_SELF,
  RAW_DATA_PASS_PASS_SELF_2X,
  RAW_DATA_PASS_PASS_SELF_3X,
  RAW_DATA_WALKING_FEED_10C,
  RAW_DATA_WALKING_FEED_9C,
  RAW_DATA_WALKING_FEED_9C_2X,
} from "./test_data";

export interface Preset {
  name: string;
  slug?: string;
  instructions: string;
  manipulators?: string[];
  warningNote?: string;
}

/** Presets organized by category. The order in the file is preserved. */
export const ALL_PRESETS_BY_CATEGORY: Record<string, Preset[]> = {
  "2 Person Base Patterns": [
    {
      name: "3-count",
      instructions: RAW_DATA_3_COUNT_PASSING.join("\n"),
    },
    {
      name: "3-count 2x",
      instructions: RAW_DATA_3_COUNT_PASSING_2X.join("\n"),
    },
    {
      name: "4-count",
      instructions: RAW_DATA_4_COUNT_PASSING.join("\n"),
    },
    {
      name: "4-count 2x",
      instructions: RAW_DATA_4_COUNT_PASSING_2X.join("\n"),
    },
    {
      name: "Pass Pass Self",
      instructions: RAW_DATA_PASS_PASS_SELF.join("\n"),
    },
    {
      name: "Pass Pass Self 2x",
      instructions: RAW_DATA_PASS_PASS_SELF_2X.join("\n"),
    },
    {
      name: "Pass Pass Self 3x",
      instructions: RAW_DATA_PASS_PASS_SELF_3X.join("\n"),
    },
  ],

  "2 Person Async Patterns": [
    {
      name: "5-count popcorn",
      slug: "popcorn",
      instructions: "7a6667a6667a666",
    },
    {
      name: "7-club one-count",
      slug: "one-count",
      instructions: "777777777",
    },
    {
      name: "786 - French 3-count",
      slug: "french-3-count",
      instructions: "786786786",
    },
    {
      name: "975 - Holy Grail",
      slug: "holy-grail",
      instructions: "975975975",
    },
    {
      name: "77862 - Why Not",
      slug: "why-not",
      instructions: "778627786277862",
    },
    {
      name: "777786 - Example of Period 6",
      slug: "period-6",
      instructions: "777786777786",
    },
  ],

  "3 Person Base Patterns": [
    {
      name: "Walking feed 9c",
      instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    },
    {
      name: "Walking feed 9c 2x",
      instructions: RAW_DATA_WALKING_FEED_9C_2X.join("\n"),
    },
    {
      name: "Walking feed 10c",
      instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
    },
  ],

  "Manipulation Patterns": [
    {
      name: "3-count Roundabout",
      instructions: RAW_DATA_3_COUNT_PASSING_2X.join("\n"),
      manipulators: ["- - - sa - i1b"],
    },
    {
      name: "4-count Roundabout",
      instructions: RAW_DATA_4_COUNT_PASSING_2X.join("\n"),
      manipulators: ["sa - sb - ia -"],
    },
    {
      name: "Ronjabout",
      instructions: [
        "4B 3  5  3  4B 3  5  3  4B",
        "3  4A 3  3  3  4A 3  3  3",
      ].join("\n"),
      manipulators: ["sa - - sb - ia - - -"],
    },
    {
      name: "Phoenician Waltz",
      instructions: RAW_DATA_PASS_PASS_SELF_3X.join("\n"),
      manipulators: ["sA - - sA - - i1A - -"],
    },
    {
      name: "Göttinger Opernball",
      instructions: [
        "3B 3B  3  3B 3B  3  3B 3B  3",
        "3A 3A  3  3A 3A  3  3A 3A  3",
      ].join("\n"),
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
      ].join("\n"),
      manipulators: ["- iA - - - - - iB"],
    },
    {
      name: "Dolby 5.1",
      instructions: ["3B 3  3  3  3", "3A 3  3  3  3"].join("\n"),
      manipulators: ["sA i2B -  -  -"],
      warningNote:
        "The carry is crossing, which the orbits calculation does not handle yet!",
    },
    {
      name: "Dolby 5.1 with Doppelgänger",
      instructions: ["3B 3  3  3  3", "3A 3  3  3  3"].join("\n"),
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
      ].join("\n"),
      manipulators: ["- i1A - - - i2B - - - i1C - -"],
    },
    {
      name: "Muckabout (TODO)",
      slug: "muckabout",
      instructions: ["3 3c 3 3 3b 3", "3 3 3 3 3a 3", "3 3a 3 3 3 3"].join(
        "\n",
      ),
      manipulators: ["- sa - i2c - -", "i2b - - - sb -"],
      warningNote: "Instructions for this pattern are unfinished / unverified.",
    },
  ],

  Scrambled: [
    {
      name: "Scrambled - iB cB sA - B",
      slug: "b",
      instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
      manipulators: ["i2A - - - sB -"],
    },
    {
      name: "Scrambled - iA cC sC - Ivy",
      slug: "ivy",
      instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
      manipulators: ["i2B - - - sC -"],
    },
    {
      name: "Scrambled - cB sC iC - Postmen",
      slug: "postmen",
      instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
      manipulators: ["- - sA - i2C -"],
    },
    {
      name: "Scrambled - cB sB iC - Toast",
      slug: "toast",
      instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
      manipulators: ["sA - i2A - - -"],
    },
    {
      name: "Scrambled - cB sB iC - V",
      slug: "v",
      instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
      manipulators: ["- - sB - i2C -"],
    },
  ],

  Ambled: [
    {
      name: "Ambled - Choptopus",
      slug: "choptopus",
      instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
      manipulators: ["- sB - i2c - - -"],
    },
  ],

  "Tool Demonstration": [
    {
      name: "Solo Self Substitute",
      instructions: "3 3 3 3 3 3 3 3",
      manipulators: ["- - sA"],
    },
    {
      name: "Happy Holds",
      instructions: ["2 2 2 2 2 2", "2 2 2 2 2 2"].join("\n"),
    },
  ],
};

export function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
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
