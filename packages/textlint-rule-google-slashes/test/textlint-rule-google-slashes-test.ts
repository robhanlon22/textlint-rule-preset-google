// MIT © 2017 azu
import TextLintTester from "textlint-tester";
import rule from "../src/textlint-rule-google-slashes.js";
const tester = new TextLintTester();
tester.run("textlint-rule-google-slashes", rule as GoogleRuleModule, {
  valid: [
    "For example, a disaster relief map is not subject to the usage limits even if it has been developed and is hosted by a commercial entity.",
    "For example, a disaster relief map is not subject to the usage limits even if it has been developed or is hosted by a commercial entity.",
    "Call this method five or six times.",
    "This is link.\nThat is ignored.\nThis is <https://developers.google.com/cardboard/>",
    "¾",
    "0.75",
    "75%",
    "care of, with",
    // Allow to write URL and link
    "This is https://github.com/almin/almin/tree/master/examples/todomvc",
    "- https://github.com/almin/almin/tree/master/examples/todomvc\n",
    '- [almin/examples/counter/test at master · almin/almin](https://github.com/almin/almin/tree/master/examples/counter/test "almin/examples/counter/test at master · almin/almin")',
    '[almin/examples/counter/test at master · almin/almin](https://github.com/almin/almin/tree/master/examples/counter/test "almin/examples/counter/test at master · almin/almin")',
    "Use the path src/docs for this example.",
    "Install the tool from /usr/local/bin.",
    "Use October 31, 2025 for this release date.",
  ],
  invalid: [
    // Slashes with dates
    {
      text: "Schedule maintenance for 10/31/2025.",
      errors: [
        {
          message: `Don't use slashes with dates.
https://developers.google.com/style/slashes#slashes-with-dates
`,
        },
      ],
    },
    {
      text: "The build was cut on 2025/10/31.",
      errors: [
        {
          message: `Don't use slashes with dates.
https://developers.google.com/style/slashes#slashes-with-dates
`,
        },
      ],
    },
    // Slashes with alternatives
    {
      text: "For example, a disaster relief map is not subject to the usage limits even if it has been developed/hosted by a commercial entity.",
      errors: [
        {
          message: `Don't use slashes to separate alternatives.
https://developers.google.com/style/slashes#slashes-with-alternatives
`,
        },
      ],
    },
    {
      text: "Call this method 5/6 times.",
      errors: [
        {
          message: `Don't use slashes with fractions, as they can be ambiguous.
https://developers.google.com/style/slashes#slashes-with-fractions
`,
        },
      ],
    },
    // Slashes with fractions
    {
      text: "3/4",
      errors: [
        {
          message: `Don't use slashes with fractions, as they can be ambiguous.
https://developers.google.com/style/slashes#slashes-with-fractions
`,
        },
      ],
    },
    // Slashes with abbreviations
    {
      text: "Mr. Taro Tanaka c/o Mr. Smith ",
      output: "Mr. Taro Tanaka care of Mr. Smith ",
      errors: [
        {
          message: `Don't use abbreviations that rely on slashes. Instead, spell the words out.
https://developers.google.com/style/slashes#slashes-with-abbreviations
`,
        },
      ],
    },
    {
      text: "lint w/ textlint",
      output: "lint with textlint",
      errors: [
        {
          message: `Don't use abbreviations that rely on slashes. Instead, spell the words out.
https://developers.google.com/style/slashes#slashes-with-abbreviations
`,
        },
      ],
    },
    {
      text: "Use L/R when discussing stereo panning.",
      output: "Use L/R when discussing stereo panning.",
      errors: [
        {
          message: `Don't use abbreviations that rely on slashes. Instead, spell the words out.
https://developers.google.com/style/slashes#slashes-with-abbreviations
`,
        },
      ],
    },
    {
      text: "Use M/S in your mastering chain.",
      output: "Use M/S in your mastering chain.",
      errors: [
        {
          message: `Don't use abbreviations that rely on slashes. Instead, spell the words out.
https://developers.google.com/style/slashes#slashes-with-abbreviations
`,
        },
      ],
    },
  ],
});
