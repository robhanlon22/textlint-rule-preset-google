// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const DocumentURL = "https://developers.google.com/style/abbreviations";
const DoNotUseURL = `${DocumentURL}#dont-use`;
const PeriodsURL = `${DocumentURL}#periods`;

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  const dictionaries: MatchReplaceDictionary[] = [
    // Abbreviations not to use
    {
      pattern: /\be\.g\.?(?=,|\s|$)/gi,
      message: () =>
        `Don't use "e.g.", instead, use "for example".` + "\n" + DoNotUseURL,
    },
    {
      pattern: /\bi\.e\.?(?=,|\s|$)/gi,
      message: () =>
        `Don't use "i.e.", instead, use "that is".` + "\n" + DoNotUseURL,
    },
    {
      pattern: /\b([A-Z]{2,})\. /g,
      replace: ({ captures }) => {
        return `${captures[0]} `;
      },
      message: () =>
        `Don't use periods with acronyms or initialisms.` + "\n" + PeriodsURL,
    },
    {
      pattern: /\b(?:[A-Z]\.){2,}(?=\s|$)/g,
      message: () =>
        `Don't use periods with acronyms or initialisms.` + "\n" + PeriodsURL,
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
