// MIT © 2017 azu
import TextLintTester from "textlint-tester";
import rule from "../src/textlint-rule-google-plurals-parentheses.js";
const tester = new TextLintTester();
const pluralParenthesesMessage =
  "Don't put optional plurals in parentheses.\nURL: https://developers.google.com/style/plurals-parentheses";
tester.run(
  "textlint-rule-google-plurals-parentheses",
  rule as GoogleRuleModule,
  {
    valid: [
      "To find your API key, visit the Credentials page.",
      "The value of the parent depends on the values of its children.",
    ],
    invalid: [
      {
        text: "To find your API key(s), visit the Credentials page.",
        output: "To find your API key(s), visit the Credentials page.",
        errors: [
          {
            index: 17,
            message: pluralParenthesesMessage,
          },
        ],
      },
      {
        text: "The value of the parent depends on the value(s) of its child(ren).",
        output:
          "The value of the parent depends on the value(s) of its child(ren).",
        errors: [
          {
            index: 39,
            message: pluralParenthesesMessage,
          },
          {
            index: 55,
            message: pluralParenthesesMessage,
          },
        ],
      },
    ],
  },
);
