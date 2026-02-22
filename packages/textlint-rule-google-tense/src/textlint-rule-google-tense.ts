// MIT © 2017 azu
import {
  bindRuleContext,
  getPosFromSingleWord,
  paragraphReporter,
} from "@textlint-rule/textlint-report-helper-for-google-preset";

const TenseURL = "https://developers.google.com/style/tense";
const ReferenceVerbURL = "https://developers.google.com/style/reference-verbs";

type SubjectNumber = "singular" | "plural" | "unknown";

const singularDeterminers = new Set([
  "a",
  "an",
  "this",
  "that",
  "each",
  "every",
]);
const pluralDeterminers = new Set(["these", "those"]);
const singularEndingSExceptions = new Set([
  "analysis",
  "axis",
  "basis",
  "business",
  "class",
  "status",
  "thesis",
]);

export const presentTenseMessage =
  'Prefer present tense over "will" or "would" in reference and instructional text.\n' +
  `URL: ${TenseURL}`;
export const useDoesMessage =
  'Use "does" rather than "do" with third-person singular subjects in specification-style statements.\n' +
  `URL: ${ReferenceVerbURL}`;
export const useDoMessage =
  'Use "do" rather than "does" with plural subjects in specification-style statements.\n' +
  `URL: ${ReferenceVerbURL}`;

const normalizeWord = (word: string): string => {
  return word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");
};

const isLikelyPluralBySpelling = (word: string): boolean => {
  const normalized = normalizeWord(word);
  if (!normalized) {
    return false;
  }
  return normalized.endsWith("s") && !singularEndingSExceptions.has(normalized);
};

const getSubjectNumber = (
  determiner: string,
  subject: string,
): SubjectNumber => {
  const normalizedDeterminer = determiner.toLowerCase();
  if (singularDeterminers.has(normalizedDeterminer)) {
    return "singular";
  }
  if (pluralDeterminers.has(normalizedDeterminer)) {
    return "plural";
  }
  const pos = getPosFromSingleWord(subject);
  if (pos === "NNS" || pos === "NNPS") {
    return "plural";
  }
  if (pos === "NN" || pos === "NNP") {
    return "singular";
  }
  if (isLikelyPluralBySpelling(subject)) {
    return "plural";
  }
  const normalizedSubject = normalizeWord(subject);
  if (!normalizedSubject) {
    return "unknown";
  }
  return "singular";
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
      message: () => presentTenseMessage,
    },
    {
      // Spec-like subject + do/does agreement check.
      pattern:
        /\b(the|a|an|this|that|these|those|each|every)\s+(?:[A-Za-z][\w-]*\s+)?([A-Za-z][\w-]*)\s+(do|does)\b/gi,
      test: ({ captures }) => {
        const determiner = captures[0];
        const subject = captures[1];
        const verb = captures[2].toLowerCase();
        const subjectNumber = getSubjectNumber(determiner, subject);
        if (subjectNumber === "unknown") {
          return false;
        }
        if (verb === "do") {
          return subjectNumber === "singular";
        }
        return subjectNumber === "plural";
      },
      message: ({ captures }) => {
        const verb = captures[2].toLowerCase();
        return verb === "do" ? useDoesMessage : useDoMessage;
      },
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
