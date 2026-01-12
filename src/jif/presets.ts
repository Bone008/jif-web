import _ from "lodash";
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
  instructions: string;
  manipulators?: string[];
  category?: string;
  warningNote?: string;
}

export const ALL_PRESETS: Preset[] = [
  {
    name: "Solo Self Substitute",
    instructions: "3 3 3 3 3 3 3 3",
    manipulators: ["- - sA"],
    category: "Tool Demonstrations",
  },
  {
    name: "Happy Holds",
    instructions: ["2 2 2 2 2 2", "2 2 2 2 2 2"].join("\n"),
    category: "Tool Demonstrations",
  },
  {
    name: "3-count",
    instructions: RAW_DATA_3_COUNT_PASSING.join("\n"),
    category: "2 Person Base Patterns",
  },
  {
    name: "3-count 2x",
    instructions: RAW_DATA_3_COUNT_PASSING_2X.join("\n"),
    category: "2 Person Base Patterns",
  },
  {
    name: "Pass Pass Self",
    instructions: RAW_DATA_PASS_PASS_SELF.join("\n"),
    category: "2 Person Base Patterns",
  },
  {
    name: "Pass Pass Self 2x",
    instructions: RAW_DATA_PASS_PASS_SELF_2X.join("\n"),
    category: "2 Person Base Patterns",
  },
  {
    name: "Pass Pass Self 3x",
    instructions: RAW_DATA_PASS_PASS_SELF_3X.join("\n"),
    category: "2 Person Base Patterns",
  },
  {
    name: "Phoenician Waltz",
    instructions: RAW_DATA_PASS_PASS_SELF_3X.join("\n"),
    manipulators: ["sA - - sA - - i1A - -"],
    category: "Manipulation Patterns",
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
    category: "Manipulation Patterns",
  },
  {
    name: "4-count",
    instructions: RAW_DATA_4_COUNT_PASSING.join("\n"),
    category: "2 Person Base Patterns",
  },
  {
    name: "4-count 2x",
    instructions: RAW_DATA_4_COUNT_PASSING_2X.join("\n"),
    category: "2 Person Base Patterns",
  },
  {
    name: "3-count Roundabout",
    instructions: RAW_DATA_3_COUNT_PASSING_2X.join("\n"),
    manipulators: ["- - - sa - i1b"],
    category: "Manipulation Patterns",
  },
  {
    name: "4-count Roundabout",
    instructions: RAW_DATA_4_COUNT_PASSING_2X.join("\n"),
    manipulators: ["sa - sb - ia -"],
    category: "Manipulation Patterns",
  },
  {
    name: "Ronjabout",
    instructions: [
      "4B 3  5  3  4B 3  5  3  4B",
      "3  4A 3  3  3  4A 3  3  3",
      // !
    ].join("\n"),
    manipulators: ["sa - - sb - ia - - -"],
    category: "Manipulation Patterns",
  },
  {
    name: "Walking feed 9c",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    category: "3 Person Base Patterns",
  },
  {
    name: "Walking feed 9c 2x",
    instructions: RAW_DATA_WALKING_FEED_9C_2X.join("\n"),
    category: "3 Person Base Patterns",
  },
  {
    name: "Scrambled - iB cB sA - B",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    // Standard notation: ["iB cB sA", "#2.4", "Unscrambled B"],
    manipulators: ["i2A - - - sB -"],
    category: "Scrambled",
  },
  {
    name: "Scrambled - iA cC sC - Ivy",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    manipulators: ["i2B - - - sC -"],
    category: "Scrambled",
  },
  {
    name: "Scrambled - cB sC iC - Postmen",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    // Standard notation: ["cB sC iC", "#1.9", "Postmen"],
    manipulators: ["- - sA - i2C -"],
    category: "Scrambled",
  },
  {
    name: "Scrambled - cB sB iC - Toast",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    manipulators: ["sA - i2A - - -"],
    category: "Scrambled",
  },
  {
    name: "Scrambled - cB sB iC - V",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    manipulators: ["- - sB - i2C -"],
    category: "Scrambled",
  },
  {
    name: "Walking feed 10c",
    instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
    category: "3 Person Base Patterns",
  },
  {
    name: "Ambled - Choptopus",
    instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
    manipulators: ["- sB - i2c - - -"],
    category: "Ambled",
  },
  {
    name: "7-club PPS-about",
    instructions: [
      "4b 4b 3 4b 4b 3 4b 4b 3 4b 4b 3 -> A",
      "3 3a 4a 3 3a 4a 3 3a 4a 3 3a 4a -> B",
    ].join("\n"),
    manipulators: ["- iA - - - - - iB"],
    category: "Manipulation Patterns",
  },
  {
    name: "5-count popcorn",
    instructions: "7a666",
    category: "2 Person Asynchronous Patterns",
  },
  {
    name: "7-club one-count",
    instructions: "777777777",
    category: "2 Person Asynchronous Patterns",
  },
  {
    name: "786 - French 3-count",
    instructions: "786786786",
    category: "2 Person Asynchronous Patterns",
  },
  {
    name: "777786 - Example of Period 6",
    instructions: "777786777786",
    category: "2 Person Asynchronous Patterns",
  },
  {
    name: "975 - Holy Grail",
    instructions: "975975975",
    category: "2 Person Asynchronous Patterns",
  },
  {
    name: "Muckabout (TODO)",
    instructions: ["3 3c 3 3 3b 3", "3 3 3 3 3a 3", "3 3a 3 3 3 3"].join("\n"),
    manipulators: ["- sa - i2c - -", "i2b - - - sb -"],
    warningNote: "Instructions for this pattern are unfinished / unverified.",
    category: "Manipulation Patterns",
  },
  {
    name: "Dolby 5.1",
    instructions: ["3B 3  3  3  3", "3A 3  3  3  3"].join("\n"),
    manipulators: ["sA i2B -  -  -"],
    warningNote:
      "The carry is crossing, which the orbits calculation does not handle yet!",
    category: "Manipulation Patterns",
  },
  {
    name: "Dolby 5.1 with Doppelgänger",
    instructions: ["3B 3  3  3  3", "3A 3  3  3  3"].join("\n"),
    manipulators: ["sA i2B -  -  -", "sB i2A -  -  -"],
    warningNote:
      "The carry is crossing, which the orbits calculation does not handle yet!",
    category: "Manipulation Patterns",
  },
  {
    name: "Dumb Ways to Die",
    instructions: [
      "3B 3C 3 3B 3C 3 3C 3B 3 3C 3B 3 -> A",
      "3A 3  3 3A 3  3 3  3A 3 3  3A 3 -> B",
      "3  3A 3 3  3A 3 3A 3  3 3A 3  3 -> C",
    ].join("\n"),
    manipulators: ["- i1A - - - i2B - - - i1C - -"],
    category: "Manipulation Patterns",
  },
];

export function sanitizePresetName(name: string) {
  return name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

/** Returns a preset by looking it up by its sanitized name. */
export function findPresetByName(name: string): Preset | null {
  return (
    ALL_PRESETS.find((preset) => sanitizePresetName(preset.name) === name) ??
    null
  );
}

const DEFAULT_CATEGORY = "";

/**
 * Returns presets grouped by category, with presets sorted alphabetically within each group.
 * Categories are sorted with the default (uncategorized) group first, then alphabetically.
 */
export function getPresetsGroupedByCategory(): Array<[string, Preset[]]> {
  const grouped = _.groupBy(ALL_PRESETS, (p) => p.category ?? DEFAULT_CATEGORY);

  // Sort presets within each category alphabetically
  for (const category of Object.keys(grouped)) {
    grouped[category] = _.sortBy(grouped[category], (p) =>
      p.name.toLowerCase(),
    );
  }

  // Get categories sorted: default first, then alphabetically
  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === DEFAULT_CATEGORY) return -1;
    if (b === DEFAULT_CATEGORY) return 1;
    return a.localeCompare(b);
  });

  return categories.map((cat) => [cat, grouped[cat]]);
}
