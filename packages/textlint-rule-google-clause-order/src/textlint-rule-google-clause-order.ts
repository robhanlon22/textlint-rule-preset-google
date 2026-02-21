// MIT © 2017 azu
import {
  paragraphReporter,
  getPos,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

// https://developers.google.com/style/clause-order
export const defaultMessage =
  "Put conditional clauses before instructions, not after.\n" +
  "URL: https://developers.google.com/style/clause-order";
const report: GoogleRuleReporter = (context) => {
  const dictionaries: MatchReplaceDictionary[] = [
    {
      pattern: /See (.*) for more (information|details|detail)./,
      replace: ({ captures }) => {
        return `For more ${captures[1]}, see ${captures[0]}.`;
      },
      message: () => defaultMessage,
    },
    {
      pattern: /Click ([\w-]+) if you want to (.+)./,
      test: ({ all, captures }) => {
        return getPos(all, captures[0]).startsWith("VB");
      },
      replace: ({ captures }) => {
        return `To ${captures[1]}, click ${captures[0]}.`;
      },
      message: () => defaultMessage,
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
