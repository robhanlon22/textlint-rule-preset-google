// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const SLASHES_URL = "https://developers.google.com/style/slashes";

const REPLACE_ABBR_DICT: Record<string, string> = {
  "c/o": "care of",
  "w/": "with",
  "w/o": "without",
};

const FILE_PATH_SEGMENTS = new Set([
  "src",
  "lib",
  "bin",
  "test",
  "tests",
  "docs",
  "dist",
  "build",
  "packages",
  "node_modules",
  "usr",
  "var",
  "tmp",
]);

const isFilePathOrUrlContext = (
  args: MatchReplaceDictionaryArgs,
  leftSegment: string,
  rightSegment: string,
): boolean => {
  const { all, index, match } = args;
  const before = all[index - 1];
  const after = all[index + match.length];
  if (before === "/" || before === "\\" || after === "/" || after === "\\") {
    return true;
  }
  const protocolPrefix = all
    .slice(Math.max(0, index - 12), index)
    .toLowerCase();
  if (
    protocolPrefix.endsWith("http://") ||
    protocolPrefix.endsWith("https://") ||
    protocolPrefix.endsWith("ftp://")
  ) {
    return true;
  }
  return (
    FILE_PATH_SEGMENTS.has(leftSegment.toLowerCase()) ||
    FILE_PATH_SEGMENTS.has(rightSegment.toLowerCase())
  );
};

const isBetween = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

const isLikelySlashDate = (
  monthOrYear: string,
  monthOrDay: string,
  dayOrYear: string,
): boolean => {
  const first = Number(monthOrYear);
  const second = Number(monthOrDay);
  const third = Number(dayOrYear);
  if (Number.isNaN(first) || Number.isNaN(second) || Number.isNaN(third)) {
    return false;
  }
  // yyyy/mm/dd
  if (monthOrYear.length === 4) {
    return isBetween(second, 1, 12) && isBetween(third, 1, 31);
  }
  // mm/dd/yy(yy) or dd/mm/yy(yy)
  if (dayOrYear.length >= 2) {
    return (
      isBetween(first, 1, 31) &&
      isBetween(second, 1, 31) &&
      (first <= 12 || second <= 12)
    );
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
    // Slashes with dates
    // https://developers.google.com/style/slashes#slashes-with-dates
    {
      pattern: /\b(\d{1,4})\/(\d{1,2})\/(\d{1,4})\b/g,
      test: ({ captures }) => {
        return isLikelySlashDate(captures[0], captures[1], captures[2]);
      },
      message: () => `Don't use slashes with dates.
${SLASHES_URL}#slashes-with-dates
`,
    },

    {
      pattern: /\b([a-zA-Z-]+)\/([a-zA-Z-]+)\b/g,
      test: (args) => {
        const { captures } = args;
        if (isFilePathOrUrlContext(args, captures[0], captures[1])) {
          return false;
        }
        // ignore abbreviations like "c/w"
        return captures[0].length >= 2 && captures[1].length >= 2;
      },
      message: () => `Don't use slashes to separate alternatives.
https://developers.google.com/style/slashes#slashes-with-alternatives
`,
    },

    // Slashes with fractions
    // https://developers.google.com/style/slashes#slashes-with-alternatives
    {
      pattern: /\b(\d+)\/(\d+)\b/g,
      test: ({ all, index, match }) => {
        const before = all[index - 1];
        const after = all[index + match.length];
        // Skip chained slash segments like dates (10/31/2025)
        return before !== "/" && after !== "/";
      },
      message:
        () => `Don't use slashes with fractions, as they can be ambiguous.
${SLASHES_URL}#slashes-with-fractions
`,
    },
    // Slashes with abbreviations
    // https://developers.google.com/style/slashes#slashes-with-abbreviations
    {
      pattern: /\b(([a-zA-Z])\/([a-zA-Z]?))\s/g,
      test: (args) => {
        const { captures } = args;
        return !isFilePathOrUrlContext(args, captures[1], captures[2]);
      },
      replace: ({ captures }) => {
        const match = captures[0];
        if (!match) {
          return;
        }
        const replacement = REPLACE_ABBR_DICT[match];
        if (!replacement) {
          return;
        }
        return `${replacement} `;
      },
      message:
        () => `Don't use abbreviations that rely on slashes. Instead, spell the words out.
https://developers.google.com/style/slashes#slashes-with-abbreviations
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
