// MIT © 2017 azu
import TextLintTester from "textlint-tester";
const tester = new TextLintTester();
import rule from "../src/textlint-rule-google-units-of-measure.js";

const NBSP = "\u00A0";

tester.run(
  "textlint-rule-google-units-of-measure.js",
  rule as GoogleRuleModule,
  {
    valid: [
      `Recommended: 64${NBSP}GB is OK.`,
      `Recommended: 2${NBSP}TB is OK.`,
      `Recommended: 23${NBSP}mm is OK.`,
      "Recommended: $10 is OK.",
      "Recommended: £25 is OK.",
      "Recommended: 50° is OK.",
      "Recommended: 65% is OK.",
      `Recommended: 20°${NBSP}C is OK.`,
      `Recommended: 68°${NBSP}F is OK.`,
      "Recommended: On this plan, you are limited to 55k download operations and 20k upload operations per day.",
      "Leave literals unchanged in code: `64GB` and `$ 10`.",
    ],
    invalid: [
      // Use nonbreaking space between number and unit.
      {
        text: "Not recommended: 64GB should be 64 GB.",
        output: `Not recommended: 64${NBSP}GB should be 64${NBSP}GB.`,
        errors: [{}, {}],
      },
      // No space for money.
      {
        text: "This is $ 10.",
        output: "This is $10.",
        errors: [{}],
      },
      // No space for percent.
      {
        text: "This is 65 %.",
        output: "This is 65%.",
        errors: [{}],
      },
      // No space between the number and degree symbol for angles.
      {
        text: "The right turn is 90 °.",
        output: "The right turn is 90°.",
        errors: [{}],
      },
      // Temperature formatting.
      {
        text: "Water freezes at 0°C and boils at 100 ° C.",
        output: `Water freezes at 0°${NBSP}C and boils at 100°${NBSP}C.`,
        errors: [{}, {}],
      },
      // Don't put a space between the number and "k".
      {
        text: "On this plan, you are limited to 55 k download operations and 20k upload operations per day.",
        output:
          "On this plan, you are limited to 55k download operations and 20k upload operations per day.",
        errors: [{}],
      },
    ],
  },
);
