// MIT © 2017 azu
import {
  bindRuleContext,
  shouldIgnoreNodeOfStrNode,
  strReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const PronounURL = "https://developers.google.com/style/pronouns";
const PersonURL = "https://developers.google.com/style/person";

export const genderNeutralMessage =
  "Use gender-neutral pronouns where possible.\n" + `URL: ${PronounURL}`;
export const secondPersonMessage =
  'Prefer second person ("you") over first person in documentation where practical.\n' +
  `URL: ${PersonURL}`;

const shouldIgnoreFirstPersonFalsePositive = ({
  all,
  index,
  match,
}: MatchReplaceDictionaryArgs): boolean => {
  const normalizedMatch = match.toLowerCase();
  if (normalizedMatch === "i") {
    const previousChar = index > 0 ? all[index - 1] : "";
    const nextChar = all[index + match.length] ?? "";
    // Ignore technical tokens such as "I/O".
    if (previousChar === "/" || nextChar === "/") {
      return true;
    }
  }
  // Ignore the country abbreviation "US".
  if (normalizedMatch === "us" && match === "US") {
    return true;
  }
  return false;
};

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  const dictionaries: MatchReplaceDictionary[] = [
    {
      pattern: /\b(he|she|him|her|his|hers|himself|herself)\b/gi,
      message: () => genderNeutralMessage,
    },
    {
      pattern: /\b(I|me|my|mine|myself|we|us|our|ours|ourselves)\b/gi,
      test: (args) => !shouldIgnoreFirstPersonFalsePositive(args),
      message: () => secondPersonMessage,
    },
  ];
  return {
    [Syntax.Str](node) {
      if (shouldIgnoreNodeOfStrNode(node, context)) {
        return;
      }
      strReporter({
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
