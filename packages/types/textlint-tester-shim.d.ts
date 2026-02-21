declare module "textlint-tester" {
  interface TesterValidObject {
    text?: string;
    ext?: string;
    inputPath?: string;
    options?: unknown;
  }

  interface TesterInvalidObject {
    text?: string;
    output?: string;
    ext?: string;
    inputPath?: string;
    options?: unknown;
    errors: Record<string, unknown>[];
  }

  interface TesterRunOptions {
    valid?: (string | TesterValidObject)[];
    invalid?: TesterInvalidObject[];
  }

  export default class TextLintTester {
    run(name: string, rule: GoogleRuleModule, options: TesterRunOptions): void;
  }
}
