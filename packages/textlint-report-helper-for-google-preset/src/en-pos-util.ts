// MIT © 2017 azu
import { Tag } from "en-pos";
import {
  EnglishParser,
  type PosWordNode,
  type PosType as PosTypeLiteral,
} from "nlcst-parse-english";
import lexicon from "en-lexicon";
import type { Root, TextNode } from "nlcst-types";
import type { Node as UnistNode, Parent as UnistParent } from "unist-types";

const parser = new EnglishParser();

const normalizeWord = (word: string): string => {
  return word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");
};

const isParentNode = (node: UnistNode): node is UnistParent => {
  return Array.isArray((node as UnistParent).children);
};

const isTextNode = (node: UnistNode): node is TextNode => {
  return node.type === "TextNode";
};

const isWordNode = (node: UnistNode): node is PosWordNode => {
  return node.type === "WordNode";
};

const getTextNodeValue = (node: UnistNode): string => {
  if (isTextNode(node)) {
    return node.value;
  }
  if (!isParentNode(node) || node.children.length === 0) {
    return "";
  }
  return node.children.map(getTextNodeValue).join("");
};

const findWordNode = (
  rootNode: Root,
  word: string,
): PosWordNode | undefined => {
  const normalizedWord = normalizeWord(word);
  if (!normalizedWord) {
    return undefined;
  }
  const queue: UnistNode[] = [rootNode];
  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (!currentNode) {
      continue;
    }
    if (isWordNode(currentNode)) {
      const wordText = getTextNodeValue(currentNode);
      if (normalizeWord(wordText) === normalizedWord) {
        return currentNode;
      }
    }
    if (isParentNode(currentNode)) {
      queue.push(...currentNode.children);
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
  const wordNode = findWordNode(cstNode, word);
  if (wordNode) {
    return wordNode.data.pos;
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
