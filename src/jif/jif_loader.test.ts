import { describe, it, expect } from "vitest";
import { loadWithDefaults } from "./jif_loader";
import { prechacToJif } from "./high_level_converter";
import { DATA_5_COUNT_POPCORN, RAW_DATA_WALKING_FEED_9C } from "./test_data";

const RAW_RONJABOUT = [
  "4B 3  5  3  4B 3  5  3  4B",
  "3  4A 3  3  3  4A 3  3  3",
];

describe("loadWithDefaults", () => {
  it("loads 3-juggler walking feed 9c with full defaults", () => {
    const jif = prechacToJif(RAW_DATA_WALKING_FEED_9C);
    const result = loadWithDefaults(jif);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 1,
            "label": "A",
          },
          {
            "becomes": 2,
            "label": "B",
          },
          {
            "becomes": 0,
            "label": "C",
          },
        ],
        "limbs": [
          {
            "juggler": 0,
            "kind": "right_hand",
            "label": "R",
            "type": "right hand",
          },
          {
            "juggler": 0,
            "kind": "left_hand",
            "label": "L",
            "type": "left hand",
          },
          {
            "juggler": 1,
            "kind": "right_hand",
            "label": "R",
            "type": "right hand",
          },
          {
            "juggler": 1,
            "kind": "left_hand",
            "label": "L",
            "type": "left hand",
          },
          {
            "juggler": 2,
            "kind": "right_hand",
            "label": "R",
            "type": "right hand",
          },
          {
            "juggler": 2,
            "kind": "left_hand",
            "label": "L",
            "type": "left hand",
          },
        ],
        "objects": [],
        "repetition": {
          "limbPermutation": [
            2,
            3,
            4,
            5,
            0,
            1,
          ],
          "period": 6,
        },
        "throws": [
          {
            "duration": 3,
            "from": 0,
            "isManipulated": false,
            "time": 0,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 1,
            "isManipulated": false,
            "time": 1,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 0,
            "isManipulated": false,
            "time": 2,
            "to": 5,
          },
          {
            "duration": 3,
            "from": 1,
            "isManipulated": false,
            "time": 3,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 0,
            "isManipulated": false,
            "time": 4,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 1,
            "isManipulated": false,
            "time": 5,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 2,
            "isManipulated": false,
            "time": 0,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 3,
            "isManipulated": false,
            "time": 1,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "isManipulated": false,
            "time": 2,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 3,
            "isManipulated": false,
            "time": 3,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "isManipulated": false,
            "time": 4,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 3,
            "isManipulated": false,
            "time": 5,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 4,
            "isManipulated": false,
            "time": 0,
            "to": 5,
          },
          {
            "duration": 3,
            "from": 5,
            "isManipulated": false,
            "time": 1,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 4,
            "isManipulated": false,
            "time": 2,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 5,
            "isManipulated": false,
            "time": 3,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 4,
            "isManipulated": false,
            "time": 4,
            "to": 5,
          },
          {
            "duration": 3,
            "from": 5,
            "isManipulated": false,
            "time": 5,
            "to": 4,
          },
        ],
      }
    `);
  });

  it("loads 5-count popcorn with full defaults", () => {
    const result = loadWithDefaults(DATA_5_COUNT_POPCORN);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 1,
            "label": "A",
          },
          {
            "becomes": 0,
            "label": "B",
          },
        ],
        "limbs": [
          {
            "juggler": 0,
            "kind": "right_hand",
            "label": "R",
            "type": "right hand",
          },
          {
            "juggler": 1,
            "kind": "right_hand",
            "label": "R",
            "type": "right hand",
          },
          {
            "juggler": 0,
            "kind": "left_hand",
            "label": "L",
            "type": "left hand",
          },
          {
            "juggler": 1,
            "kind": "left_hand",
            "label": "L",
            "type": "left hand",
          },
        ],
        "objects": [],
        "repetition": {
          "limbPermutation": [
            3,
            0,
            1,
            2,
          ],
          "period": 5,
        },
        "throws": [
          {
            "duration": 10,
            "from": 0,
            "isManipulated": false,
            "time": 0,
            "to": 2,
          },
          {
            "duration": 6,
            "from": 1,
            "isManipulated": false,
            "time": 1,
            "to": 3,
          },
          {
            "duration": 6,
            "from": 2,
            "isManipulated": false,
            "time": 2,
            "to": 0,
          },
          {
            "duration": 6,
            "from": 3,
            "isManipulated": false,
            "time": 3,
            "to": 1,
          },
          {
            "duration": 7,
            "from": 0,
            "isManipulated": false,
            "time": 4,
            "to": 3,
          },
        ],
      }
    `);
  });

  it("loads Ronjabout base pattern with full defaults", () => {
    const jif = prechacToJif(RAW_RONJABOUT);
    const result = loadWithDefaults(jif);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 1,
            "label": "A",
          },
          {
            "becomes": 0,
            "label": "B",
          },
        ],
        "limbs": [
          {
            "juggler": 0,
            "kind": "right_hand",
            "label": "R",
            "type": "right hand",
          },
          {
            "juggler": 0,
            "kind": "left_hand",
            "label": "L",
            "type": "left hand",
          },
          {
            "juggler": 1,
            "kind": "right_hand",
            "label": "R",
            "type": "right hand",
          },
          {
            "juggler": 1,
            "kind": "left_hand",
            "label": "L",
            "type": "left hand",
          },
        ],
        "objects": [],
        "repetition": {
          "limbPermutation": [
            3,
            2,
            1,
            0,
          ],
          "period": 9,
        },
        "throws": [
          {
            "duration": 4,
            "from": 0,
            "isManipulated": false,
            "time": 0,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 1,
            "isManipulated": false,
            "time": 1,
            "to": 0,
          },
          {
            "duration": 5,
            "from": 0,
            "isManipulated": false,
            "time": 2,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 1,
            "isManipulated": false,
            "time": 3,
            "to": 0,
          },
          {
            "duration": 4,
            "from": 0,
            "isManipulated": false,
            "time": 4,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 1,
            "isManipulated": false,
            "time": 5,
            "to": 0,
          },
          {
            "duration": 5,
            "from": 0,
            "isManipulated": false,
            "time": 6,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 1,
            "isManipulated": false,
            "time": 7,
            "to": 0,
          },
          {
            "duration": 4,
            "from": 0,
            "isManipulated": false,
            "time": 8,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "isManipulated": false,
            "time": 0,
            "to": 3,
          },
          {
            "duration": 4,
            "from": 3,
            "isManipulated": false,
            "time": 1,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 2,
            "isManipulated": false,
            "time": 2,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 3,
            "isManipulated": false,
            "time": 3,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "isManipulated": false,
            "time": 4,
            "to": 3,
          },
          {
            "duration": 4,
            "from": 3,
            "isManipulated": false,
            "time": 5,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 2,
            "isManipulated": false,
            "time": 6,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 3,
            "isManipulated": false,
            "time": 7,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "isManipulated": false,
            "time": 8,
            "to": 3,
          },
        ],
      }
    `);
  });
});
