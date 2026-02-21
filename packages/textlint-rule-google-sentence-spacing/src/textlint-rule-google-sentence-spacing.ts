// MIT © 2017 azu

import textlintRuleHelper from "textlint-rule-helper";
import StringSourceModule from "textlint-util-to-string";
import type { TxtNode } from "@textlint/ast-node-types";

const { RuleHelper, IgnoreNodeManager } = textlintRuleHelper;
const DocumentURL = "https://developers.google.com/style/sentence-spacing";

interface StringSourceLike {
  toString(): string;
  originalIndexFromIndex(index: number): number;
}
type StringSourceConstructor = new (node: TxtNode) => StringSourceLike;
const StringSourceValue = StringSourceModule as unknown as
  | { StringSource?: StringSourceConstructor }
  | StringSourceConstructor;
const TypedStringSource: StringSourceConstructor =
  typeof StringSourceValue === "function"
    ? StringSourceValue
    : (() => {
        const stringSource = StringSourceValue.StringSource;
        if (!stringSource) {
          throw new TypeError("StringSource constructor is missing");
        }
        return stringSource;
      })();

interface SentenceSpacing {
  index: number;
  indent: number;
}

const report: GoogleRuleReporter = (context) => {
  const { Syntax, RuleError, fixer, report } = context;
  const helper = new RuleHelper(context);
  // Ignore following pattern
  // Paragraph > Link Code Html ...
  return {
    [Syntax.Paragraph](node) {
      if (
        helper.isChildNode(node, [
          Syntax.Image,
          Syntax.BlockQuote,
          Syntax.Emphasis,
        ])
      ) {
        return;
      }
      const ignoreNodeManager = new IgnoreNodeManager();
      ignoreNodeManager.ignoreChildrenByTypes(node, [
        Syntax.Code,
        Syntax.Link,
        Syntax.BlockQuote,
        Syntax.Html,
      ]);
      const source = new TypedStringSource(node);
      const sourceText = source.toString();
      const spaces: SentenceSpacing[] = [];
      const sentenceSpacingPattern = /[.!?]( {2,})(?=\S)/g;
      let sentenceSpacingMatch: RegExpExecArray | null;
      while (
        (sentenceSpacingMatch = sentenceSpacingPattern.exec(sourceText)) !==
        null
      ) {
        spaces.push({
          index: sentenceSpacingMatch.index + 1,
          indent: sentenceSpacingMatch[1].length,
        });
      }

      // Report based on space
      spaces
        .filter((space) => space.indent >= 2)
        .forEach((space) => {
          const originalIndex = source.originalIndexFromIndex(space.index);
          // if the error is ignored, don't report
          if (ignoreNodeManager.isIgnoredIndex(originalIndex)) {
            return;
          }
          const message = `Leave only one space between sentences. Number of space: ${String(space.indent)}
${DocumentURL}`;
          report(
            node,
            new RuleError(message, {
              index: originalIndex,
              fix: fixer.replaceTextRange(
                [originalIndex, originalIndex + space.indent],
                " ",
              ),
            }),
          );
        });
    },
  };
};

const rule = {
  linter: report,
  fixer: report,
};

export default rule;
