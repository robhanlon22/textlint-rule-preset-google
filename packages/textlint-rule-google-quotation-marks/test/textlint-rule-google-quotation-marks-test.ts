// MIT © 2017 azu
import TextLintTester from "textlint-tester";
const tester = new TextLintTester();
import rule from "../src/textlint-rule-google-quotation-marks.js";
const americanStyleMessage =
  "Put commas and periods inside closing quotation marks in the standard American style.\nhttps://developers.google.com/style/quotation-marks";
const literalStringMessage =
  "When quoting a keyword or other literal string, put commas and periods outside the quotation marks.\nhttps://developers.google.com/style/quotation-marks";
tester.run("textlint-rule-google-quotation-marks", rule as GoogleRuleModule, {
  valid: [
    'See the section titled "Care and feeding of the emu."',
    'If you enter "foo", the program crashes.',
    "If you enter `foo`, the program crashes.",
    "In the latter case, put the primary speaker's quote in double quotation marks and the quote inside the primary speaker's quote in single quotation marks, in the standard American style. (This is opposite to the standard British style.)",
    'My high school English teacher made me learn that Shakespeare quote: "All the world\'s a stage, And all the men and women merely players ...."',
    'document it as "click Save".', // <= keyword,
    `She said, "I heard him shout 'Help', and saw him floundering in the water."`,
  ],
  invalid: [
    // Commas and periods with quotation marks
    {
      text: 'See the section titled "Care and feeding of the emu".',
      output: 'See the section titled "Care and feeding of the emu".',
      errors: [
        {
          message: americanStyleMessage,
        },
      ],
    },
    {
      text: 'She wrote "hello", then closed the editor.',
      output: 'She wrote "hello", then closed the editor.',
      errors: [
        {
          message: americanStyleMessage,
        },
      ],
    },
    {
      text: 'If you enter "foo," the program crashes.',
      output: 'If you enter "foo," the program crashes.',
      errors: [
        {
          message: literalStringMessage,
        },
      ],
    },
    {
      text: 'document it as "click Save."',
      output: 'document it as "click Save."',
      errors: [
        {
          message: literalStringMessage,
        },
      ],
    },
    // Single quotation marks
    {
      text: `She said, 'I heard him shout "Help", and saw him floundering in the water.'`,
      output: `She said, "I heard him shout 'Help', and saw him floundering in the water."`,
      errors: [{}, {}],
    },
  ],
});
