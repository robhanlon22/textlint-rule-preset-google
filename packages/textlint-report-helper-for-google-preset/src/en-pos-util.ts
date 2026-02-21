// MIT © 2017 azu
import { Tag } from "en-pos";
import { EnglishParser, PosType as PosTypeLiteral } from "nlcst-parse-english";
import lexicon from "en-lexicon";

interface UnistNode {
  type: string;
  [key: string]: unknown;
}

const parser = new EnglishParser() as unknown as {
  parse(text: string): UnistNode;
};

interface WordNode extends UnistNode {
  type: "WordNode";
  value?: string;
  data?: {
    pos?: string;
  };
}

const findWordNode = (
  rootNode: UnistNode,
  word: string,
): WordNode | undefined => {
  const queue: UnistNode[] = [rootNode];
  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (!currentNode) {
      continue;
    }
    if (currentNode.type === "WordNode") {
      const wordNode = currentNode as WordNode;
      if (wordNode.value === word) {
        return wordNode;
      }
    }
    const children = (currentNode as { children?: UnistNode[] }).children;
    if (children && children.length > 0) {
      queue.push(...children);
    }
  }
  return undefined;
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
  const cstNode = parser.parse(text);
  const node = findWordNode(cstNode, word);

  if (node?.data?.pos) {
    return node.data.pos;
  }
  return "";
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
