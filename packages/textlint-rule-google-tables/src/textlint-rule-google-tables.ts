// MIT © 2017 azu
import { parseFragment } from "parse5";
import { bindRuleContext } from "@textlint-rule/textlint-report-helper-for-google-preset";

const STYLE_URL = "https://developers.google.com/style/tables";
const message = (reason: string): string => `${reason}\n${STYLE_URL}`;
const HEADER_TERMINAL_PUNCTUATION = /[.!?:;]$/;
const WORD_PATTERN = /[A-Za-z][A-Za-z0-9'-]*/g;
const ACRONYM_PATTERN = /^[A-Z0-9]{2,}$/;
const TABLE_CAPTION_PATTERN = /^\s*Table\s+\d+[.:]?\s+(.+?)\s*$/i;

interface HtmlLocationRange {
  startOffset?: number;
  endOffset?: number;
}

interface HtmlNode {
  nodeName: string;
  tagName?: string;
  value?: string;
  childNodes?: HtmlNode[];
  sourceCodeLocation?: {
    startOffset?: number;
    endOffset?: number;
    startTag?: HtmlLocationRange;
    endTag?: HtmlLocationRange;
  };
}

interface TableFinding {
  index: number;
  messageText: string;
}

interface TextSegment {
  text: string;
  start: number;
}

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

const isSentenceCase = (text: string): boolean => {
  const normalized = normalizeText(text);
  if (!normalized) {
    return true;
  }

  const words = normalized.match(WORD_PATTERN) ?? [];
  if (words.length === 0) {
    return true;
  }

  const firstWord = words[0] ?? "";
  if (!firstWord) {
    return true;
  }
  if (/^[a-z]/.test(firstWord)) {
    return false;
  }

  for (const word of words.slice(1)) {
    if (ACRONYM_PATTERN.test(word)) {
      continue;
    }
    if (/^[A-Z]/.test(word)) {
      return false;
    }
  }

  return true;
};

const collectTextSegmentsFromRuleNode = (
  node: GoogleRuleNode,
  segments: TextSegment[],
): void => {
  if (
    typeof node.value === "string" &&
    node.value.length > 0 &&
    Array.isArray(node.range)
  ) {
    segments.push({
      text: node.value,
      start: node.range[0],
    });
  }
  if (!Array.isArray(node.children)) {
    return;
  }
  for (const child of node.children) {
    collectTextSegmentsFromRuleNode(child, segments);
  }
};

const textInfoFromRuleNode = (
  node: GoogleRuleNode,
): TextSegment | undefined => {
  const segments: TextSegment[] = [];
  collectTextSegmentsFromRuleNode(node, segments);
  if (segments.length === 0) {
    return undefined;
  }
  return {
    text: segments.map((segment) => segment.text).join(" "),
    start: segments[0].start,
  };
};

const getNodeChildrenByType = (
  node: GoogleRuleNode,
  type: string,
): GoogleRuleNode[] => {
  if (!Array.isArray(node.children)) {
    return [];
  }
  return node.children.filter((child) => child.type === type);
};

const getHtmlNodeChildren = (node: HtmlNode): HtmlNode[] => {
  return Array.isArray(node.childNodes) ? node.childNodes : [];
};

const visitHtmlTree = (
  node: HtmlNode,
  visit: (node: HtmlNode) => void,
): void => {
  visit(node);
  for (const child of getHtmlNodeChildren(node)) {
    visitHtmlTree(child, visit);
  }
};

const getHtmlNodeText = (node: HtmlNode): string => {
  if (node.nodeName === "#text") {
    return typeof node.value === "string" ? node.value : "";
  }
  return getHtmlNodeChildren(node).map(getHtmlNodeText).join("");
};

const getHtmlNodeStartOffset = (node: HtmlNode): number => {
  const startTagOffset = node.sourceCodeLocation?.startTag?.startOffset;
  if (typeof startTagOffset === "number") {
    return startTagOffset;
  }
  const startOffset = node.sourceCodeLocation?.startOffset;
  if (typeof startOffset === "number") {
    return startOffset;
  }
  return 0;
};

const inspectMarkdownTableNode = (
  node: GoogleRuleNode,
  syntax: GoogleRuleContext["Syntax"],
): TableFinding[] => {
  const rows = getNodeChildrenByType(node, syntax.TableRow);
  if (rows.length === 0) {
    return [];
  }
  const headerRow = rows[0];

  const findings: TableFinding[] = [];
  const headerCells = getNodeChildrenByType(headerRow, syntax.TableCell);
  for (const cell of headerCells) {
    const textInfo = textInfoFromRuleNode(cell);
    if (!textInfo) {
      continue;
    }
    const visible = normalizeText(textInfo.text);
    if (!visible) {
      continue;
    }

    if (!isSentenceCase(visible)) {
      findings.push({
        index: textInfo.start,
        messageText:
          "Use sentence case for table headers. In tables, headings should use sentence case.",
      });
    }

    if (HEADER_TERMINAL_PUNCTUATION.test(visible)) {
      findings.push({
        index: textInfo.start,
        messageText: "Table headers should not end with punctuation.",
      });
    }
  }

  return findings;
};

const inspectHtmlTableNode = (tableNode: HtmlNode): TableFinding[] => {
  const findings: TableFinding[] = [];

  visitHtmlTree(tableNode, (node) => {
    if (node.tagName === "th") {
      const visible = normalizeText(getHtmlNodeText(node));
      if (!visible) {
        return;
      }
      if (!isSentenceCase(visible)) {
        findings.push({
          index: getHtmlNodeStartOffset(node),
          messageText:
            "Use sentence case for table headers. In tables, headings should use sentence case.",
        });
      }
      if (HEADER_TERMINAL_PUNCTUATION.test(visible)) {
        findings.push({
          index: getHtmlNodeStartOffset(node),
          messageText: "Table headers should not end with punctuation.",
        });
      }
      return;
    }

    if (node.tagName === "caption") {
      const visible = normalizeText(getHtmlNodeText(node)).replace(
        /^Table\s+\d+[.:]?\s*/i,
        "",
      );
      if (!visible) {
        return;
      }
      if (!isSentenceCase(visible)) {
        findings.push({
          index: getHtmlNodeStartOffset(node),
          messageText: "Use sentence case for table captions.",
        });
      }
    }
  });

  return findings;
};

const inspectHtmlSource = (source: string): TableFinding[] => {
  if (!/<table\b/i.test(source)) {
    return [];
  }
  const fragment = parseFragment(source, {
    sourceCodeLocationInfo: true,
  }) as unknown as HtmlNode;
  const findings: TableFinding[] = [];
  visitHtmlTree(fragment, (node) => {
    if (node.tagName === "table") {
      findings.push(...inspectHtmlTableNode(node));
    }
  });
  return findings;
};

const inspectMarkdownCaptionParagraph = (
  node: GoogleRuleNode,
  source: string,
): TableFinding[] => {
  const normalized = normalizeText(source);
  const match = TABLE_CAPTION_PATTERN.exec(normalized);
  if (!match) {
    return [];
  }
  const caption = match[1];
  if (isSentenceCase(caption)) {
    return [];
  }
  return [
    {
      index: 0,
      messageText: "Use sentence case for table captions.",
    },
  ];
};

const createReporter: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    report: reportError,
    getSource,
  } = bindRuleContext(context);
  const emitted = new Set<string>();

  const reportFinding = (node: GoogleRuleNode, finding: TableFinding): void => {
    const key = `${String(node.range[0])}:${String(finding.index)}:${finding.messageText}`;
    if (emitted.has(key)) {
      return;
    }
    emitted.add(key);
    reportError(
      node,
      new RuleError(message(finding.messageText), { index: finding.index }),
    );
  };

  const reportAll = (node: GoogleRuleNode, findings: TableFinding[]): void => {
    for (const finding of findings) {
      reportFinding(node, finding);
    }
  };

  return {
    [Syntax.Table](node) {
      reportAll(node, inspectMarkdownTableNode(node, Syntax));
    },
    [Syntax.Paragraph](node) {
      reportAll(node, inspectMarkdownCaptionParagraph(node, getSource(node)));
    },
    [Syntax.Html](node) {
      reportAll(node, inspectHtmlSource(getSource(node)));
    },
    [Syntax.HtmlBlock](node) {
      reportAll(node, inspectHtmlSource(getSource(node)));
    },
  };
};

const rule: GoogleRuleModule = {
  linter: createReporter,
  fixer: createReporter,
};

export default rule;
