import TextLintTester from "textlint-tester";
const tester = new TextLintTester();
// rule
import rule, {
  lessCommonContractionsMessage,
  nounVerbMessage,
  noDoubleContractions,
} from "../src/textlint-rule-google-contractions.js";
tester.run("textlint-rule-google-contractions", rule as GoogleRuleModule, {
  valid: [
    "Use contractions like don't when they sound natural.",
    "Some common contractions are don't, can't, and isn't.",
    "In some cases, it's OK to use a noun+verb contraction, such as \"If you want to display information, a table's your best option.\" But in general, it's best to avoid that kind of contraction.",
    "The second example above is better because using 's in place of is could cause the reader to think that \"browser's\" is the possessive form.",
  ],
  invalid: [
    {
      text: "The browser's quickly becoming popular.",
      output: "The browser's quickly becoming popular.",
      errors: [
        {
          message: nounVerbMessage,
        },
      ],
    },
    {
      text: "These machines're slow.",
      output: "These machines're slow.",
      errors: [
        {
          message: nounVerbMessage,
        },
      ],
    },
    {
      text: "The following guides're a good way to learn to use Universal Analytics.",
      output:
        "The following guides're a good way to learn to use Universal Analytics.",
      errors: [
        {
          message: nounVerbMessage,
        },
      ],
    },
    {
      text: "you shouldn't've done.",
      output: "you should not have done.",
      errors: [
        {
          message: noDoubleContractions,
        },
      ],
    },
    {
      text: "That'll make this easier to read.",
      output: "That will make this easier to read.",
      errors: [
        {
          message: lessCommonContractionsMessage,
        },
      ],
    },
    {
      text: "They'd rather skip this step.",
      output: "They'd rather skip this step.",
      errors: [
        {
          message: lessCommonContractionsMessage,
        },
      ],
    },
    {
      text: "It'd be easier to retry the request.",
      output: "It'd be easier to retry the request.",
      errors: [
        {
          message: lessCommonContractionsMessage,
        },
      ],
    },
    {
      text: "You needn't continue with this setup.",
      output: "You needn't continue with this setup.",
      errors: [
        {
          message: lessCommonContractionsMessage,
        },
      ],
    },
    {
      text: "The service hasn't started yet.",
      output: "The service has not started yet.",
      errors: [
        {
          message: lessCommonContractionsMessage,
        },
      ],
    },
    {
      text: "It'd've been faster to retry.",
      output: "It would have been faster to retry.",
      errors: [
        {
          message: noDoubleContractions,
        },
      ],
    },
  ],
});
