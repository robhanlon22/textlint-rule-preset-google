// MIT © 2017 azu
import TextLintTester from "textlint-tester";
const tester = new TextLintTester();
// rule
import rule, { defaultMessage } from "../src/textlint-rule-google-possessives";
// ruleName, rule, { valid, invalid }
tester.run("textlint-rule-google-possessives", rule, {
  valid: [
    "Each component has its own set of traits.",
    "This is business's book.",
    "alias's",
    "application's",
    "business's",
    "class's",
    "customer's",
    "Elvis's",
    "Liz's",
    "user's ", // singular
    "users'", // plural,
    "Elise Williams's",
    "the Williamses'",
    "women's", // <
  ],
  invalid: [
    {
      text: "businesses's",
      errors: [
        {
          index: 0,
        },
      ],
    },
    {
      text: "Buzz'",
      errors: [
        {
          index: 0,
        },
      ],
    },
    {
      text: "Carlos'",
      errors: [
        {
          index: 0,
          message: defaultMessage,
        },
      ],
    },
    {
      text: "class'",
      errors: [
        {
          index: 0,
          message: defaultMessage,
        },
      ],
    },
    {
      text: "examples's",
      errors: [
        {
          index: 0,
          message: defaultMessage,
        },
      ],
    },
    {
      text: "users's",
      errors: [
        {
          index: 0,
          message: defaultMessage,
        },
      ],
    },
    {
      text: "values's",
      errors: [
        {
          index: 0,
          message: defaultMessage,
        },
      ],
    },
  ],
});
