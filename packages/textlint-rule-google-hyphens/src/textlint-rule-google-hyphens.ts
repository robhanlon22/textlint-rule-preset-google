// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
  getPosFromSingleWord,
  PosType,
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
    // Adverbs ending in "ly"
    {
      pattern: /(\w+ly)-(\w+)/g,
      test: ({ captures }) => {
        const pos = getPosFromSingleWord(captures[0]);
        return pos === PosType.Adverb;
      },
      replace: ({ captures }) => {
        return `${captures[0]} ${captures[1]}`;
      },
      message: () =>
        `Don't hyphenate adverbs ending in "ly" except where needed for clarity.`,
    },
    // When to hyphenate
    // Hyphenate compound modifiers before a noun.
    {
      pattern:
        /\b([A-Za-z][\w-]*) (specific|based|related|level) ([A-Za-z][\w-]*)\b/g,
      test: ({ captures }) => {
        const modifiedWordPos = getPosFromSingleWord(captures[2]);
        return modifiedWordPos.startsWith("NN");
      },
      replace: ({ captures }) => `${captures[0]}-${captures[1]} ${captures[2]}`,
      message: () => "Hyphenate compound modifiers that appear before a noun.",
    },
    // Compound words
    {
      pattern:
        /\b(real|open|command|long|short|high|low) (time|source|line|term|level) ([A-Za-z][\w-]*)\b/g,
      test: ({ captures }) => {
        const modifiedWordPos = getPosFromSingleWord(captures[2]);
        return modifiedWordPos.startsWith("NN");
      },
      replace: ({ captures }) => `${captures[0]}-${captures[1]} ${captures[2]}`,
      message: () =>
        "Use a hyphen for common two-word compound modifiers before a noun.",
    },
    // Range of numbers
    {
      pattern: /(from|between) (\d+-\d+)/g,
      replace: ({ captures }) => {
        return captures[1];
      },
      message: () =>
        'Use a hyphen to indicate a range of numbers. Don\'t add words such as "from" or "between".',
    },
    // Spaces around hyphens => textlint-rule-google-dashes
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
