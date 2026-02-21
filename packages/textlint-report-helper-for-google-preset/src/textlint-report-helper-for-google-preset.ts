// MIT © 2017 azu
import {
  matchTestReplace,
  type TestMatchReplaceReturnDict,
} from "match-test-replace";
import type { ASTNodeTypes, TxtNode } from "@textlint/ast-node-types";
import textlintRuleHelper from "textlint-rule-helper";
import StringSourceModule from "textlint-util-to-string";

const { RuleHelper, IgnoreNodeManager } = textlintRuleHelper;

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

type RuleErrorCtor = GoogleRuleContext["RuleError"];
type RuleFixer = GoogleRuleContext["fixer"];
type ReportFunction = GoogleRuleContext["report"];
type GetSourceFunction = GoogleRuleContext["getSource"];

export {
  getPos,
  getPosFromSingleWord,
  PosType,
  isSameGroupPosType,
} from "./en-pos-util.js";

export const shouldIgnoreNodeOfStrNode = (
  node: TxtNode,
  context: GoogleRuleContext,
): boolean => {
  const helper = new RuleHelper(context);
  const { Syntax } = context;
  return helper.isChildNode(node, [
    Syntax.Link,
    Syntax.Image,
    Syntax.BlockQuote,
    Syntax.Emphasis,
  ]);
};

export interface StrReporterArgs {
  node: TxtNode;
  dictionaries: TestMatchReplaceReturnDict[];
  report: ReportFunction;
  RuleError: RuleErrorCtor;
  fixer: RuleFixer;
  getSource: GetSourceFunction;
}

export const strReporter = ({
  node,
  dictionaries,
  report,
  RuleError,
  fixer,
  getSource,
}: StrReporterArgs): void => {
  const text = getSource(node);
  dictionaries.forEach((dict) => {
    const matchTestReplaceReturn = matchTestReplace(text, dict);
    if (!matchTestReplaceReturn.ok) {
      return;
    }
    matchTestReplaceReturn.results.forEach((result) => {
      const index = result.index;
      const message = result.message ?? "";
      if (!result.replace) {
        report(
          node,
          new RuleError(message, {
            index,
          }),
        );
        return;
      }
      const endIndex = result.index + result.match.length;
      const range: [number, number] = [index, endIndex];
      report(
        node,
        new RuleError(message, {
          index,
          fix: fixer.replaceTextRange(range, result.replace),
        }),
      );
    });
  });
};

export interface ParagraphReporterArgs {
  Syntax: typeof ASTNodeTypes;
  node: TxtNode;
  dictionaries: TestMatchReplaceReturnDict[];
  report: ReportFunction;
  RuleError: RuleErrorCtor;
  fixer: RuleFixer;
  getSource: GetSourceFunction;
}

export const paragraphReporter = ({
  Syntax,
  node,
  dictionaries,
  getSource,
  report,
  RuleError,
  fixer,
}: ParagraphReporterArgs): void => {
  const originalText = getSource(node);
  const source = new TypedStringSource(node);
  const text = source.toString();
  const ignoreNodeManager = new IgnoreNodeManager();
  // Ignore following pattern
  // Paragraph > Link Code Html ...
  ignoreNodeManager.ignoreChildrenByTypes(node, [
    Syntax.Code,
    Syntax.Link,
    Syntax.BlockQuote,
    Syntax.Html,
  ]);
  dictionaries.forEach((dict) => {
    const matchTestReplaceReturn = matchTestReplace(text, dict);
    if (!matchTestReplaceReturn.ok) {
      return;
    }
    matchTestReplaceReturn.results.forEach((result) => {
      // relative index
      const indexFromNode = source.originalIndexFromIndex(result.index);
      const endIndexFromNode = source.originalIndexFromIndex(
        result.index + result.match.length,
      );
      const rangeFromNode: [number, number] = [indexFromNode, endIndexFromNode];
      // absolute index
      const absoluteRange: [number, number] = [
        node.range[0] + rangeFromNode[0],
        node.range[1] + rangeFromNode[1],
      ];
      // if the error is ignored, don't report
      if (ignoreNodeManager.isIgnoredIndex(absoluteRange[0])) {
        return;
      }
      const message = result.message ?? "";
      if (!result.replace) {
        report(
          node,
          new RuleError(message, {
            index: indexFromNode,
          }),
        );
        return;
      }
      const beforeText = originalText.slice(indexFromNode, endIndexFromNode);
      if (beforeText !== result.match) {
        report(
          node,
          new RuleError(message, {
            index: indexFromNode,
          }),
        );
        return;
      }
      report(
        node,
        new RuleError(message, {
          index: indexFromNode,
          fix: fixer.replaceTextRange(rangeFromNode, result.replace),
        }),
      );
    });
  });
};
