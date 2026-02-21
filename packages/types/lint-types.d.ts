import type {
  TxtNode,
  TxtNodeType,
  TxtNodePosition,
} from "@textlint/ast-node-types";
import type {
  TextlintRuleModule,
  TextlintRuleReporter,
} from "@textlint/kernel";

declare global {
  type GoogleRuleContext = Parameters<TextlintRuleReporter>[0];
  type GoogleRuleReporter = TextlintRuleReporter;
  type GoogleRuleModule = TextlintRuleModule;
  type MatchReplaceDictionary =
    import("match-test-replace").TestMatchReplaceReturnDict;
}

declare module "textlint-rule-helper" {
  interface RuleHelperInstance {
    getParents(node: TxtNode): TxtNode[];
    isChildNode(node: TxtNode, types: TxtNodeType[]): boolean;
  }

  interface IgnoreNodeManagerInstance {
    isIgnoredIndex(index: number): boolean;
    isIgnoredRange(range: [number, number]): boolean;
    isIgnored(node: { index: number }): boolean;
    ignore(node: TxtNode): void;
    ignoreRange(range: [number, number]): void;
    ignoreChildrenByTypes(
      targetNode: TxtNode,
      ignoredNodeTypes: string[],
    ): void;
  }

  interface TextlintRuleHelperModule {
    RuleHelper: new (context: GoogleRuleContext) => RuleHelperInstance;
    IgnoreNodeManager: new () => IgnoreNodeManagerInstance;
  }

  const textlintRuleHelper: TextlintRuleHelperModule;
  export default textlintRuleHelper;
}

declare module "textlint-util-to-string" {
  class StringSource {
    constructor(node: TxtNode);
    toString(): string;
    originalIndexFromIndex(generatedIndex: number, isEnd?: boolean): number;
    originalPositionFromPosition(
      position: TxtNodePosition,
      isEnd?: boolean,
    ): TxtNodePosition;
    originalIndexFromPosition(
      generatedPosition: TxtNodePosition,
      isEnd?: boolean,
    ): number;
    originalPositionFromIndex(
      generatedIndex: number,
      isEnd?: boolean,
    ): TxtNodePosition;
  }

  export { StringSource };
  export default StringSource;
}

declare module "textlint-rule-en-capitalization" {
  interface CapitalizationOptions {
    allowHeading?: boolean;
    allowFigures?: boolean;
    allowLists?: boolean;
    allowWords?: string[];
  }

  const rule: {
    linter: (
      context: GoogleRuleContext,
      options?: CapitalizationOptions,
    ) => ReturnType<GoogleRuleReporter>;
    fixer: (
      context: GoogleRuleContext,
      options?: CapitalizationOptions,
    ) => ReturnType<GoogleRuleReporter>;
  };

  export default rule;
}

declare module "textlint-rule-no-exclamation-question-mark" {
  interface NoExclamationQuestionMarkOptions {
    allowHalfWidthExclamation?: boolean;
    allowFullWidthExclamation?: boolean;
    allowHalfWidthQuestion?: boolean;
    allowFullWidthQuestion?: boolean;
  }

  const reporter: (
    context: GoogleRuleContext,
    options?: NoExclamationQuestionMarkOptions,
  ) => ReturnType<GoogleRuleReporter>;

  export default reporter;
}

declare module "nlcst-to-string" {
  export default function toString(node: unknown): string;
}

declare module "unist-util-find" {
  interface UnistNode {
    type: string;
    [key: string]: unknown;
  }

  export default function findUnistNode(
    node: UnistNode,
    test: (node: UnistNode) => boolean,
  ): UnistNode | undefined;
}

declare module "cheerio-httpcli" {
  import type { CheerioAPI } from "cheerio";

  interface FetchResult {
    $: CheerioAPI;
  }

  const client: {
    fetch(url: string): Promise<FetchResult>;
  };

  export default client;
}

export {};
