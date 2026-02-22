// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const DocumentURL = "https://developers.google.com/style/quotation-marks";
const literalLeadInPattern =
  /\b(enter|type|click|tap|select|choose|press|call|set|run|use|pass|specify|document(?:ed)?(?: it)? as)\s*(?:(?:the|a|an|this|that)\s+)?(?:(?:keyword|literal|string|command|method|function|property|field|parameter|option|argument|flag|value|token|name|path)\s+)?$/i;

const looksLikeLiteralQuotedValue = (value: string): boolean => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return false;
  }
  if (
    /^(click|tap|select|press|type|enter|run|call|set|choose|open)\b/i.test(
      normalized,
    )
  ) {
    return true;
  }
  if (/[_./#:()[\]-]/.test(normalized)) {
    return true;
  }
  if (/^[A-Za-z0-9]+$/.test(normalized)) {
    return true;
  }
  return false;
};

const isLiteralStringContext = (args: MatchReplaceDictionaryArgs): boolean => {
  const quotedValue = args.captures[0];
  const before = args.all.slice(Math.max(0, args.index - 120), args.index);
  const recentBefore = before.slice(-100);
  if (literalLeadInPattern.test(recentBefore)) {
    return true;
  }
  return (
    looksLikeLiteralQuotedValue(quotedValue) &&
    /document(?:ed)?\s+it\s+as\s*$/i.test(recentBefore)
  );
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
    // Commas and periods with quotation marks
    // https://developers.google.com/style/quotation-marks
    {
      pattern: /"([^"\n]+)"([,.])/g,
      test: (args) => {
        return !isLiteralStringContext(args);
      },
      message:
        () => `Put commas and periods inside closing quotation marks in the standard American style.
${DocumentURL}`,
    },
    {
      pattern: /"([^"\n]+)([,.])"/g,
      test: (args) => {
        return isLiteralStringContext(args);
      },
      message:
        () => `When quoting a keyword or other literal string, put commas and periods outside the quotation marks.
${DocumentURL}`,
    },
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
