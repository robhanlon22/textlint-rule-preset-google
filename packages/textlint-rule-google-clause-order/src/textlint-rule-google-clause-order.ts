// MIT © 2017 azu
import { getPos } from "@textlint-rule/textlint-report-helper-for-google-preset";

// https://developers.google.com/style/clause-order
export const defaultMessage =
  "Put conditional clauses before instructions, not after.\n" +
  "URL: https://developers.google.com/style/clause-order";
const linkReferencePattern =
  /See (.+?) for more (information|details|detail)\./g;
const clickPattern = /Click ([\w-]+) if you want to (.+?)\./g;

const report: GoogleRuleReporter = (context) => {
  const Syntax = context.Syntax;
  const RuleError = context.RuleError;
  const fixer = context.fixer;
  const getSource: GoogleRuleContext["getSource"] = (
    node,
    beforeCount,
    afterCount,
  ) => context.getSource(node, beforeCount, afterCount);
  const reportError: GoogleRuleContext["report"] = (node, error) => {
    context.report(node, error);
  };
  return {
    [Syntax.Paragraph](node) {
      const text = getSource(node);
      for (const match of text.matchAll(linkReferencePattern)) {
        reportError(
          node,
          new RuleError(defaultMessage, {
            index: match.index,
            fix: fixer.replaceTextRange(
              [match.index, match.index + match[0].length],
              `For more ${match[2]}, see ${match[1]}.`,
            ),
          }),
        );
      }
      for (const match of text.matchAll(clickPattern)) {
        if (!getPos(text, match[1]).startsWith("VB")) {
          continue;
        }
        reportError(
          node,
          new RuleError(defaultMessage, {
            index: match.index,
            fix: fixer.replaceTextRange(
              [match.index, match.index + match[0].length],
              `To ${match[2]}, click ${match[1]}.`,
            ),
          }),
        );
      }
    },
  };
};
const rule = {
  linter: report,
  fixer: report,
};

export default rule;
