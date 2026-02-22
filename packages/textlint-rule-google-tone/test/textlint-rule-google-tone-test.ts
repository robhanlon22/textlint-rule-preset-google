import TextLintTester from "textlint-tester";
const tester = new TextLintTester();
// rule
import rule from "../src/textlint-rule-google-tone.js";
// ruleName, rule, { valid, invalid }
const politenessMessage =
  'using "please" in a set of instructions is overdoing the politeness.\nURL: https://developers.google.com/style/tone#politeness-and-use-of-please';
const someThingsMessage =
  "Avoid this phrasing to keep the tone concise and neutral.\nURL: https://developers.google.com/style/tone#some-things-to-avoid-where-possible";
const repeatedSentenceStartMessage =
  "Avoid starting consecutive sentences with the same phrase.\nURL: https://developers.google.com/style/tone#some-things-to-avoid-where-possible";
tester.run("textlint-rule-google-tone", rule as GoogleRuleModule, {
  valid: [
    "To view the document, click View.",
    "To get the user's phone number, call `user.phoneNumber.get()`.",
    "To clean up, call the `collectGarbage()` method.",
    "Use concise phrasing throughout this guide.",
    "To install dependencies, run `pnpm install`.",
    "You can view logs. Then review alert settings.",
  ],
  invalid: [
    {
      text: "To view the document, please click View.",
      output: "To view the document, please click View.",
      errors: [
        {
          message: politenessMessage,
          index: 0,
        },
      ],
    },
    {
      text: "For more information, please see document.",
      output: "For more information, please see document.",
      errors: [
        {
          message: politenessMessage,
          index: 0,
        },
      ],
    },
    {
      text: "Please note that this API is experimental.",
      output: "Please note that this API is experimental.",
      errors: [
        {
          message: someThingsMessage,
          index: 0,
        },
      ],
    },
    {
      text: "At this time, this API is in preview.",
      output: "At this time, this API is in preview.",
      errors: [
        {
          message: someThingsMessage,
          index: 0,
        },
      ],
    },
    {
      text: "Let's configure the service now.",
      output: "Let's configure the service now.",
      errors: [
        {
          message: someThingsMessage,
          index: 0,
        },
      ],
    },
    {
      text: "It's that simple.",
      output: "It's that simple.",
      errors: [
        {
          message: someThingsMessage,
          index: 0,
        },
      ],
    },
    {
      text: "This procedure is simply documented.",
      output: "This procedure is simply documented.",
      errors: [
        {
          message: someThingsMessage,
        },
      ],
    },
    {
      text: "You can open the app. You can select Settings.",
      output: "You can open the app. You can select Settings.",
      errors: [
        {
          message: repeatedSentenceStartMessage,
          index: 0,
        },
      ],
    },
  ],
});
