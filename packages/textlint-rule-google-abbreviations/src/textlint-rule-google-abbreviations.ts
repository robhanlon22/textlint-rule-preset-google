// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

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
      pattern: /e\.g\./g,
      message: () =>
        `Don't use "e.g.", instead, use "for example".` +
        "\n" +
        "https://developers.google.com/style/abbreviations#dont-use",
    },
    {
      pattern: /i\.e\./g,
      message: () =>
        `Don't use "i.e.", instead, use "that is".` +
        "\n" +
        "https://developers.google.com/style/abbreviations#dont-use",
    },
    {
      pattern: /\b([A-Z]+)\. /g,
      replace: ({ captures }) => {
        return `${captures[0]} `;
      },
      message: () =>
        `Don't use periods with acronyms or initialisms.` +
        "\n" +
        "https://developers.google.com/style/abbreviations#periods",
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
