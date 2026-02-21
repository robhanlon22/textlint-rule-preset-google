// MIT © 2017 azu
import type { TxtNode, TxtParentNode } from "@textlint/ast-node-types";

interface CheckBoldTextPrecedingColonArgs {
  node: TxtParentNode;
  RuleError: GoogleRuleContext["RuleError"];
  getSource: GoogleRuleContext["getSource"];
  fixer: GoogleRuleContext["fixer"];
  report: GoogleRuleContext["report"];
}

export const checkBoldTextPrecedingColon = ({
  node,
  RuleError,
  getSource,
  fixer,
  report,
}: CheckBoldTextPrecedingColonArgs): void => {
  const getChild = (
    items: TxtParentNode["children"],
    index: number,
  ): TxtNode | undefined => {
    return index >= 0 && index < items.length
      ? (items[index] as TxtNode)
      : undefined;
  };
  const { children } = node;
  const boldNodeList = children.filter(
    (childNode): childNode is TxtParentNode => childNode.type === "Strong",
  );

  boldNodeList.forEach((boldNode) => {
    const currentIndex = children.indexOf(boldNode);
    const nextNodeOfBold = getChild(children, currentIndex + 1);
    if (nextNodeOfBold?.type !== "Str") {
      return;
    }

    const nextNodeValue = getSource(nextNodeOfBold);
    if (!nextNodeValue.startsWith(":")) {
      return;
    }

    // add `:` to current node
    const message = `When the text preceding a colon is bold, make the colon bold too.
https://developers.google.com/style/colons#bold-text-preceding-colon
`;
    const strNodeOfBoldNode = getChild(boldNode.children, 0);
    if (strNodeOfBoldNode?.type !== "Str") {
      return;
    }

    report(
      strNodeOfBoldNode,
      new RuleError(message, {
        index: strNodeOfBoldNode.range[0] - node.range[0],
        fix: fixer.replaceText(
          strNodeOfBoldNode as Parameters<
            GoogleRuleContext["fixer"]["replaceText"]
          >[0],
          `${getSource(strNodeOfBoldNode)}:`,
        ),
      }),
    );

    // remove `:` from next node
    report(
      nextNodeOfBold,
      new RuleError(message, {
        index: 0,
        fix: fixer.removeRange([0, 1]),
      }),
    );
  });
};
