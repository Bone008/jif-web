/** @file Exports patterns that are used throughout the code. */

import { prechacToJif } from "./high_level_converter";
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
export const DATA_3_COUNT_PASSING: JIF = prechacToJif(RAW_DATA_3_COUNT_PASSING);
export const RAW_DATA_3_COUNT_PASSING_2X: string[] = [
  "3B 3  3  3B 3  3",
  "3A 3  3  3A 3  3",
];
export const DATA_3_COUNT_PASSING_2X: JIF = prechacToJif(
  RAW_DATA_3_COUNT_PASSING_2X
);

export const RAW_DATA_4_COUNT_PASSING: string[] = [
  "3B 3  3  3", //
  "3A 3  3  3",
];
export const DATA_4_COUNT_PASSING: JIF = prechacToJif(RAW_DATA_4_COUNT_PASSING);

export const RAW_DATA_4_COUNT_PASSING_2X: string[] = [
  "3B 3  3  3  3B 3  3  3",
  "3A 3  3  3  3A 3  3  3",
];
export const DATA_4_COUNT_PASSING_2X: JIF = prechacToJif(
  RAW_DATA_4_COUNT_PASSING_2X
);

export const RAW_DATA_WEIRD_PASSING: string[] = [
  // Made to test intercept of B at beat 4.
  "4 4 4 4 4 4 4 4 4 4 4 4 4 4",
  "4 4 4 4 4 4 4 5 3 4 4 4 4 4",
];
export const DATA_WEIRD_PASSING: JIF = prechacToJif(RAW_DATA_WEIRD_PASSING);

export const RAW_DATA_WALKING_FEED_9C: string[] = [
  "3B 3  3C 3  3B 3 ",
  "3A 3  3  3  3A 3 ",
  "3  3  3A 3  3  3 ",
];
export const DATA_WALKING_FEED_9C: JIF = prechacToJif(RAW_DATA_WALKING_FEED_9C);

export const RAW_DATA_WALKING_FEED_9C_2X: string[] = [
  "3B 3  3C 3  3B 3  3C 3  3  3  3C 3",
  "3A 3  3  3  3A 3  3  3  3C 3  3  3",
  "3  3  3A 3  3  3  3A 3  3B 3  3A 3",
];
export const DATA_WALKING_FEED_9C_2X: JIF = prechacToJif(
  RAW_DATA_WALKING_FEED_9C_2X
);

export const RAW_DATA_WALKING_FEED_10C: string[] = [
  "4B 3  4C 3  4B 3  4C",
  "3  4A 3  3  3  4A 4 ",
  "2  3  3  4A 3  3  3 ",
];
export const DATA_WALKING_FEED_10C: JIF = prechacToJif(
  RAW_DATA_WALKING_FEED_10C
);

// ### Manipulations ###

// 3-count roundabout
// manipulator = [
//   { type: 'substitute', throwTime: 0, throwFromJuggler: 0 },
//   { type: 'intercept1b', throwTime: 2, throwFromJuggler: 1 },
// ];

// 4-count roundabout
// manipulator = [
//   { type: 'substitute', throwTime: 0, throwFromJuggler: 0 },
//   { type: 'substitute', throwTime: 2, throwFromJuggler: 1 },
//   { type: 'intercept2b', throwTime: 4, throwFromJuggler: 0 },
// ];

// Scrambled B
// manipulator = [
//   { type: 'intercept2b', throwTime: 0, throwFromJuggler: 0 },
//   { type: 'substitute', throwTime: 4, throwFromJuggler: 1 },
// ];

// // V
// const m: ManipulatorInstruction[] = [
//   { type: 'substitute', throwTime: 2, throwFromJuggler: 1 },
//   { type: 'intercept2b', throwTime: 4, throwFromJuggler: 2 },
// ];
// console.log('Using manipulation:', formatManipulator(data, m, true));
// manipulator = m);

// // Ivy
// manipulator = [
//   { type: 'intercept2b', throwTime: 0, throwFromJuggler: 1 },
//   { type: 'substitute', throwTime: 4, throwFromJuggler: 2 },
// ];

// Choptopus
// manipulator = [
//   { type: "substitute", throwTime: 1, throwFromJuggler: 1 },
//   { type: "intercept2b", throwTime: 3, throwFromJuggler: 2 },
// ];
