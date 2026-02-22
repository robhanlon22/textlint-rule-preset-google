import TextLintTester from "textlint-tester";
import rule, {
  genderNeutralMessage,
  secondPersonMessage,
} from "../src/textlint-rule-google-pronouns.js";

const tester = new TextLintTester();

tester.run("textlint-rule-google-pronouns", rule as GoogleRuleModule, {
  valid: [
    "You can run the command.",
    "Use they as a singular pronoun when needed.",
    "We deprecated this endpoint in 2026.",
    "Use I/O operations for streaming data.",
    "US English is supported.",
    "[we](https://example.com)",
  ],
  invalid: [
    {
      text: "He can run the command.",
      output: "He can run the command.",
      errors: [
        {
          message: genderNeutralMessage,
        },
      ],
    },
    {
      text: "She can update the profile.",
      output: "She can update the profile.",
      errors: [
        {
          message: genderNeutralMessage,
        },
      ],
    },
    {
      text: "I can click the button.",
      output: "I can click the button.",
      errors: [
        {
          message: secondPersonMessage,
        },
      ],
    },
    {
      text: "My account is configured for this example.",
      output: "My account is configured for this example.",
      errors: [
        {
          message: secondPersonMessage,
        },
      ],
    },
  ],
});
