// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";
import type { TxtParentNode } from "@textlint/ast-node-types";
import { checkBoldTextPrecedingColon } from "./checkBoldTextPrecedingColon.js";

//  Helping Verbs
// https://www.englishgrammar101.com/module-3/verbs/lesson-2/helping-verbs
// http://grammar.yourdictionary.com/parts-of-speech/verbs/Helping-Verbs.html
// http://study.com/academy/lesson/what-are-helping-verbs-definition-examples-quiz.html
const helpingVerbs = [
  "am",
  "are",
  "is",
  "was",
  "were",
  "be",
  "being",
  "been",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "could",
  "should",
  "would",
  "can",
  "shall",
  "will",
  "may",
  "might",
  "must",
];

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  const dictionaries: MatchReplaceDictionary[] = [
    // Introductory phrase preceding colon
    {
      pattern: /(\w+):/g,
      test: ({ captures }) => {
        const helpingVerb = captures[0];
        return helpingVerbs.includes(helpingVerb);
      },
      message:
        () => `The text that precedes the colon must be able to stand alone as a complete sentence.
https://developers.google.com/style/colons#introductory-phrase-preceding-colon
`,
    },
    // Colons within sentences
    {
      pattern: /\w+:\s(\w+)/g,
      test: ({ captures }) => {
        const nextWord = captures[0];
        return /^[A-Z]/.test(nextWord);
      },
      message:
        () => `In general, the first word in the text that follows a colon should be in lowercase.
https://developers.google.com/style/colons#colons-within-sentences
`,
    },
  ];

  return {
    [Syntax.Paragraph](node) {
      checkBoldTextPrecedingColon({
        node: node as TxtParentNode,
        report: reportError,
        getSource,
        RuleError,
        fixer,
      });
      paragraphReporter({
        node,
        Syntax,
        dictionaries,
        report: reportError,
        getSource,
        RuleError,
        fixer,
      });
    },
  };
};

const rule = {
  linter: report,
  fixer: report,
};

export default rule;
