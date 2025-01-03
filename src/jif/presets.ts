import {
  RAW_DATA_3_COUNT_PASSING,
  RAW_DATA_3_COUNT_PASSING_2X,
  RAW_DATA_4_COUNT_PASSING,
  RAW_DATA_4_COUNT_PASSING_2X,
  RAW_DATA_WALKING_FEED_10C,
  RAW_DATA_WALKING_FEED_9C,
  RAW_DATA_WALKING_FEED_9C_2X,
} from "./test_data";

interface Preset {
  name: string;
  instructions: string;
  manipulators?: string[];
  category?: string;
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
    name: "3-count 5x with pass intercept",
    instructions: [
      "3B 3  3  3B 3  3  3B 3  3  3B 3  3  3B 3  3",
      "3A 3  3  3A 3  3  3A 3  3  3A 3  3  3A 3  3",
    ].join("\n"),
    manipulators: ["- - - ia"],
  },
  {
    name: "TODO: Dolby 5.1",
    instructions: ["3B 3  3  3  3", "3A 3  3  3  3"].join("\n"),
    manipulators: ["sA iiB -  -  -"],
  },
  {
    name: "TODO: Dolby 5.1 with Doppelgänger",
    instructions: ["3B 3  3  3  3", "3A 3  3  3  3"].join("\n"),
    manipulators: ["sA iiB -  -  -", "sB iiA -  -  -"],
  },
  { name: "4-count", instructions: RAW_DATA_4_COUNT_PASSING.join("\n") },
  { name: "4-count 2x", instructions: RAW_DATA_4_COUNT_PASSING_2X.join("\n") },
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
    manipulators: ["iiA - - - sB"],
  },
  {
    name: "Scrambled - cB sC iC - Postmen",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    // Standard notation: ["cB sC iC", "#1.9", "Postmen"],
    manipulators: ["- - sA - iiC"],
  },
  {
    name: "Scrambled - iA cC sC - Ivy",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    manipulators: ["iiB - - - sC"],
  },
  {
    name: "Walking feed 10c",
    instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
  },
  {
    name: "Ambled - Choptopus",
    instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
    manipulators: ["- sB - iic - - -"],
  },
  {
    name: "5-count popcorn",
    instructions: "a6667",
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
    name: "TODO: Muckabout",
    instructions: ["3 3c 3 3 3b 3", "3 3 3 3 3a 3", "3 3a 3 3 3 3"].join("\n"),
    manipulators: ["- sa - iic - -", "iib - - - sb -"],
  },
];
