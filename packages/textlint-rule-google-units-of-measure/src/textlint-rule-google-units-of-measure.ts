// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const URL = "https://developers.google.com/style/units-of-measure";
const NON_BREAKING_SPACE = "\u00A0";
const NUMBER_PATTERN = String.raw`\d+(?:[.,]\d+)?`;
const STORAGE_AND_LENGTH_UNIT_PATTERN = String.raw`(?:KB|kB|MB|GB|TB|KiB|MiB|GiB|TiB|mm)`;

const withStyleUrl = (message: string): string => `${message}\n${URL}\n`;
const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  const dictionaries: MatchReplaceDictionary[] = [
    // Use nonbreaking spaces with most units.
    {
      pattern: new RegExp(
        String.raw`\b(${NUMBER_PATTERN})( *)(${STORAGE_AND_LENGTH_UNIT_PATTERN})\b`,
        "g",
      ),
      replace: ({ captures }) =>
        `${captures[0]}${NON_BREAKING_SPACE}${captures[2]}`,
      message: () =>
        withStyleUrl(
          "Use a nonbreaking space between numbers and most units of measure.",
        ),
    },
    // Do not use spacing for money.
    {
      pattern: new RegExp(
        String.raw`([£$])( +|${NON_BREAKING_SPACE}+)(\d+(?:[.,]\d+)*)\b`,
        "g",
      ),
      replace: ({ captures }) => `${captures[0]}${captures[2]}`,
      message: () =>
        withStyleUrl(
          "When the unit of measure is money, degrees, or percent, don't leave a space.",
        ),
    },
    // Do not use spacing for percentages.
    {
      pattern: new RegExp(
        String.raw`\b(${NUMBER_PATTERN})( +|${NON_BREAKING_SPACE}+)%(?=[^\w]|$)`,
        "g",
      ),
      replace: ({ captures }) => `${captures[0]}%`,
      message: () =>
        withStyleUrl(
          "When the unit of measure is money, degrees, or percent, don't leave a space.",
        ),
    },
    // For angles, keep the number and degree symbol together.
    {
      pattern: new RegExp(
        String.raw`\b(${NUMBER_PATTERN})( +|${NON_BREAKING_SPACE}+)°(?![ ${NON_BREAKING_SPACE}]*[CF]\b)`,
        "g",
      ),
      replace: ({ captures }) => `${captures[0]}°`,
      message: () =>
        withStyleUrl(
          "When the unit of measure is money, degrees, or percent, don't leave a space.",
        ),
    },
    // For Celsius/Fahrenheit, remove spacing before the degree symbol and
    // use nonbreaking space between the degree symbol and scale.
    {
      pattern: new RegExp(
        String.raw`\b(${NUMBER_PATTERN})(?: +|${NON_BREAKING_SPACE}+)°(?:[ ${NON_BREAKING_SPACE}]*)((?:C|F))\b`,
        "g",
      ),
      replace: ({ captures }) =>
        `${captures[0]}°${NON_BREAKING_SPACE}${captures[1]}`,
      message: () =>
        withStyleUrl(
          "When writing temperatures in Celsius or Fahrenheit, don't leave a space between the number and degree symbol, and use a nonbreaking space between the degree symbol and the temperature scale.",
        ),
    },
    {
      pattern: new RegExp(
        String.raw`\b(${NUMBER_PATTERN})°( *)(?:([CF]))\b`,
        "g",
      ),
      replace: ({ captures }) =>
        `${captures[0]}°${NON_BREAKING_SPACE}${captures[2]}`,
      message: () =>
        withStyleUrl(
          "When writing temperatures in Celsius or Fahrenheit, don't leave a space between the number and degree symbol, and use a nonbreaking space between the degree symbol and the temperature scale.",
        ),
    },
    // Don't put a space k
    {
      pattern: new RegExp(
        String.raw`\b(${NUMBER_PATTERN})( +|${NON_BREAKING_SPACE}+)k\b`,
        "g",
      ),
      replace: ({ captures }) => `${captures[0]}k`,
      message: () =>
        withStyleUrl(`Don't put a space between the number and "k".`),
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
