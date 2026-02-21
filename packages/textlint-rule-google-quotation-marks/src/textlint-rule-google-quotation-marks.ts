// MIT © 2017 azu
import { paragraphReporter } from "@textlint-rule/textlint-report-helper-for-google-preset";
const report: GoogleRuleReporter = (context) => {
  const dictionaries: MatchReplaceDictionary[] = [
    // Commas and periods with quotation marks
    // We can not handle this rule
    // Because "Exception: When you put a keyword or other literal string in quotation marks"
    // https://developers.google.com/style/quotation-marks
    // https://developers.google.com/style/ellipses
    // {
    //     // British
    //     pattern: /"\./g,
    //     replace: () => {
    //         // American
    //         return `."`;
    //     },
    //     message: () => `Add commas and periods go inside quotation marks, in the standard American style.`
    //         + "\n"
    //         + DocumentURL
    // },
    // {
    //     pattern: /,"/g,
    //     replace: () => {
    //         return `",`;
    //     },
    //     message: () => `When you put a keyword or other literal string in quotation marks, put any other punctuation outside the quotation marks.`
    // },
    // Single quotation marks
    {
      pattern: /'([^'"]+)"([^'"]+)"([^'"]+)'/g,
      replace: ({ captures }) => {
        return `"${captures[0]}'${captures[1]}'${captures[2]}"`;
      },
      message:
        () => `The outside quotation mark shoule be ", the inside quotation mark should be '.
In the latter case, put the primary speaker's quote in double quotation marks and the quote inside the primary speaker's quote in single quotation marks, in the standard American style. `,
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
