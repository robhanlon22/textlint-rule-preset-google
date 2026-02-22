// MIT © 2017 azu
import { bindRuleContext } from "@textlint-rule/textlint-report-helper-for-google-preset";

const STYLE_URL = "https://developers.google.com/style/periods";
const message = (reason: string): string => `${reason}\n${STYLE_URL}`;
const TERMINAL_PUNCTUATION = /[.!?]$/;
const SENTENCE_HINT_VERB =
  /\b(?:is|are|was|were|be|been|being|has|have|had|do|does|did|can|could|should|would|will|must|may|might)\b/i;

const replaceWithSpaces = (match: string): string => " ".repeat(match.length);

const stripMarkdown = (text: string): string =>
  text
    .replace(/<[^>]*>/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/!?\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/_/g, "")
    .trim();

const normalizeText = (text: string): string =>
  stripMarkdown(text).replace(/\s+/g, " ").trim();

const stripListMarker = (text: string): string =>
  text.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "");

interface ListAnalysis {
  hasTerminalPunctuation: boolean;
  looksLikeFragment: boolean;
  looksLikeSentence: boolean;
}

const analyzeListItem = (source: string): ListAnalysis => {
  const normalized = normalizeText(stripListMarker(source));
  const words = normalized.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  const lowerStart = /^[a-z]/.test(normalized);
  const hasTerminalPunctuation = TERMINAL_PUNCTUATION.test(normalized);
  const looksLikeFragment =
    words.length > 0 && (words.length <= 4 || lowerStart);
  const looksLikeSentence =
    /^[A-Z]/.test(normalized) &&
    words.length >= 6 &&
    SENTENCE_HINT_VERB.test(normalized);

  return {
    hasTerminalPunctuation,
    looksLikeFragment,
    looksLikeSentence,
  };
};

const stripDecimalSkips = (source: string): string =>
  source
    .replace(/`[^`]*`/g, replaceWithSpaces)
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, replaceWithSpaces)
    .replace(/(?:https?:\/\/|ftp:\/\/|www\.)[^\s)>\]]+/g, replaceWithSpaces);

const isThousandsGroupedNumber = (value: string): boolean =>
  /^\d{1,3}(?:,\d{3})+$/.test(value);

const checkDecimalCommaNumbers = (
  node: GoogleRuleNode,
  source: string,
  RuleError: GoogleRuleContext["RuleError"],
  reportError: GoogleRuleContext["report"],
): void => {
  const candidatePattern = /\b\d+(?:,\d+)+\b/g;
  const sanitized = stripDecimalSkips(source);

  for (const match of sanitized.matchAll(candidatePattern)) {
    const value = match[0];
    if (!value || isThousandsGroupedNumber(value)) {
      continue;
    }
    reportError(
      node,
      new RuleError(
        message(
          "Use periods for decimal points in numbers. If this is a decimal value, replace the comma with a period.",
        ),
        { index: match.index },
      ),
    );
  }
};

interface CaptionCandidate {
  kind: "figure" | "table";
  index: number;
  text: string;
}

const normalizeCaptionText = (value: string): string =>
  normalizeText(value).replace(/\s+/g, " ").trim();

const collectHtmlCaptionCandidates = (source: string): CaptionCandidate[] => {
  const candidates: CaptionCandidate[] = [];
  const htmlCaptionPattern =
    /<\s*(caption|figcaption)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi;

  for (const match of source.matchAll(htmlCaptionPattern)) {
    const tag = match[1].toLowerCase();
    const text = normalizeCaptionText(match[2]);
    if (!text) {
      continue;
    }
    candidates.push({
      kind: tag === "figcaption" ? "figure" : "table",
      index: match.index,
      text,
    });
  }

  return candidates;
};

const collectMarkdownCaptionCandidates = (
  source: string,
): CaptionCandidate[] => {
  const candidates: CaptionCandidate[] = [];
  const markdownCaptionPattern =
    /^\s*(?:\*\*)?(Figure|Table)\s+\d+[.:]?(?:\*\*)?\s+(.+?)\s*$/gim;

  for (const match of source.matchAll(markdownCaptionPattern)) {
    const kindToken = match[1].toLowerCase();
    const text = normalizeCaptionText(match[2]);
    if (!text) {
      continue;
    }
    candidates.push({
      kind: kindToken === "figure" ? "figure" : "table",
      index: match.index,
      text,
    });
  }

  return candidates;
};

const checkCaptionPunctuation = (
  node: GoogleRuleNode,
  source: string,
  RuleError: GoogleRuleContext["RuleError"],
  reportError: GoogleRuleContext["report"],
): void => {
  const candidates = [
    ...collectHtmlCaptionCandidates(source),
    ...collectMarkdownCaptionCandidates(source),
  ];

  for (const candidate of candidates) {
    if (
      candidate.kind === "figure" &&
      !TERMINAL_PUNCTUATION.test(candidate.text)
    ) {
      reportError(
        node,
        new RuleError(message("Figure captions should end with punctuation."), {
          index: candidate.index,
        }),
      );
      continue;
    }

    if (
      candidate.kind === "table" &&
      TERMINAL_PUNCTUATION.test(candidate.text)
    ) {
      reportError(
        node,
        new RuleError(
          message("Table captions should not end with terminal punctuation."),
          {
            index: candidate.index,
          },
        ),
      );
    }
  }
};

const maskInlineCode = (source: string): string =>
  source
    .replace(/`[^`]*`/g, replaceWithSpaces)
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, replaceWithSpaces);

const checkUrlTrailingPeriods = (
  node: GoogleRuleNode,
  source: string,
  RuleError: GoogleRuleContext["RuleError"],
  reportError: GoogleRuleContext["report"],
): void => {
  const sanitized = maskInlineCode(source);
  const trailingPeriodPattern =
    /(?:https?:\/\/|ftp:\/\/|www\.)[^\s)>\]]+\.(?=(?:\s|$|[)>"'\]]))/g;

  for (const match of sanitized.matchAll(trailingPeriodPattern)) {
    reportError(
      node,
      new RuleError(
        message(
          "Heuristic check: avoid trailing periods immediately after URLs because readers can mistake the period as part of the URL.",
        ),
        { index: match.index },
      ),
    );
  }
};

const checkQuotationPeriodPlacement = (
  node: GoogleRuleNode,
  source: string,
  RuleError: GoogleRuleContext["RuleError"],
  reportError: GoogleRuleContext["report"],
): void => {
  const sanitized = maskInlineCode(source);
  const quotePattern = /"[^"\n]+"\.(?=\s|$)/g;

  for (const match of sanitized.matchAll(quotePattern)) {
    reportError(
      node,
      new RuleError(
        message(
          "Heuristic check: review period placement with quotation marks. In American style, periods are usually placed inside double quotes unless quoting literal strings.",
        ),
        { index: match.index },
      ),
    );
  }
};

const checkParenthesisPeriodPlacement = (
  node: GoogleRuleNode,
  source: string,
  RuleError: GoogleRuleContext["RuleError"],
  reportError: GoogleRuleContext["report"],
): void => {
  const sanitized = maskInlineCode(source);
  const fragmentPeriodInsidePattern = /\(([a-z][^)]*?)\.\)(?=\s|$)/g;
  const duplicatedTerminalPattern = /\(([A-Z][^)]*[.!?])\)\.(?=\s|$)/g;

  for (const match of sanitized.matchAll(fragmentPeriodInsidePattern)) {
    reportError(
      node,
      new RuleError(
        message(
          "Heuristic check: parenthetical fragments usually place the sentence period outside the closing parenthesis.",
        ),
        { index: match.index },
      ),
    );
  }

  for (const match of sanitized.matchAll(duplicatedTerminalPattern)) {
    reportError(
      node,
      new RuleError(
        message(
          "Heuristic check: parenthesized full sentences usually keep terminal punctuation inside the parenthesis without an extra trailing period.",
        ),
        { index: match.index },
      ),
    );
  }
};

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    getSource,
    report: reportError,
  } = bindRuleContext(context);

  const inspectParagraphLikeNode = (
    node: GoogleRuleNode,
    source: string,
  ): void => {
    checkUrlTrailingPeriods(node, source, RuleError, reportError);
    checkQuotationPeriodPlacement(node, source, RuleError, reportError);
    checkParenthesisPeriodPlacement(node, source, RuleError, reportError);
    checkDecimalCommaNumbers(node, source, RuleError, reportError);
    checkCaptionPunctuation(node, source, RuleError, reportError);
  };

  const inspectListNode = (node: GoogleRuleNode): void => {
    const listItems = (node.children ?? []).filter(
      (child) => child.type === Syntax.ListItem,
    );
    if (listItems.length === 0) {
      return;
    }

    const analyses = listItems.map((itemNode) => ({
      itemNode,
      ...analyzeListItem(getSource(itemNode)),
    }));
    const punctuatedCount = analyses.filter(
      (analysis) => analysis.hasTerminalPunctuation,
    ).length;

    if (punctuatedCount > 0 && punctuatedCount < analyses.length) {
      for (const analysis of analyses) {
        reportError(
          analysis.itemNode,
          new RuleError(
            message(
              "Heuristic check: use consistent punctuation in lists. Sentence fragments usually omit periods, while complete sentence items use periods.",
            ),
          ),
        );
      }
      return;
    }

    if (punctuatedCount === analyses.length) {
      const fragmentLikeItems = analyses.filter(
        (analysis) => analysis.looksLikeFragment,
      );
      if (fragmentLikeItems.length >= Math.ceil(analyses.length / 2)) {
        for (const analysis of fragmentLikeItems) {
          reportError(
            analysis.itemNode,
            new RuleError(
              message(
                "Heuristic check: this list item looks like a fragment, and fragments usually omit terminal periods.",
              ),
            ),
          );
        }
      }
      return;
    }

    const sentenceLikeItems = analyses.filter(
      (analysis) => analysis.looksLikeSentence,
    );
    if (sentenceLikeItems.length >= Math.ceil(analyses.length / 2)) {
      for (const analysis of sentenceLikeItems) {
        reportError(
          analysis.itemNode,
          new RuleError(
            message(
              "Heuristic check: this list item looks like a complete sentence; complete sentence items usually end with periods.",
            ),
          ),
        );
      }
    }
  };

  return {
    [Syntax.Header](node) {
      const heading = normalizeText(getSource(node))
        .replace(/\s+#+\s*$/, "")
        .trim();
      if (TERMINAL_PUNCTUATION.test(heading)) {
        reportError(
          node,
          new RuleError(
            message("Headings should not end with terminal punctuation."),
          ),
        );
      }
      checkDecimalCommaNumbers(node, getSource(node), RuleError, reportError);
    },
    [Syntax.List](node) {
      inspectListNode(node);
    },
    [Syntax.ListItem](node) {
      checkDecimalCommaNumbers(node, getSource(node), RuleError, reportError);
    },
    [Syntax.Paragraph](node) {
      inspectParagraphLikeNode(node, getSource(node));
    },
    [Syntax.Html](node) {
      inspectParagraphLikeNode(node, getSource(node));
    },
    [Syntax.HtmlBlock](node) {
      inspectParagraphLikeNode(node, getSource(node));
    },
  };
};

const rule = {
  linter: report,
  fixer: report,
};

export default rule;
