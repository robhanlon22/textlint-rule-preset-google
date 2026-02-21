// MIT © 2017 azu
import {
  bindRuleContext,
  shouldIgnoreNodeOfStrNode,
  strReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";
import { classifyArticle } from "english-article-classifier";

const DocumentURL = "https://developers.google.com/style/articles";
interface ArticleOptions {
  a?: unknown;
  an?: unknown;
}

const toStringArray = (value: unknown): string[] => {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
};

const isCapital = (text: string) => {
  return /^[A-Z]/.test(text);
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
      replace: ({ captures }) => {
        const an = isCapital(captures[0]) ? "An" : "an";
        return `${an} ${captures[1]}`;
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
      replace: ({ captures }) => {
        const a = isCapital(captures[0]) ? "A" : "a";
        return `${a} ${captures[1]}`;
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
