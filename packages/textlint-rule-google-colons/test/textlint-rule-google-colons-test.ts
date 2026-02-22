// MIT © 2017 azu
import TextLintTester from "textlint-tester";
import rule from "../src/textlint-rule-google-colons.js";
const tester = new TextLintTester();
tester.run("textlint-rule-google-colons", rule as GoogleRuleModule, {
  valid: [
    // Introductory phrase preceding colon
    `The fields are defined as follows:
    
- one
- two
`,
    "Supported products: Google Maps and Firebase.",
    "API names: HTTP and TLS.",
    `When you add or update content to an existing project, remember to take these steps: review the style guide; use checklists; enlist a fellow writer or an editor to copyedit your work; and request a developmental edit if you feel that it's warranted.`,
  ],
  invalid: [
    {
      text: "The fields are:",
      errors: [
        {
          message: `The text that precedes the colon must be able to stand alone as a complete sentence.
https://developers.google.com/style/colons#introductory-phrase-preceding-colon
`,
        },
      ],
    },
    {
      text: "- The fields are:",
      errors: [{}],
    },
    {
      text: "This is:",
      errors: [
        {
          message: `The text that precedes the colon must be able to stand alone as a complete sentence.
https://developers.google.com/style/colons#introductory-phrase-preceding-colon
`,
        },
      ],
    },
    // Colons within sentences
    {
      text: "Tone: Concise, conversational, friendly, respectful.",
      errors: [
        {
          message: `In general, the first word in the text that follows a colon should be in lowercase.
https://developers.google.com/style/colons#colons-within-sentences
`,
        },
      ],
    },
  ],
});
