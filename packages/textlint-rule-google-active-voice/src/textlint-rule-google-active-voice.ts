// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const DocumentURL = "https://developers.google.com/style/voice";
export const defaultMessage =
  "Use active voice where possible; passive voice can make instructions less direct.\n" +
  `URL: ${DocumentURL}`;

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  const dictionaries: MatchReplaceDictionary[] = [
    {
      // Common passive pattern: auxiliary verb + past participle.
      pattern:
        /\b(?:(?:has|have|had)\s+been|is|are|was|were|be|been|being|get|gets|got|gotten)\s+(?:[a-z]+ly\s+)?(?:[a-z]{2,}ed|[a-z]{2,}en|known|shown|given|made|built|found|done|taken|written|read|set|put)\b(?:\s+by\b)?/gi,
      message: () => defaultMessage,
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
