// MIT © 2017 azu
import {
  bindRuleContext,
  getPosFromSingleWord,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

//  Helping Verbs
// https://www.englishgrammar101.com/module-3/verbs/lesson-2/helping-verbs
// http://grammar.yourdictionary.com/parts-of-speech/verbs/Helping-Verbs.html
// http://study.com/academy/lesson/what-are-helping-verbs-definition-examples-quiz.html
const helpingVerbs = [
  "am",
  "are",
  "is",
  "was",
  "were",
  "be",
  "being",
  "been",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "could",
  "should",
  "would",
  "can",
  "shall",
  "will",
  "may",
  "might",
  "must",
];

const PROPER_NOUN_POS = new Set(["NNP", "NNPS"]);
const normalizeWord = (word: string): string =>
  word.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
const shouldLowercaseWordAfterColon = (word: string): boolean => {
  const normalizedWord = normalizeWord(word);
  if (!normalizedWord || !/^[A-Z]/.test(normalizedWord)) {
    return false;
  }
  // Keep acronyms and initialisms (for example, API) in uppercase.
  if (/^[A-Z0-9]{2,}$/.test(normalizedWord)) {
    return false;
  }
  return !PROPER_NOUN_POS.has(getPosFromSingleWord(normalizedWord));
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
    // Introductory phrase preceding colon
    {
      pattern: /(\w+):/g,
      test: ({ captures }) => {
        const helpingVerb = captures[0];
        return helpingVerbs.includes(helpingVerb);
      },
      message:
        () => `The text that precedes the colon must be able to stand alone as a complete sentence.
https://developers.google.com/style/colons#introductory-phrase-preceding-colon
`,
    },
    // Colons within sentences
    {
      pattern: /\w+:\s(\w+)/g,
      test: ({ all, captures, index, match }) => {
        const nextWord = captures[0];
        if (!shouldLowercaseWordAfterColon(nextWord)) {
          return false;
        }
        const followingWord = normalizeWord(
          all
            .slice(index + match.length)
            .trimStart()
            .split(/\s+/)[0] ?? "",
        );
        // Treat two consecutive capitalized words as a likely proper name.
        if (followingWord && /^[A-Z]/.test(followingWord)) {
          return false;
        }
        return true;
      },
      message:
        () => `In general, the first word in the text that follows a colon should be in lowercase.
https://developers.google.com/style/colons#colons-within-sentences
`,
    },
  ];

  return {
    [Syntax.Paragraph](node) {
      paragraphReporter({
        node,
        Syntax,
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
