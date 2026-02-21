// MIT © 2017 azu
import {
  paragraphReporter,
  getPosFromSingleWord,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const DocumentURL = "https://developers.google.com/style/possessives";
export const defaultMessage =
  'To form a possessive of a singular noun (regardless of whether it ends in s) or a plural noun that doesn\'t end in "s", add "\'s" to the end of the word' +
  "\n" +
  DocumentURL;
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
    // NG: plural word + 's
    {
      pattern: /(\w+)'s/,
      test: ({ captures }) => {
        const word = captures[0];
        // if plural word is ended in "s", ignore it.
        const isEndedS = word.endsWith("s");
        const wordPos = getPosFromSingleWord(word);
        // Plural word
        return wordPos === "NNS" && isEndedS;
      },
      message: () => defaultMessage,
    },
    // NG: singular noun + '
    {
      pattern: /([\w\s]+)'(?!s)/,
      test: ({ captures }) => {
        // ... word's
        // or ... the word's
        const words = captures[0].split(" ");
        const determinerIndex = words.length - 2;
        const determinerWord =
          determinerIndex >= 0 ? words[determinerIndex] : undefined;
        const targetWord = words[words.length - 1];
        // if "the word's", ignore this
        if (determinerWord) {
          const determinerType = getPosFromSingleWord(determinerWord);
          // skip: the a
          if (determinerType === "DT") {
            return false;
          }
        }
        const wordPos = getPosFromSingleWord(targetWord);
        // singular noun(singular noun or Proper noun)
        return wordPos === "NNP" || wordPos === "NN";
      },
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
