import TextLintTester from "textlint-tester";
const tester = new TextLintTester();
// rule
import rule from "../src/textlint-rule-google-exclamation-points.js";
const URL = "\nhttps://developers.google.com/style/exclamation-points";
tester.run(
  "textlint-rule-google-exclamation-points",
  rule as GoogleRuleModule,
  {
    valid: [
      "Don't use exclamation points in text except when they're part of a code example.",
      "Is this enough context?",
      {
        text: "Hey!?",
        options: {
          allowHalfWidthExclamation: true,
        },
      },
    ],
    invalid: [
      // single match
      {
        text: "Hey!",
        errors: [
          {
            message: `Disallow to use "!".` + URL,
            line: 1,
            column: 4,
          },
        ],
      },
      // multiple match in multiple lines
      {
        text: "Hey!?\nHey！？",
        errors: [
          {
            message: `Disallow to use "!".` + URL,
            line: 1,
            column: 4,
          },
          {
            message: `Disallow to use "！".` + URL,
            line: 2,
            column: 4,
          },
        ],
      },
      // multiple hit items in a line
      {
        text: "Hey!?",
        errors: [
          {
            message: `Disallow to use "!".` + URL,
            line: 1,
            column: 4,
          },
        ],
      },
    ],
  },
);
