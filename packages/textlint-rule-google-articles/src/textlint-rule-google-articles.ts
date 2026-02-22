// MIT © 2017 azu
import {
  bindRuleContext,
  shouldIgnoreNodeOfStrNode,
  strReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";
import { classifyArticle } from "english-article-classifier";

const DocumentURL = "https://developers.google.com/style/articles";
const DEFINITE_REFERENCE_NOUNS = [
  "section",
  "sections",
  "example",
  "examples",
  "table",
  "tables",
  "figure",
  "figures",
  "list",
  "lists",
  "step",
  "steps",
  "command",
  "commands",
  "field",
  "fields",
  "value",
  "values",
  "option",
  "options",
  "page",
  "pages",
  "paragraph",
  "paragraphs",
  "chapter",
  "chapters",
  "file",
  "files",
  "directory",
  "directories",
  "method",
  "methods",
  "setting",
  "settings",
];
const DEFINITE_REFERENCE_NOUN_PATTERN = DEFINITE_REFERENCE_NOUNS.join("|");
const missingDefiniteArticlePattern = new RegExp(
  `(^|[.!?]\\s+|\\b(?:in|on|at|for|from|to|see|refer to)\\s+)(following|previous|same)\\s+(${DEFINITE_REFERENCE_NOUN_PATTERN})\\b`,
  "gi",
);
const determinerPattern =
  /\b(the|this|that|these|those|its|their|our|your|my|his|her|a|an)$/i;

const isMissingDefiniteBeforeSame = (
  args: MatchReplaceDictionaryArgs,
): boolean => {
  const before = args.all.slice(0, args.index).trimEnd();
  if (before.length === 0) {
    return true;
  }
  return !determinerPattern.test(before);
};
interface ArticleOptions {
  a?: unknown;
  an?: unknown;
}

const toStringArray = (value: unknown): string[] => {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const report: GoogleRuleReporter = (context, options = {}) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  const articleOptions = options as ArticleOptions;
  const forceA = toStringArray(articleOptions.a);
  const forceAn = toStringArray(articleOptions.an);
  const classifyOptions = {
    forceA,
    forceAn,
  };
  const dictionaries: MatchReplaceDictionary[] = [
    {
      pattern: /\b(a) ([\w.-]+)\b/i,
      test: ({ captures }) => {
        const result = classifyArticle(captures[1], classifyOptions);
        return result.type === "an";
      },
      message: ({ captures }) => {
        const result = classifyArticle(captures[1], classifyOptions);
        return (
          `Should be begin with "an"` +
          "\nReason: " +
          result.reason +
          "\n" +
          DocumentURL
        );
      },
    },
    {
      pattern: /\b(an) ([\w.-]+)\b/i,
      test: ({ captures }) => {
        const result = classifyArticle(captures[1], classifyOptions);
        return result.type === "a";
      },
      message: ({ captures }) => {
        const result = classifyArticle(captures[1], classifyOptions);
        return (
          `Should be begin with "a"` +
          "\nReason: " +
          result.reason +
          "\n" +
          DocumentURL
        );
      },
    },
    {
      pattern: missingDefiniteArticlePattern,
      message: () =>
        `Use the definite article "the" when referring to a specific item (for example, "the following section").\n${DocumentURL}`,
    },
    {
      pattern: new RegExp(
        `\\b(same)\\s+(${DEFINITE_REFERENCE_NOUN_PATTERN})\\b`,
        "gi",
      ),
      test: isMissingDefiniteBeforeSame,
      message: () =>
        `Use the definite article "the" when referring to a specific item (for example, "the following section").\n${DocumentURL}`,
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
