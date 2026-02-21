// MIT © 2017 azu
import { Tag } from "en-pos";
import type { PosType as PosTypeLiteral } from "nlcst-parse-english";
import lexicon from "en-lexicon";

const wordTokenPattern = /[A-Za-z]+(?:'[A-Za-z]+)?/g;

const normalizeWord = (word: string): string => {
  return word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");
};

const extractWords = (text: string): string[] => {
  return text.match(wordTokenPattern) ?? [];
};

// Additional lexicon
lexicon.extend({
  browser: "NN",
});
/**
 * Pos Type
 * @see https://github.com/finnlp/en-pos
 */
export const PosType = {
  Noun: "NN",
  PluralNoun: "NNS",
  ProperNoun: "NNP",
  PluralProperNoun: "NNPS",
  BaseFormVerb: "VB",
  PresentFormVerb: "VBP",
  PresentForm3RdPerson: "VBZ",
  GerundFormVerb: "VBG",
  PastTenseVerb: "VBD",
  PastParticipleVerb: "VBN",
  ModalVerb: "MD",
  Adjective: "JJ",
  ComparativeAdjective: "JJR",
  SuperlativeAdjective: "JJS",
  Adverb: "RB",
  ComparativeAdverb: "RBR",
  SuperlativeAdverb: "RBS",
  Determiner: "DT",
  Predeterminer: "PDT",
  PersonalPronoun: "PRP",
  PossessivePronoun: "PRP$",
  PossessiveEnding: "POS",
  Preposition: "IN",
  Particle: "PR",
  To: "TO",
  WhDeterminer: "WDT",
  WhPronoun: "WP",
  WhPossessive: "WP$",
  WhAdverb: "WRB",
  ExpletiveThere: "EX",
  CoordinatingConjugation: "CC",
  CardinalNumbers: "CD",
  ListItemMarker: "LS",
  Interjection: "UH",
  ForeignWords: "FW",
  Comma: ",",
  MidSentPunct: ":",
  SentFinalPunct: ".",
  LeftParenthesis: "(",
  RightParenthesis: ")",
  PoundSign: "#",
  CurrencySymbols: "$",
  OtherSymbols: "SYM",
  EmojisEmoticons: "EM",
};

export const getPosFromSingleWord = (word: string): PosTypeLiteral => {
  const tags = new Tag([word])
    .initial() // initial dictionary and pattern based tagging
    .smooth().tags; // further context based smoothing
  return tags[0] as PosTypeLiteral;
};

export const getPos = (text: string, word: string): string => {
  const words = extractWords(text);
  if (words.length === 0) {
    return "";
  }
  const normalizedWord = normalizeWord(word);
  if (!normalizedWord) {
    return "";
  }
  const tags = new Tag(words)
    .initial() // initial dictionary and pattern based tagging
    .smooth().tags; // further context based smoothing
  const index = words.findIndex((candidate) => {
    return normalizeWord(candidate) === normalizedWord;
  });
  return index >= 0 ? tags[index] : "";
};

/**
 * Return true if aPosType's group is same with bPosType's group.
 * @param {PosType} aPosType
 * @param {PosType} bPosType
 * @returns {boolean}
 */
export const isSameGroupPosType = (
  aPosType: PosTypeLiteral,
  bPosType: PosTypeLiteral,
): boolean => {
  // NNS vs. NN => true
  return aPosType.slice(0, 2) === bPosType.slice(0, 2);
};
