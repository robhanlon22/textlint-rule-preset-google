declare global {
  interface GoogleRuleNode {
    type?: string;
    raw?: string;
    value?: string;
    range: readonly [number, number] | [number, number];
    children?: GoogleRuleNode[];
    parent?: GoogleRuleNode;
    [key: string]: unknown;
  }

  type GoogleRuleContext = Omit<
    import("@textlint/types").TextlintRuleContext,
    "Syntax" | "report" | "getSource"
  > & {
    Syntax: Record<string, string>;
    report(node: GoogleRuleNode, error: unknown): void;
    getSource(
      node?: GoogleRuleNode,
      beforeCount?: number,
      afterCount?: number,
    ): string;
    [key: string]: unknown;
  };

  type GoogleRuleListener = (node: GoogleRuleNode) => void | Promise<void>;

  type GoogleRuleReporter = (
    context: GoogleRuleContext,
    options?: unknown,
  ) => Record<string, GoogleRuleListener | undefined>;

  type GoogleRuleModule =
    | GoogleRuleReporter
    | {
        linter: GoogleRuleReporter;
        fixer: GoogleRuleReporter;
      };

  interface MatchReplaceDictionaryArgs {
    index: number;
    match: string;
    captures: string[];
    all: string;
  }

  interface MatchReplaceDictionary {
    pattern: RegExp;
    test?: (args: MatchReplaceDictionaryArgs) => boolean;
    replace?: (args: MatchReplaceDictionaryArgs) => string | undefined;
    message?: (args: MatchReplaceDictionaryArgs) => string;
  }
}

declare module "textlint-rule-helper" {
  interface RuleHelperInstance {
    getParents(node: GoogleRuleNode): GoogleRuleNode[];
    isChildNode(node: GoogleRuleNode, types: string[]): boolean;
  }

  interface IgnoreNodeManagerInstance {
    isIgnoredIndex(index: number): boolean;
    isIgnoredRange(range: [number, number]): boolean;
    isIgnored(node: { index: number }): boolean;
    ignore(node: GoogleRuleNode): void;
    ignoreRange(range: [number, number]): void;
    ignoreChildrenByTypes(
      targetNode: GoogleRuleNode,
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
    constructor(node: GoogleRuleNode);
    toString(): string;
    originalIndexFromIndex(
      generatedIndex: number,
      isEnd?: boolean,
    ): number | undefined;
    originalPositionFromPosition(
      position: { line: number; column: number },
      isEnd?: boolean,
    ): { line: number; column: number } | undefined;
    originalIndexFromPosition(
      generatedPosition: { line: number; column: number },
      isEnd?: boolean,
    ): number | undefined;
    originalPositionFromIndex(
      generatedIndex: number,
      isEnd?: boolean,
    ): { line: number; column: number } | undefined;
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
