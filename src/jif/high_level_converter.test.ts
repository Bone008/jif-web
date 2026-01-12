import { describe, expect, it } from "vitest";
import {
  parseManipulator,
  prechacToJif,
  siteswapToJIF,
} from "./high_level_converter";
import {
  RAW_DATA_3_COUNT_PASSING,
  RAW_DATA_3_COUNT_PASSING_2X,
  RAW_DATA_4_COUNT_PASSING,
  RAW_DATA_WALKING_FEED_10C,
  RAW_DATA_WALKING_FEED_9C,
} from "./test_data";

describe("siteswapToJIF", () => {
  it("converts 2-juggler 5-count popcorn (a6786)", () => {
    const result = siteswapToJIF("a6786", 2);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 1,
          },
          {
            "becomes": 0,
          },
        ],
        "throws": [
          {
            "duration": 10,
          },
          {
            "duration": 6,
          },
          {
            "duration": 7,
          },
          {
            "duration": 8,
          },
          {
            "duration": 6,
          },
        ],
      }
    `);
  });

  it("converts 2-juggler why not (77862)", () => {
    const result = siteswapToJIF("77862", 2);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 1,
          },
          {
            "becomes": 0,
          },
        ],
        "throws": [
          {
            "duration": 7,
          },
          {
            "duration": 7,
          },
          {
            "duration": 8,
          },
          {
            "duration": 6,
          },
          {
            "duration": 2,
          },
        ],
      }
    `);
  });

  it("converts 2-juggler holy grail (975)", () => {
    const result = siteswapToJIF("975", 2);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 1,
          },
          {
            "becomes": 0,
          },
        ],
        "throws": [
          {
            "duration": 9,
          },
          {
            "duration": 7,
          },
          {
            "duration": 5,
          },
        ],
      }
    `);
  });

  it("converts single juggler cascade (3)", () => {
    const result = siteswapToJIF("3", 1);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 0,
          },
        ],
        "throws": [
          {
            "duration": 3,
          },
        ],
      }
    `);
  });

  it("handles whitespace and special characters in input", () => {
    const result = siteswapToJIF("7 7 8 6 2", 2);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 1,
          },
          {
            "becomes": 0,
          },
        ],
        "throws": [
          {
            "duration": 7,
          },
          {
            "duration": 7,
          },
          {
            "duration": 8,
          },
          {
            "duration": 6,
          },
          {
            "duration": 2,
          },
        ],
      }
    `);
  });

  it("converts 3-juggler pattern (966)", () => {
    const result = siteswapToJIF("966", 3);
    expect(result).toMatchInlineSnapshot(`
      {
        "jugglers": [
          {
            "becomes": 0,
          },
          {
            "becomes": 1,
          },
          {
            "becomes": 2,
          },
        ],
        "throws": [
          {
            "duration": 9,
          },
          {
            "duration": 6,
          },
          {
            "duration": 6,
          },
        ],
      }
    `);
  });
});

describe("prechacToJif", () => {
  it("converts 3-count passing", () => {
    const result = prechacToJif(RAW_DATA_3_COUNT_PASSING);
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
          },
          {
            "juggler": 0,
            "kind": "left_hand",
          },
          {
            "juggler": 1,
            "kind": "right_hand",
          },
          {
            "juggler": 1,
            "kind": "left_hand",
          },
        ],
        "throws": [
          {
            "duration": 3,
            "from": 0,
            "time": 0,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 1,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 0,
            "time": 2,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 0,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 1,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 2,
            "to": 3,
          },
        ],
      }
    `);
  });

  it("converts 3-count passing 2x", () => {
    const result = prechacToJif(RAW_DATA_3_COUNT_PASSING_2X);
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
          },
          {
            "juggler": 0,
            "kind": "left_hand",
          },
          {
            "juggler": 1,
            "kind": "right_hand",
          },
          {
            "juggler": 1,
            "kind": "left_hand",
          },
        ],
        "throws": [
          {
            "duration": 3,
            "from": 0,
            "time": 0,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 1,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 0,
            "time": 2,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 3,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 0,
            "time": 4,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 5,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 0,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 1,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 2,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 3,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 4,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 5,
            "to": 2,
          },
        ],
      }
    `);
  });

  it("converts 4-count passing", () => {
    const result = prechacToJif(RAW_DATA_4_COUNT_PASSING);
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
          },
          {
            "juggler": 0,
            "kind": "left_hand",
          },
          {
            "juggler": 1,
            "kind": "right_hand",
          },
          {
            "juggler": 1,
            "kind": "left_hand",
          },
        ],
        "throws": [
          {
            "duration": 3,
            "from": 0,
            "time": 0,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 1,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 0,
            "time": 2,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 3,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 0,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 1,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 2,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 3,
            "to": 2,
          },
        ],
      }
    `);
  });

  it("converts 3-juggler walking feed 9c", () => {
    const result = prechacToJif(RAW_DATA_WALKING_FEED_9C);
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
          },
          {
            "juggler": 0,
            "kind": "left_hand",
          },
          {
            "juggler": 1,
            "kind": "right_hand",
          },
          {
            "juggler": 1,
            "kind": "left_hand",
          },
          {
            "juggler": 2,
            "kind": "right_hand",
          },
          {
            "juggler": 2,
            "kind": "left_hand",
          },
        ],
        "throws": [
          {
            "duration": 3,
            "from": 0,
            "time": 0,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 1,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 0,
            "time": 2,
            "to": 5,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 3,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 0,
            "time": 4,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 5,
            "to": 0,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 0,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 1,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 2,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 3,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 4,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 5,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 4,
            "time": 0,
            "to": 5,
          },
          {
            "duration": 3,
            "from": 5,
            "time": 1,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 4,
            "time": 2,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 5,
            "time": 3,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 4,
            "time": 4,
            "to": 5,
          },
          {
            "duration": 3,
            "from": 5,
            "time": 5,
            "to": 4,
          },
        ],
      }
    `);
  });

  it("converts 3-juggler walking feed 10c", () => {
    const result = prechacToJif(RAW_DATA_WALKING_FEED_10C);
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
          },
          {
            "juggler": 0,
            "kind": "left_hand",
          },
          {
            "juggler": 1,
            "kind": "right_hand",
          },
          {
            "juggler": 1,
            "kind": "left_hand",
          },
          {
            "juggler": 2,
            "kind": "right_hand",
          },
          {
            "juggler": 2,
            "kind": "left_hand",
          },
        ],
        "throws": [
          {
            "duration": 4,
            "from": 0,
            "time": 0,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 1,
            "to": 0,
          },
          {
            "duration": 4,
            "from": 0,
            "time": 2,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 3,
            "to": 0,
          },
          {
            "duration": 4,
            "from": 0,
            "time": 4,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 1,
            "time": 5,
            "to": 0,
          },
          {
            "duration": 4,
            "from": 0,
            "time": 6,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 0,
            "to": 3,
          },
          {
            "duration": 4,
            "from": 3,
            "time": 1,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 2,
            "to": 3,
          },
          {
            "duration": 3,
            "from": 3,
            "time": 3,
            "to": 2,
          },
          {
            "duration": 3,
            "from": 2,
            "time": 4,
            "to": 3,
          },
          {
            "duration": 4,
            "from": 3,
            "time": 5,
            "to": 1,
          },
          {
            "duration": 4,
            "from": 2,
            "time": 6,
            "to": 2,
          },
          {
            "duration": 2,
            "from": 4,
            "time": 0,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 5,
            "time": 1,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 4,
            "time": 2,
            "to": 5,
          },
          {
            "duration": 4,
            "from": 5,
            "time": 3,
            "to": 1,
          },
          {
            "duration": 3,
            "from": 4,
            "time": 4,
            "to": 5,
          },
          {
            "duration": 3,
            "from": 5,
            "time": 5,
            "to": 4,
          },
          {
            "duration": 3,
            "from": 4,
            "time": 6,
            "to": 5,
          },
        ],
      }
    `);
  });

  it("handles custom juggler labels", () => {
    const result = prechacToJif(["Alice: 3B 3 3", "Bob: 3A 3 3"]);
    expect(result.jugglers).toMatchInlineSnapshot(`
      [
        {
          "becomes": 1,
          "label": "Alice",
        },
        {
          "becomes": 0,
          "label": "Bob",
        },
      ]
    `);
  });

  it("handles explicit relabeling with arrow notation", () => {
    const result = prechacToJif(["3 3 3 -> A", "3 3 3 -> B"]);
    expect(result.jugglers).toMatchInlineSnapshot(`
      [
        {
          "becomes": 0,
          "label": "A",
        },
        {
          "becomes": 1,
          "label": "B",
        },
      ]
    `);
  });
});

describe("parseManipulator", () => {
  it("parses substitute instruction", () => {
    const result = parseManipulator("sA");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "throwFromJuggler": 0,
          "throwTime": 0,
          "type": "substitute",
        },
      ]
    `);
  });

  it("parses intercept 2-beat instruction", () => {
    const result = parseManipulator("i2B");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "throwFromJuggler": 1,
          "throwTime": 0,
          "type": "intercept2b",
        },
      ]
    `);
  });

  it("parses intercept 1-beat instruction", () => {
    const result = parseManipulator("i1C");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "throwFromJuggler": 2,
          "throwTime": 0,
          "type": "intercept1b",
        },
      ]
    `);
  });

  it("parses shorthand intercept as 2-beat", () => {
    const result = parseManipulator("iA");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "throwFromJuggler": 0,
          "throwTime": 0,
          "type": "intercept2b",
        },
      ]
    `);
  });

  it("parses 3-count roundabout manipulator", () => {
    const result = parseManipulator("sA - i1B");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "throwFromJuggler": 0,
          "throwTime": 0,
          "type": "substitute",
        },
        {
          "throwFromJuggler": 1,
          "throwTime": 2,
          "type": "intercept1b",
        },
      ]
    `);
  });

  it("parses 4-count roundabout manipulator", () => {
    const result = parseManipulator("sA - sB - i2A");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "throwFromJuggler": 0,
          "throwTime": 0,
          "type": "substitute",
        },
        {
          "throwFromJuggler": 1,
          "throwTime": 2,
          "type": "substitute",
        },
        {
          "throwFromJuggler": 0,
          "throwTime": 4,
          "type": "intercept2b",
        },
      ]
    `);
  });

  it("parses scrambled B manipulator", () => {
    const result = parseManipulator("i2A - - - sB");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "throwFromJuggler": 0,
          "throwTime": 0,
          "type": "intercept2b",
        },
        {
          "throwFromJuggler": 1,
          "throwTime": 4,
          "type": "substitute",
        },
      ]
    `);
  });

  it("handles multiple consecutive dashes", () => {
    const result = parseManipulator("sA --- iB");
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "throwFromJuggler": 0,
          "throwTime": 0,
          "type": "substitute",
        },
        {
          "throwFromJuggler": 1,
          "throwTime": 2,
          "type": "intercept2b",
        },
      ]
    `);
  });
});
