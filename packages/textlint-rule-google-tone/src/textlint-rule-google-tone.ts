// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
  getPos,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

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
      message:
        () => `using "please" in a set of instructions is overdoing the politeness.\n
        URL: https://developers.google.com/style/tone#politeness-and-use-of-please`,
    },
    {
      pattern: /(For more \w+), please (\w+)/,
      test: ({ all, captures }) => {
        return getPos(all, captures[1]).startsWith("VB");
      },
      message:
        () => `using "please" in a set of instructions is overdoing the politeness.\n
        URL: https://developers.google.com/style/tone#politeness-and-use-of-please`,
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
