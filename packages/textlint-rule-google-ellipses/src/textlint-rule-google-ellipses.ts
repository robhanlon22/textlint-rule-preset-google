// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const DocumentURL = "https://developers.google.com/style/ellipses";
const isInsideDoubleQuotes = (source: string, index: number): boolean => {
  const prefix = source.slice(0, index);
  return (prefix.match(/"/g) ?? []).length % 2 === 1;
};
const isInsideInlineCode = (source: string, index: number): boolean => {
  const prefix = source.slice(0, index);
  return (prefix.match(/`/g) ?? []).length % 2 === 1;
};
const isSuspensionPointEllipsis = (source: string, index: number): boolean => {
  const trailing = source.slice(index);
  if (/^\.\.\.\s+[^.?!\n]+?\s+\.\.\./.test(trailing)) {
    return true;
  }
  const leading = source.slice(0, index + 3);
  return /\.\.\.\s+[^.?!\n]+?\s+\.\.\.$/.test(leading);
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
    // NG: Suspension points
    {
      pattern: / \.\.\. (.*?) \.\.\. /g,
      test: ({ captures }) => {
        // if includes punctuation mark, ignore it
        return !/[!?.]/.test(captures[0]);
      },
      message: () =>
        "Disallow to use ellipses as suspension points." +
        "\n" +
        "https://developers.google.com/style/ellipses#suspension-points",
    },
    {
      pattern: /\.\.\./g,
      test: ({ all, index }) => {
        const before = index > 0 ? all.charAt(index - 1) : "";
        const after = all.charAt(index + 3);
        // Keep the dedicated spacing rule as the single reporter for word...word.
        if (/\w/.test(before) && /\w/.test(after)) {
          return false;
        }
        if (isInsideInlineCode(all, index)) {
          return false;
        }
        if (isSuspensionPointEllipsis(all, index)) {
          return false;
        }
        return !isInsideDoubleQuotes(all, index);
      },
      message: () =>
        "Don't use ellipses in written documentation except when omitting text in quoted passages." +
        "\n" +
        DocumentURL,
    },
    // NG: in beginning or end of the text.
    {
      pattern: /"\s*?\.\.\./g,
      message: () =>
        "Disallow to use ellipses in beginning of the text" +
        "\n" +
        "https://developers.google.com/style/ellipses#how-to-use-ellipses",
    },
    {
      pattern: /\.\.\.\s*?"/g,
      message: () =>
        "Disallow to use ellipses in end of the text" +
        "\n" +
        "https://developers.google.com/style/ellipses#how-to-use-ellipses",
    },
    // space
    {
      pattern: /(\w+)\.\.\.(\w+)/g,
      replace: ({ captures }) => {
        return `${captures[0]} ... ${captures[1]}`;
      },
      message: () =>
        "Insert one space before and after the ellipsis" + "\n" + DocumentURL,
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
