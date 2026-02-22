// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
  getPos,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const POLITENESS_URL =
  "https://developers.google.com/style/tone#politeness-and-use-of-please";
const SOME_THINGS_TO_AVOID_URL =
  "https://developers.google.com/style/tone#some-things-to-avoid-where-possible";
const POLITENESS_MESSAGE =
  `using "please" in a set of instructions is overdoing the politeness.\n` +
  `URL: ${POLITENESS_URL}`;
const SOME_THINGS_TO_AVOID_PREFIX =
  "Avoid this phrasing to keep the tone concise and neutral.";
const repeatedSentenceStartPattern =
  /(?:^|[.!?]\s+)(You can|To do|Todo)\b[^.!?]*[.!?]\s+(You can|To do|Todo)\b/gi;

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  // Politeness and use of "please"
  // https://developers.google.com/style/tone#politeness-and-use-of-please
  const dictionaries: MatchReplaceDictionary[] = [
    {
      pattern: /To (\w+) (.*), please (\w+)/,
      test: ({ all, captures }) => {
        return (
          getPos(all, captures[0]).startsWith("VB") &&
          /^(VB|NN)/.test(getPos(all, captures[2]))
        );
      },
      message: () => POLITENESS_MESSAGE,
    },
    {
      pattern: /(For more \w+), please (\w+)/,
      test: ({ all, captures }) => {
        return getPos(all, captures[1]).startsWith("VB");
      },
      message: () => POLITENESS_MESSAGE,
    },
    // Some things to avoid where possible
    {
      pattern: /\b(please note|at this time)\b/gi,
      message: () =>
        `${SOME_THINGS_TO_AVOID_PREFIX}\nURL: ${SOME_THINGS_TO_AVOID_URL}`,
    },
    {
      pattern: repeatedSentenceStartPattern,
      test: ({ captures }) => {
        return captures[0].toLowerCase() === captures[1].toLowerCase();
      },
      message: () =>
        `Avoid starting consecutive sentences with the same phrase.\nURL: ${SOME_THINGS_TO_AVOID_URL}`,
    },
    {
      pattern: /\blet(?:'|’)s\b/gi,
      message: () =>
        `${SOME_THINGS_TO_AVOID_PREFIX}\nURL: ${SOME_THINGS_TO_AVOID_URL}`,
    },
    {
      pattern: /\b(simply|it(?:'|’)s that simple|it(?:'|’)s easy)\b/gi,
      message: () =>
        `${SOME_THINGS_TO_AVOID_PREFIX}\nURL: ${SOME_THINGS_TO_AVOID_URL}`,
    },
  ];

  return {
    [Syntax.Paragraph](node) {
      paragraphReporter({
        Syntax,
        node,
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
