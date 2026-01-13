/** @file Exports patterns that are used throughout the code. */

import { JIF } from "./jif";

export const DATA_5_COUNT_POPCORN: JIF = {
  jugglers: [{ becomes: 1 }, { becomes: 0 }],
  throws: [
    { duration: 10 },
    { duration: 6 },
    { duration: 6 },
    { duration: 6 },
    { duration: 7 },
  ],
};

export const DATA_HOLY_GRAIL: JIF = {
  jugglers: [{ becomes: 1 }, { becomes: 0 }],
  throws: [{ duration: 9 }, { duration: 7 }, { duration: 5 }],
};

export const RAW_DATA_3_COUNT_PASSING: string[] = [
  "3B 3  3", //
  "3A 3  3",
];
export const RAW_DATA_3_COUNT_PASSING_2X: string[] = [
  "3B 3  3  3B 3  3",
  "3A 3  3  3A 3  3",
];

export const RAW_DATA_4_COUNT_PASSING: string[] = [
  "3B 3  3  3", //
  "3A 3  3  3",
];

export const RAW_DATA_4_COUNT_PASSING_2X: string[] = [
  "3B 3  3  3  3B 3  3  3",
  "3A 3  3  3  3A 3  3  3",
];

export const RAW_DATA_PASS_PASS_SELF: string[] = ["3B 3B 3", "3A 3A 3"];

export const RAW_DATA_PASS_PASS_SELF_2X: string[] = [
  "3B 3B 3  3B 3B 3",
  "3A 3A 3  3A 3A 3",
];

export const RAW_DATA_PASS_PASS_SELF_3X: string[] = [
  "3B 3B 3  3B 3B 3  3B 3B 3",
  "3A 3A 3  3A 3A 3  3A 3A 3",
];

export const RAW_DATA_WEIRD_PASSING: string[] = [
  // Made to test intercept of B at beat 4.
  "4 4 4 4 4 4 4 4 4 4 4 4 4 4",
  "4 4 4 4 4 4 4 5 3 4 4 4 4 4",
];

/** 9-club walking feed, base pattern of Scrambleds */
export const RAW_DATA_WALKING_FEED_9C: string[] = [
  "3B 3  3C 3  3B 3 ",
  "3A 3  3  3  3A 3 ",
  "3  3  3A 3  3  3 ",
];

export const RAW_DATA_WALKING_FEED_9C_2X: string[] = [
  "3B 3  3C 3  3B 3  3C 3  3  3  3C 3",
  "3A 3  3  3  3A 3  3  3  3C 3  3  3",
  "3  3  3A 3  3  3  3A 3  3B 3  3A 3",
];

/** 10-club walking feed, base pattern of Ambleds */
export const RAW_DATA_WALKING_FEED_10C: string[] = [
  "4B 3  4C 3  4B 3  4C",
  "3  4A 3  3  3  4A 4 ",
  "2  3  3  4A 3  3  3 ",
];

/** Version of 10-club walking feed where B throws a right-handed double self. */
export const RAW_DATA_WALKING_FEED_10C_RIGHT_HANDED_DS: string[] = [
  "4B 3  4C 3  4B 3  4C",
  "3  4A 3  3  3  4A 3 ",
  "4  2  3  4A 3  3  3 ",
];
