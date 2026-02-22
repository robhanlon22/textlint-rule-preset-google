// MIT © 2017 azu
import TextLintTester from "textlint-tester";
const tester = new TextLintTester();
import rule from "../src/textlint-rule-google-hyphens.js";
tester.run("textlint-rule-google-hyphens", rule as GoogleRuleModule, {
  valid: [
    "The app uses Android-specific techniques.",
    "The app uses techniques that are Android specific.",
  ],
  invalid: [
    // When to hyphenate
    {
      text: "The app uses Android specific techniques.",
      output: "The app uses Android specific techniques.",
      errors: [{}],
    },
    // Compound words
    {
      text: "Provide a command line interface.",
      output: "Provide a command line interface.",
      errors: [{}],
    },
    // Adverbs ending in "ly"
    {
      text: "Free, simple, and publicly-available implementations",
      output: "Free, simple, and publicly-available implementations",
      errors: [
        {
          index: 18,
        },
      ],
    },
    {
      text: "To get profile information for the currently-authorized user",
      output: "To get profile information for the currently-authorized user",
      errors: [
        {
          index: 35,
        },
      ],
    },
    //Range of numbers
    {
      text: "from 8-20 files",
      output: "from 8-20 files",
      errors: [{}],
    },
    {
      text: "between 8-20 files",
      output: "between 8-20 files",
      errors: [{}],
    },
  ],
});
