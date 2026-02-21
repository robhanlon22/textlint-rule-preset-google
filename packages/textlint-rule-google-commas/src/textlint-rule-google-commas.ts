// MIT © 2017 azu
import {
  bindRuleContext,
  paragraphReporter,
  getPosFromSingleWord,
  isSameGroupPosType,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const CLAUSE_SUBJECT_POS = new Set([
  "PRP",
  "NN",
  "NNS",
  "NNP",
  "NNPS",
  "DT",
  "EX",
  "WDT",
  "WP",
  "WP$",
]);

const normalizeWord = (word: string): string =>
  word.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  const dictionaries: MatchReplaceDictionary[] = [
    // Serial commas
    {
      pattern: /([\w-]+), (.*?([\w-]+)) (and|or) ([\w-]+)/g,
      test: ({ captures }) => {
        const word1 = captures[0];
        const word2 = captures[2];
        const word3 = captures[4];
        const pos1 = getPosFromSingleWord(word1);
        const pos2 = getPosFromSingleWord(word2);
        const pos3 = getPosFromSingleWord(word3);
        // For example, word1-3 are attached to same group
        // Word1 is NN, Word2 is NNP, Word3 is NN => true
        return isSameGroupPosType(pos1, pos2) && isSameGroupPosType(pos2, pos3);
      },
      replace: ({ captures }) => {
        return `${captures[0]}, ${captures[1]}, ${captures[3]} ${captures[4]}`;
        //                                    ^ <= add ,
      },
      message: () => {
        return `In a series of three or more items, use a comma before the final "and" or "or.".
https://developers.google.com/style/commas#serial-commas
`;
      },
    },
    // Commas after introductory words and phrases
    {
      pattern:
        /^(finally|first|second|third|overall|instead|meanwhile|specifically|generally) ([^,\n].*)$/i,
      replace: ({ captures }) => `${captures[0]}, ${captures[1]}`,
      message: () => {
        return `Use a comma after introductory words and phrases.
https://developers.google.com/style/commas#commas-after-introductory-words-and-phrases
`;
      },
    },
    // Commas separating two independent clauses
    {
      pattern: /^([^,]+) (and|but|nor|for|so|or|yet) ([^,]+)$/,
      test: ({ captures }) => {
        const prePhaseWords = captures[0].trim().split(/\s+/);
        const postPhaseWords = captures[2].trim().split(/\s+/);
        if (prePhaseWords.length < 3 || postPhaseWords.length < 3) {
          return false;
        }
        const subjectCandidate = normalizeWord(postPhaseWords[0]);
        if (!subjectCandidate) {
          return false;
        }
        return CLAUSE_SUBJECT_POS.has(getPosFromSingleWord(subjectCandidate));
      },
      replace: ({ captures }) =>
        `${captures[0]}, ${captures[1]} ${captures[2]}`,
      message: () => {
        return `Use a comma to separate two independent clauses joined by a coordinating conjunction.
https://developers.google.com/style/commas#commas-separating-two-independent-clauses
`;
      },
    },
    // Commas separating independent from dependent clauses
    {
      pattern:
        /^([^,]+), (and|or|but) (can|could|should|would|will|may|might|must)\b(.*)$/,
      replace: ({ captures }) =>
        `${captures[0]} ${captures[1]} ${captures[2]}${captures[3]}`,
      message: () => {
        return `Avoid a comma before a dependent clause that begins with a coordinating conjunction and an auxiliary verb.
https://developers.google.com/style/commas#commas-separating-independent-from-dependent-clauses
`;
      },
    },
    {
      pattern: /(who [^,]+) and ([a-z]+)\b/g,
      test: ({ captures }) => {
        return captures[0].trim().split(/\s+/).length >= 3;
      },
      replace: ({ captures }) => `${captures[0]}, and ${captures[1]}`,
      message: () => {
        return `Use a comma when needed to separate an independent clause from a preceding dependent clause.
https://developers.google.com/style/commas#commas-separating-independent-from-dependent-clauses
`;
      },
    },
    // Setting off other kinds of clauses
    {
      pattern:
        /([A-Za-z0-9)]) which (has|have|is|are|was|were|can|could|should|would|will|may|might|must)\b/g,
      replace: ({ captures }) => `${captures[0]}, which ${captures[1]}`,
      message: () => {
        return `Set off nonrestrictive clauses with commas.
https://developers.google.com/style/commas#setting-off-other-kinds-of-clauses
`;
      },
    },
    {
      pattern: /^(however|otherwise|therefore) /i,
      replace: ({ captures }) => `${captures[0]}, `,
      message: () => {
        return `In general, put a semicolon or a period or a dash before a conjunctive adverb, such as "otherwise" or "however" or "therefore," and put a comma after the conjunctive adverb.
https://developers.google.com/style/commas#setting-off-other-kinds-of-clauses
`;
      },
    },
    {
      pattern: /([.;–]) (however|otherwise|therefore) /g,
      replace: ({ captures }) => `${captures[0]} ${captures[1]}, `,
      message: () => {
        return `In general, put a semicolon or a period or a dash before a conjunctive adverb, such as "otherwise" or "however" or "therefore," and put a comma after the conjunctive adverb.
https://developers.google.com/style/commas#setting-off-other-kinds-of-clauses
`;
      },
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
