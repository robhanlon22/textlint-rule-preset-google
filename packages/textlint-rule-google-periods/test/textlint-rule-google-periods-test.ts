// MIT © 2017 azu
import TextLintTester from "textlint-tester";
import rule from "../src/textlint-rule-google-periods.js";

const tester = new TextLintTester();
const URL = "https://developers.google.com/style/periods";
const withUrl = (reason: string): string => `${reason}\n${URL}`;

tester.run("textlint-rule-google-periods", rule as GoogleRuleModule, {
  valid: [
    "# Overview",
    "- user name\n- email address",
    "- This setting is recommended for production.\n- This option is required for backups.",
    'Use "Move quickly." as the slogan.',
    "Visit https://example.com for details.",
    "Use this option (for example) when needed.",
    "Set the threshold to 1.5 for this test.",
    "**Figure 1.** Example architecture.",
    "Table 2. API responses",
  ],
  invalid: [
    {
      text: "- user name.\n- email address.",
      errors: [
        {
          message: withUrl(
            "Heuristic check: this list item looks like a fragment, and fragments usually omit terminal periods.",
          ),
        },
        {
          message: withUrl(
            "Heuristic check: this list item looks like a fragment, and fragments usually omit terminal periods.",
          ),
        },
      ],
    },
    {
      text: "Visit https://example.com.",
      errors: [
        {
          message: withUrl(
            "Heuristic check: avoid trailing periods immediately after URLs because readers can mistake the period as part of the URL.",
          ),
        },
      ],
    },
    {
      text: 'She said "Move quickly".',
      errors: [
        {
          message: withUrl(
            "Heuristic check: review period placement with quotation marks. In American style, periods are usually placed inside double quotes unless quoting literal strings.",
          ),
        },
      ],
    },
    {
      text: "Use this option (for example.) when needed.",
      errors: [
        {
          message: withUrl(
            "Heuristic check: parenthetical fragments usually place the sentence period outside the closing parenthesis.",
          ),
        },
      ],
    },
    {
      text: "# Overview.",
      errors: [
        {
          message: withUrl(
            "Headings should not end with terminal punctuation.",
          ),
        },
      ],
    },
    {
      text: "Set the threshold to 1,5 for this test.",
      errors: [
        {
          message: withUrl(
            "Use periods for decimal points in numbers. If this is a decimal value, replace the comma with a period.",
          ),
        },
      ],
    },
    {
      text: "**Figure 1.** Example architecture",
      errors: [
        {
          message: withUrl("Figure captions should end with punctuation."),
        },
      ],
    },
    {
      text: "Table 2. API responses.",
      errors: [
        {
          message: withUrl(
            "Table captions should not end with terminal punctuation.",
          ),
        },
      ],
    },
  ],
});
