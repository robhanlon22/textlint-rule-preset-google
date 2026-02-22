import TextLintTester from "textlint-tester";
import rule, {
  avoidThereIsMessage,
  defaultMessage,
} from "../src/textlint-rule-google-active-voice.js";

const tester = new TextLintTester();

tester.run("textlint-rule-google-active-voice", rule as GoogleRuleModule, {
  valid: [
    "Use active voice in instructional text.",
    "This guide explains how the API works.",
    "The button is red.",
    "Use `was deleted` as a literal string.",
  ],
  invalid: [
    {
      text: "The file was deleted.",
      output: "The file was deleted.",
      errors: [
        {
          message: defaultMessage,
        },
      ],
    },
    {
      text: "The request is processed by the server.",
      output: "The request is processed by the server.",
      errors: [
        {
          message: defaultMessage,
        },
      ],
    },
    {
      text: "The settings have been updated.",
      output: "The settings have been updated.",
      errors: [
        {
          message: defaultMessage,
        },
      ],
    },
    {
      text: "There are two settings in the API.",
      output: "There are two settings in the API.",
      errors: [
        {
          message: avoidThereIsMessage,
        },
      ],
    },
  ],
});
