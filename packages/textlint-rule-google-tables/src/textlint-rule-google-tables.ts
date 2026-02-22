// MIT © 2017 azu
import { bindRuleContext } from "@textlint-rule/textlint-report-helper-for-google-preset";

const STYLE_URL = "https://developers.google.com/style/tables";
const message = (reason: string): string => `${reason}\n${STYLE_URL}`;
const HEADER_TERMINAL_PUNCTUATION = /[.!?:;]$/;
const WORD_PATTERN = /[A-Za-z][A-Za-z0-9'-]*/g;
const ACRONYM_PATTERN = /^[A-Z0-9]{2,}$/;

interface LineInfo {
  line: string;
  offset: number;
}

interface TableCellInfo {
  absoluteStart: number;
  trimmed: string;
  trimmedStart: number;
}

interface TableFinding {
  index: number;
  messageText: string;
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

const isTableRow = (line: string): boolean => {
  const normalized = line.trim();
  const pipeCount = (normalized.match(/\|/g) ?? []).length;
  return normalized.length >= 3 && pipeCount >= 2;
};

const splitLines = (source: string): LineInfo[] => {
  const lines: LineInfo[] = [];
  const linePattern = /([^\r\n]*)(\r\n|\n|\r|$)/g;

  for (const match of source.matchAll(linePattern)) {
    const line = match[1];
    const newline = match[2];
    const offset = match.index;
    if (line === "" && newline === "" && lines.length > 0) {
      break;
    }
    lines.push({ line, offset });
  }

  return lines;
};

const splitTableCells = (line: string, lineOffset: number): TableCellInfo[] => {
  const normalized = line.trim();
  const trimStart = line.length - line.trimStart().length;
  const hasLeadingPipe = normalized.startsWith("|");
  const hasTrailingPipe = normalized.endsWith("|");
  const bodyStart = hasLeadingPipe ? 1 : 0;
  const bodyEnd = hasTrailingPipe ? normalized.length - 1 : normalized.length;

  const cells: TableCellInfo[] = [];
  let cellStart = bodyStart;
  for (let cursor = bodyStart; cursor <= bodyEnd; cursor += 1) {
    if (cursor === bodyEnd || normalized[cursor] === "|") {
      const raw = normalized.slice(cellStart, cursor);
      const trimmed = raw.trim();
      if (trimmed) {
        const absoluteStart = lineOffset + trimStart + cellStart;
        const trimmedStart = raw.indexOf(trimmed);
        cells.push({
          absoluteStart,
          trimmed,
          trimmedStart: trimmedStart < 0 ? 0 : trimmedStart,
        });
      }
      cellStart = cursor + 1;
    }
  }

  return cells;
};

const isSeparatorRow = (line: string): boolean =>
  splitTableCells(line, 0).every((cell) =>
    /^\s*:?-{3,}:?\s*$/.test(cell.trimmed),
  );

const isSentenceCase = (text: string): boolean => {
  const normalized = normalizeText(text);
  if (!normalized) {
    return true;
  }

  const words = normalized.match(WORD_PATTERN) ?? [];
  if (words.length === 0) {
    return true;
  }

  const firstWord = words[0];
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

const inspectPipeTables = (source: string): TableFinding[] => {
  const findings: TableFinding[] = [];
  const lines = splitLines(source);

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i];
    if (!isTableRow(current.line)) {
      continue;
    }

    let pointer = i;
    const block: LineInfo[] = [];
    while (pointer < lines.length && isTableRow(lines[pointer].line)) {
      const lineInfo = lines[pointer];
      block.push(lineInfo);
      pointer += 1;
    }

    if (block.length < 2) {
      i = pointer - 1;
      continue;
    }

    const header = block[0];
    const separator = block[1];
    if (!isSeparatorRow(separator.line)) {
      i = pointer - 1;
      continue;
    }

    const cells = splitTableCells(header.line, header.offset);
    for (const cell of cells) {
      const visible = normalizeText(cell.trimmed);
      if (!visible) {
        continue;
      }

      const sentenceCaseIndex = cell.absoluteStart + cell.trimmedStart;
      if (!isSentenceCase(visible)) {
        findings.push({
          index: sentenceCaseIndex,
          messageText:
            "Heuristic check: use sentence case for table headers; avoid title case unless capitalization is required.",
        });
      }

      if (HEADER_TERMINAL_PUNCTUATION.test(visible)) {
        findings.push({
          index: sentenceCaseIndex + Math.max(0, visible.length - 1),
          messageText: "Table headers should not end with punctuation.",
        });
      }
    }

    i = pointer - 1;
  }

  return findings;
};

const inspectHtmlTableHeaders = (source: string): TableFinding[] => {
  const findings: TableFinding[] = [];
  const pattern = /<th\b[^>]*>([\s\S]*?)<\/th>/gi;

  for (const match of source.matchAll(pattern)) {
    const visible = normalizeText(match[1]);
    if (!visible) {
      continue;
    }

    const index = match.index;
    if (!isSentenceCase(visible)) {
      findings.push({
        index,
        messageText:
          "Heuristic check: use sentence case for table headers; avoid title case unless capitalization is required.",
      });
    }

    if (HEADER_TERMINAL_PUNCTUATION.test(visible)) {
      findings.push({
        index,
        messageText: "Table headers should not end with punctuation.",
      });
    }
  }

  return findings;
};

const inspectTableCaptions = (source: string): TableFinding[] => {
  const findings: TableFinding[] = [];

  const htmlCaptionPattern = /<caption\b[^>]*>([\s\S]*?)<\/caption>/gi;
  for (const match of source.matchAll(htmlCaptionPattern)) {
    const captionText = normalizeText(match[1]).replace(
      /^Table\s+\d+[.:]?\s*/i,
      "",
    );
    if (!captionText) {
      continue;
    }

    if (!isSentenceCase(captionText)) {
      findings.push({
        index: match.index,
        messageText: "Heuristic check: use sentence case for table captions.",
      });
    }
  }

  const markdownCaptionPattern =
    /^\s*(?:\*\*)?Table\s+\d+[.:]?(?:\*\*)?\s+(.+?)\s*$/gim;
  for (const match of source.matchAll(markdownCaptionPattern)) {
    const captionText = normalizeText(match[1]);
    if (!captionText) {
      continue;
    }

    if (!isSentenceCase(captionText)) {
      findings.push({
        index: match.index,
        messageText: "Heuristic check: use sentence case for table captions.",
      });
    }
  }

  return findings;
};

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    report: reportError,
    getSource,
  } = bindRuleContext(context);

  const emitted = new Set<string>();
  const reportFinding = (
    node: GoogleRuleNode,
    index: number,
    messageText: string,
  ): void => {
    const key = `${String(node.range[0])}:${String(index)}:${messageText}`;
    if (emitted.has(key)) {
      return;
    }
    emitted.add(key);
    reportError(node, new RuleError(message(messageText), { index }));
  };

  const inspectTableSource = (node: GoogleRuleNode, source: string): void => {
    const findings = [
      ...inspectPipeTables(source),
      ...inspectHtmlTableHeaders(source),
      ...inspectTableCaptions(source),
    ];

    for (const finding of findings) {
      reportFinding(node, finding.index, finding.messageText);
    }
  };

  return {
    [Syntax.Paragraph](node) {
      inspectTableSource(node, getSource(node));
    },
    [Syntax.Html](node) {
      inspectTableSource(node, getSource(node));
    },
    [Syntax.HtmlBlock](node) {
      inspectTableSource(node, getSource(node));
    },
    [Syntax.Table](node) {
      inspectTableSource(node, getSource(node));
    },
  };
};

const rule = {
  linter: report,
  fixer: report,
};

export default rule;
