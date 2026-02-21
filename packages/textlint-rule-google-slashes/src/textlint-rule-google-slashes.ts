// MIT © 2017 azu
import { paragraphReporter } from "@textlint-rule/textlint-report-helper-for-google-preset";

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
  const dictionaries: MatchReplaceDictionary[] = [
    // Slashes with dates => other rule
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
      message:
        () => `Don't use slashes with fractions, as they can be ambiguous.
https://developers.google.com/style/slashes#slashes-with-fractions
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
