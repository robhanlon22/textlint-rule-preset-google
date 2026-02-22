// MIT © 2017 azu
import TextLintTester from "textlint-tester";
import rule from "../src/textlint-rule-google-articles.js";
const tester = new TextLintTester();
tester.run("textlint-rule-google-", rule as GoogleRuleModule, {
  valid: [
    "An hour.",
    "An HTML file.",
    "A hand.",
    "A hotel.",
    "An umbrella.",
    "A union.",
    "An SQL (database)",
    "This is An FAQ.",
    {
      text: "This is a FAQ.",
      options: {
        a: ["FAQ"],
      },
    },
  ],
  invalid: [
    // multiple
    {
      text: "This is an pen.",
      output: "This is an pen.",
      errors: [
        {
          index: 8,
        },
      ],
    },
    {
      text: "This is an pen. This is not A umbrella",
      output: "This is an pen. This is not A umbrella",
      errors: [
        {
          index: 8,
        },
        {
          index: 28,
        },
      ],
    },
  ],
});
