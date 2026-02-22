// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
  getPos,
  getPosFromSingleWord,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const DocumentURL = "https://developers.google.com/style/contractions";

// https://developers.google.com/style/contractions
export const nounVerbMessage =
  "Noun+verb contractions: In general, avoid contractions formed from nouns and verbs.\n" +
  `URL: ${DocumentURL}`;
export const lessCommonContractionsMessage =
  "Use common contractions that are clear for a global audience.\n" +
  `URL: ${DocumentURL}`;
export const noDoubleContractions =
  "Don't use double contractions: Double contractions contain not just one but two contracted words.\n" +
  `URL: ${DocumentURL}`;

const withLeadingCase = (match: string, replacement: string): string => {
  if (match.length === 0) {
    return replacement;
  }
  if (!/^[A-Z]/.test(match)) {
    return replacement;
  }
  return `${replacement[0].toUpperCase()}${replacement.slice(1)}`;
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
      pattern: /\b(\w+)'s (\w+)\b/g,
      test: ({ all, captures }) => {
        // name
        return (
          getPosFromSingleWord(captures[0]).startsWith("NN") &&
          // Adverb
          getPos(all, captures[1]).startsWith("RB")
        );
      },
      message: () => nounVerbMessage,
    },
    {
      // These machines’re slow.
      pattern: /\b(\w+)'re (\w+)\b/g,
      test: ({ all, captures }) => {
        // name
        return (
          getPosFromSingleWord(captures[0]).startsWith("NN") &&
          // Adverb or Adjective
          /^(RB|JJ)/.test(getPos(all, captures[1]))
        );
      },
      message: () => nounVerbMessage,
    },
    {
      // The following guides're (a) good way to learn to use Universal Analytics.
      pattern: /\b(\w+)'re (\w+) (\w+)\b/g,
      test: ({ all, captures }) => {
        // name
        return (
          getPosFromSingleWord(captures[0]).startsWith("NN") &&
          // Determiner
          getPos(all, captures[1]).includes("DT") &&
          // Adverb or Adjective
          /^(RB|JJ)/.test(getPos(all, captures[2]))
        );
      },
      message: () => nounVerbMessage,
    },
    {
      pattern: /\bhasn't\b/gi,
      replace: ({ match }) => withLeadingCase(match, "has not"),
      message: () => lessCommonContractionsMessage,
    },
    {
      pattern: /\bneedn't\b/gi,
      message: () => lessCommonContractionsMessage,
    },
    {
      pattern: /\bit'll\b/gi,
      replace: ({ match }) => withLeadingCase(match, "it will"),
      message: () => lessCommonContractionsMessage,
    },
    {
      pattern: /\bthat'll\b/gi,
      replace: ({ match }) => withLeadingCase(match, "that will"),
      message: () => lessCommonContractionsMessage,
    },
    {
      pattern: /\bthey'd\b(?!'ve)/gi,
      message: () => lessCommonContractionsMessage,
    },
    {
      pattern: /\bit'd\b(?!'ve)/gi,
      message: () => lessCommonContractionsMessage,
    },
    // Don't use double contractions
    {
      pattern: /\bmightn't've\b/gi,
      replace: ({ match }) => withLeadingCase(match, "might not have"),
      message: () => noDoubleContractions,
    },
    {
      pattern: /\bmustn't've\b/gi,
      replace: ({ match }) => withLeadingCase(match, "must not have"),
      message: () => noDoubleContractions,
    },
    {
      pattern: /\bwouldn't've\b/gi,
      replace: ({ match }) => withLeadingCase(match, "would not have"),
      message: () => noDoubleContractions,
    },
    {
      pattern: /\bshouldn't've\b/gi,
      replace: ({ match }) => withLeadingCase(match, "should not have"),
      message: () => noDoubleContractions,
    },
    {
      pattern: /\bit'd've\b/gi,
      replace: ({ match }) => withLeadingCase(match, "it would have"),
      message: () => noDoubleContractions,
    },
    {
      pattern: /\bthey'd've\b/gi,
      replace: ({ match }) => withLeadingCase(match, "they would have"),
      message: () => noDoubleContractions,
    },
  ];

  return {
    [Syntax.Paragraph](node) {
      paragraphReporter({
        Syntax,
        node,
        dictionaries,
        getSource,
        report: reportError,
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
