// MIT © 2017 azu
import {
  paragraphReporter,
  getPos,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const report: GoogleRuleReporter = (context) => {
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
      replace: ({ captures }) => {
        return `To ${captures[0]} ${captures[1]}, ${captures[2]}`;
      },
      message:
        () => `using "please" in a set of instructions is overdoing the politeness.\n
        URL: https://developers.google.com/style/tone#politeness-and-use-of-please`,
    },
    {
      pattern: /(For more \w+), please (\w+)/,
      test: ({ all, captures }) => {
        return getPos(all, captures[1]).startsWith("VB");
      },
      replace: ({ captures }) => {
        return `${captures[0]}, ${captures[1]}`;
      },
      message:
        () => `using "please" in a set of instructions is overdoing the politeness.\n
        URL: https://developers.google.com/style/tone#politeness-and-use-of-please`,
    },
  ];

  const { Syntax, RuleError, getSource, fixer, report } = context;
  return {
    [Syntax.Paragraph](node) {
      paragraphReporter({
        Syntax,
        node,
        dictionaries,
        report,
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
