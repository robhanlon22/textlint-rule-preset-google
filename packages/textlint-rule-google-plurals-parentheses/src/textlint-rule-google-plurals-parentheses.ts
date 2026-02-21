// MIT © 2017 azu
import {
  paragraphReporter,
  getPosFromSingleWord,
  PosType,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const DocumentURL = "https://developers.google.com/style/hyphens";
const report: GoogleRuleReporter = (context) => {
  const dictionaries: MatchReplaceDictionary[] = [
    // word(s)
    // if "words" is plural, report as error
    {
      pattern: /([\w-]+)\((\w+)\)/g,
      test: ({ captures }) => {
        const pluralWord = `${captures[0]}${captures[1]}`;
        const pos = getPosFromSingleWord(pluralWord);
        return pos === PosType.PluralNoun || pos === PosType.PluralProperNoun;
      },
      message: () => ` Don't put optional plurals in parentheses.
${DocumentURL}
`,
    },
  ];

  const { Syntax, RuleError, getSource, fixer, report } = context;
  return {
    [Syntax.Paragraph](node) {
      paragraphReporter({
        node,
        Syntax,
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
