// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const URL = "https://developers.google.com/style/units-of-measure";
const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  const dictionaries: MatchReplaceDictionary[] = [
    // Need space
    {
      pattern: / ([\d.]+)(GB|TB|KB)\b/g,
      replace: ({ captures }) => ` ${captures[0]} ${captures[1]}`,
      message: () => `Leave one space between the number and the unit.
${URL}    
`,
    },
    // No space
    {
      pattern: / ([£$]) (\d+)\b/g,
      replace: ({ captures }) => ` ${captures[0]}${captures[1]}`,
      message:
        () => `When the unit of measure is money, degrees, or percent, don't leave a space.
${URL}
`,
    },
    {
      pattern: / ([\d.]+) ([%°])([\s.])/g,
      replace: ({ captures }) => ` ${captures[0]}${captures[1]}${captures[2]}`,
      message:
        () => `When the unit of measure is money, degrees, or percent, don't leave a space.
${URL}
`,
    },
    // Don't put a space k
    {
      pattern: / ([\d.]+) k /g,
      replace: ({ captures }) => ` ${captures[0]}k `,
      message: () => `Don't put a space between the number and "k".
${URL}
`,
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
