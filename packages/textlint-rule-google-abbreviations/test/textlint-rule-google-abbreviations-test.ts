// MIT © 2017 azu
import TextLintTester from "textlint-tester";
import rule from "../src/textlint-rule-google-abbreviations.js";
const tester = new TextLintTester();
tester.run("textlint-rule-google-abbreviations", rule as GoogleRuleModule, {
  valid: [
    "anorexia can be caused by cancer, aids, a mental disorder (That is anorexia nervosa), or other diseases.",
    "For example, this is an example",
    "DC is District of Columbia.",
    "District of Columbia is DC.",
  ],

  invalid: [
    {
      text: "e.g. combustion of landfill gas to generate electricity",
      errors: [{ index: 0 }],
    },
    {
      text: "i.e., combustion of landfill gas to generate electricity",
      errors: [{ index: 0 }],
    },
    {
      text: "DC. is District of Columbia",
      output: "DC is District of Columbia",
      errors: [{ index: 0 }],
    },
  ],
});
