import TextLintTester from "textlint-tester";
import rule, {
  presentTenseMessage,
} from "../src/textlint-rule-google-tense.js";

const tester = new TextLintTester();

tester.run("textlint-rule-google-tense", rule as GoogleRuleModule, {
  valid: [
    "The API returns JSON.",
    "The API returns JSON when you call this method.",
    "The new API version will launch next quarter.",
    "This method does return a value.",
    "These methods do return values.",
    "These methods does return values.",
  ],
  invalid: [
    {
      text: "The API will return JSON.",
      output: "The API will return JSON.",
      errors: [
        {
          message: presentTenseMessage,
        },
      ],
    },
    {
      text: "This method would return a value.",
      output: "This method would return a value.",
      errors: [
        {
          message: presentTenseMessage,
        },
      ],
    },
  ],
});
