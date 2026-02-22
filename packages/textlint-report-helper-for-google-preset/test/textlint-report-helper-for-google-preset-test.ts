import { describe, expect, it, vi } from "vitest";

vi.mock("textlint-util-to-string", () => {
  class MockStringSource {
    toString(): string {
      return "mapped text";
    }

    originalIndexFromIndex(): number | undefined {
      return undefined;
    }
  }

  return { default: MockStringSource };
});

import {
  paragraphReporter,
  strReporter,
} from "../src/textlint-report-helper-for-google-preset.js";

class MockRuleError extends Error {
  index: number;
  fix?: unknown;

  constructor(message: string, options: { index: number; fix?: unknown }) {
    super(message);
    this.index = options.index;
    this.fix = options.fix;
  }
}

describe("textlint-report-helper-for-google-preset", () => {
  it("reports basic strReporter replacement", () => {
    const fixValue = { command: "replace" };
    const replaceTextRange = vi.fn(() => fixValue);
    const report = vi.fn();

    strReporter({
      node: {
        type: "Str",
        raw: "Bad value",
        range: [0, 9],
      },
      dictionaries: [
        {
          pattern: /Bad/g,
          replace: () => "Good",
          message: () => "Use Good",
        },
      ],
      report,
      RuleError: MockRuleError as unknown as GoogleRuleContext["RuleError"],
      fixer: {
        replaceTextRange,
      } as unknown as GoogleRuleContext["fixer"],
      getSource: () => "Bad value",
    });

    expect(replaceTextRange).toHaveBeenCalledTimes(1);
    expect(replaceTextRange.mock.calls[0]).toEqual([[0, 3], "Good"]);
    expect(report).toHaveBeenCalledTimes(1);
    const [, error] = report.mock.calls[0] as [GoogleRuleNode, MockRuleError];
    expect(error.message).toBe("Use Good");
    expect(error.index).toBe(0);
    expect(error.fix).toBe(fixValue);
  });

  it("skips paragraphReporter match when index mapping fails", () => {
    const replaceTextRange = vi.fn((range: [number, number]) => {
      if (
        range.some((value) => typeof value !== "number" || Number.isNaN(value))
      ) {
        throw new TypeError("invalid fix range");
      }
      return { range };
    });
    const report = vi.fn();

    expect(() => {
      paragraphReporter({
        Syntax: {
          Code: "Code",
          Link: "Link",
          BlockQuote: "BlockQuote",
          Html: "Html",
        },
        node: {
          type: "Paragraph",
          raw: "mapped text",
          range: [0, 11],
          children: [],
        },
        dictionaries: [
          {
            pattern: /mapped/g,
            replace: () => "rewritten",
            message: () => "rewrite it",
          },
        ],
        requireExactMatch: false,
        report,
        RuleError: MockRuleError as unknown as GoogleRuleContext["RuleError"],
        fixer: {
          replaceTextRange,
        } as unknown as GoogleRuleContext["fixer"],
        getSource: () => "mapped text",
      });
    }).not.toThrow();

    expect(report).not.toHaveBeenCalled();
    expect(replaceTextRange).not.toHaveBeenCalled();
  });
});
