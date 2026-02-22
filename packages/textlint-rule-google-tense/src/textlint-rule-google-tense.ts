// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const TenseURL = "https://developers.google.com/style/tense";

export const presentTenseMessage =
  'Prefer present tense over "will" in reference and instructional text unless describing a specific future event, and avoid "would" for hypothetical instructions.\n' +
  `URL: ${TenseURL}`;

const futureContextPattern =
  /\b(next|later|future|upcoming|tomorrow|tonight|eventually)\b|\bin\s+\d+\s+(seconds?|minutes?|hours?|days?|weeks?|months?|years?)\b|\bby\s+\d{4}\b/i;

const extractSentenceAtIndex = (text: string, index: number): string => {
  let sentenceStart = index;
  while (sentenceStart > 0 && !/[.!?]/.test(text[sentenceStart - 1])) {
    sentenceStart--;
  }
  let sentenceEnd = index;
  while (sentenceEnd < text.length && !/[.!?]/.test(text[sentenceEnd])) {
    sentenceEnd++;
  }
  return text.slice(sentenceStart, sentenceEnd);
};

const shouldReportWillWould = ({
  all,
  index,
  match,
}: MatchReplaceDictionaryArgs): boolean => {
  const normalized = match.toLowerCase();
  if (normalized === "would") {
    return true;
  }
  const sentence = extractSentenceAtIndex(all, index);
  return !futureContextPattern.test(sentence);
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
    {
      pattern: /\b(will|would)\b/gi,
      test: shouldReportWillWould,
      message: () => presentTenseMessage,
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
