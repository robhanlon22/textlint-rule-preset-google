// MIT © 2017 azu

interface CheckBoldTextPrecedingColonArgs {
  node: GoogleRuleNode;
  RuleError: GoogleRuleContext["RuleError"];
  getSource: GoogleRuleContext["getSource"];
  fixer: GoogleRuleContext["fixer"];
  report: GoogleRuleContext["report"];
}

type ReplaceTextTarget = Parameters<
  GoogleRuleContext["fixer"]["replaceText"]
>[0];

export const checkBoldTextPrecedingColon = ({
  node,
  RuleError,
  getSource,
  fixer,
  report,
}: CheckBoldTextPrecedingColonArgs): void => {
  const isGoogleRuleNode = (value: unknown): value is GoogleRuleNode => {
    return typeof value === "object" && value !== null && "range" in value;
  };

  const getChild = (
    items: readonly unknown[],
    index: number,
  ): GoogleRuleNode | undefined => {
    if (index < 0 || index >= items.length) {
      return undefined;
    }
    const item = items[index];
    return isGoogleRuleNode(item) ? item : undefined;
  };

  const getChildren = (value: unknown): GoogleRuleNode[] => {
    if (!isGoogleRuleNode(value) || !Array.isArray(value.children)) {
      return [];
    }
    return value.children.filter(isGoogleRuleNode);
  };

  const isStrongNode = (
    childNode: GoogleRuleNode | undefined,
  ): childNode is GoogleRuleNode => {
    return childNode?.type === "Strong";
  };

  const isStrNode = (
    childNode: GoogleRuleNode | undefined,
  ): childNode is GoogleRuleNode & { type: "Str"; value: string } => {
    return childNode?.type === "Str" && typeof childNode.value === "string";
  };

  const children = getChildren(node);
  const boldNodeList = children.filter(isStrongNode);

  boldNodeList.forEach((boldNode) => {
    const currentIndex = children.indexOf(boldNode);
    const nextNodeOfBold = getChild(children, currentIndex + 1);
    if (!isStrNode(nextNodeOfBold)) {
      return;
    }

    if (!nextNodeOfBold.value.startsWith(":")) {
      return;
    }

    // add `:` to current node
    const message = `When the text preceding a colon is bold, make the colon bold too.
https://developers.google.com/style/colons#bold-text-preceding-colon
`;
    const strNodeOfBoldNode = getChild(getChildren(boldNode), 0);
    if (!isStrNode(strNodeOfBoldNode)) {
      return;
    }

    const replaceTarget = strNodeOfBoldNode as unknown as ReplaceTextTarget;
    report(
      strNodeOfBoldNode,
      new RuleError(message, {
        index: strNodeOfBoldNode.range[0] - node.range[0],
        fix: fixer.replaceText(
          replaceTarget,
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
