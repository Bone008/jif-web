import {
  RAW_DATA_3_COUNT_PASSING,
  RAW_DATA_3_COUNT_PASSING_2X,
  RAW_DATA_4_COUNT_PASSING,
  RAW_DATA_4_COUNT_PASSING_2X,
  RAW_DATA_WALKING_FEED_9C,
  RAW_DATA_WALKING_FEED_9C_2X,
  RAW_DATA_WALKING_FEED_10C,
  DATA_5_COUNT_POPCORN,
  DATA_HOLY_GRAIL,
} from "./test_data";

interface Preset {
  name: string;
  instructions: string;
  manipulators?: string[];
  category?: string;
}

export const ALL_PRESETS: Preset[] = [
  { name: "3-count", instructions: RAW_DATA_3_COUNT_PASSING.join("\n") },
  { name: "3-count 2x", instructions: RAW_DATA_3_COUNT_PASSING_2X.join("\n") },
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
    name: "Scrambled B",
    instructions: RAW_DATA_WALKING_FEED_9C.join("\n"),
    manipulators: ["iiA - - - sB"],
  },
  {
    name: "Walking feed 10c",
    instructions: RAW_DATA_WALKING_FEED_10C.join("\n"),
  },
  {
    name: "5-count popcorn",
    instructions: JSON.stringify(DATA_5_COUNT_POPCORN, null, 2),
  },
  {
    name: "Holy Grail",
    instructions: JSON.stringify(DATA_HOLY_GRAIL, null, 2),
  },
];
