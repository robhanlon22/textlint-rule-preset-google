// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
  getPos,
  getPosFromSingleWord,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

// https://developers.google.com/style/clause-order
export const nounVerbMessage =
  "Noun+verb contractions: In general, avoid contractions formed from nouns and verbs.\n" +
  "URL: https://developers.google.com/style/contractions";
export const noDoubleContractions =
  "Don't use double contractions: Double contractions contain not just one but two contracted words.\n" +
  "URL: https://developers.google.com/style/contractions";
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
      pattern: /(\w+)'s (\w+)/,
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
      pattern: /(\w+)'re (\w+)/,
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
      pattern: /(\w+)'re (\w+) (\w+)/,
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
    // Don't use double contractions
    {
      pattern: /mightn't've/,
      replace: () => "might not have",
      message: () => noDoubleContractions,
    },
    {
      pattern: /mustn't've/,
      replace: () => "must not have",
      message: () => noDoubleContractions,
    },
    {
      pattern: /wouldn't've/,
      replace: () => "would not have",
      message: () => noDoubleContractions,
    },
    {
      pattern: /shouldn't've/,
      replace: () => "should not have",
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
