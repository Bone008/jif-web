import {
  RAW_DATA_3_COUNT_PASSING,
  RAW_DATA_3_COUNT_PASSING_2X,
  RAW_DATA_4_COUNT_PASSING,
  RAW_DATA_4_COUNT_PASSING_2X,
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
  },
  {
    name: "Happy Holds",
    instructions: ["2 2 2 2 2 2", "2 2 2 2 2 2"].join("\n"),
  },
  { name: "3-count", instructions: RAW_DATA_3_COUNT_PASSING.join("\n") },
  { name: "3-count 2x", instructions: RAW_DATA_3_COUNT_PASSING_2X.join("\n") },
  {
    name: "Phoenician Waltz",
    instructions: [
      "3B 3B  3  3B 3B  3  3B 3B  3",
      "3A 3A  3  3A 3A  3  3A 3A  3",
    ].join("\n"),
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
  { name: "4-count", instructions: RAW_DATA_4_COUNT_PASSING.join("\n") },
  { name: "4-count 2x", instructions: RAW_DATA_4_COUNT_PASSING_2X.join("\n") },
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
      // !
    ].join("\n"),
    manipulators: ["sa - - sb - ia - - -"],
  },
  {
    name: "Walking feed 9c",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
  },
  {
    name: "Walking feed 9c 2x",
    instructions: RAW_DATA_WALKING_FEED_9C_2X.join("\n"),
  },
  {
    name: "Scrambled - iB cB sA - B",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    // Standard notation: ["iB cB sA", "#2.4", "Unscrambled B"],
    manipulators: ["i2A - - - sB -"],
  },
  {
    name: "Scrambled - iA cC sC - Ivy",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    manipulators: ["i2B - - - sC -"],
  },
  {
    name: "Scrambled - cB sC iC - Postmen",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    // Standard notation: ["cB sC iC", "#1.9", "Postmen"],
    manipulators: ["- - sA - i2C -"],
  },
  {
    name: "Scrambled - cB sB iC - Toast",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    manipulators: ["sA - i2A - - -"],
  },
  {
    name: "Scrambled - cB sB iC - V",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    manipulators: ["- - sB - i2C -"],
  },
  {
    name: "Walking feed 10c",
    instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
  },
  {
    name: "Ambled - Choptopus",
    instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
    manipulators: ["- sB - i2c - - -"],
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
    name: "5-count popcorn",
    instructions: "7a666",
  },
  {
    name: "7-club one-count",
    instructions: "777777777",
  },
  {
    name: "786 - French 3-count",
    instructions: "786786786",
  },
  {
    name: "975 - Holy Grail",
    instructions: "975975975",
  },
  {
    name: "777786 - Example of Period 6",
    instructions: "777786777786",
  },
  {
    name: "975 - Holy Grail",
    instructions: "975975975",
  },
  {
    name: "TODO: Muckabout",
    instructions: ["3 3c 3 3 3b 3", "3 3 3 3 3a 3", "3 3a 3 3 3 3"].join("\n"),
    manipulators: ["- sa - i2c - -", "i2b - - - sb -"],
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
];

export function sanitizePresetName(name: string) {
  return name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

export function findPresetByName(name: string): Preset | null {
  return (
    ALL_PRESETS.find((preset) => sanitizePresetName(preset.name) === name) ??
    null
  );
}
