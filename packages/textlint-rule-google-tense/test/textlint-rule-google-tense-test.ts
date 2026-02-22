import TextLintTester from "textlint-tester";
import rule, {
  presentTenseMessage,
  useDoMessage,
  useDoesMessage,
} from "../src/textlint-rule-google-tense.js";

const tester = new TextLintTester();

tester.run("textlint-rule-google-tense", rule as GoogleRuleModule, {
  valid: [
    "The API returns JSON.",
    "This method does return a value.",
    "These methods do return values.",
    "The users do accept the terms.",
    "This operation does not require authentication.",
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
    {
      text: "This method do return a value.",
      output: "This method do return a value.",
      errors: [
        {
          message: useDoesMessage,
        },
      ],
    },
    {
      text: "These methods does return values.",
      output: "These methods does return values.",
      errors: [
        {
          message: useDoMessage,
        },
      ],
    },
    {
      text: "Each request do include a token.",
      output: "Each request do include a token.",
      errors: [
        {
          message: useDoesMessage,
        },
      ],
    },
  ],
});
