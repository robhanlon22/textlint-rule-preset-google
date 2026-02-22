// MIT © 2017 azu
import {
  bindRuleContext,
  strReporter,
  getPos,
  PosType,
} from "@textlint-rule/textlint-report-helper-for-google-preset";
import type { TextlintRuleContext } from "@textlint/types";
import textlintRuleHelper from "textlint-rule-helper";

const { RuleHelper } = textlintRuleHelper;
const DocumentURL = "https://developers.google.com/style/dashes";

const report: GoogleRuleReporter = (context) => {
  const {
    Syntax,
    RuleError,
    fixer,
    getSource,
    report: reportError,
  } = bindRuleContext(context);
  // Notes: the order is important when Apply fixes
  const dictionaries: MatchReplaceDictionary[] = [
    {
      // Prefer colon to dash.
      // Partial support:
      // use colon instead of dash or hyphen
      pattern: /((?:^.* )?(\w+)) ([—-]) ((\w+) .*)$/,
      test: ({ all, captures }) => {
        const dashes = captures[2];
        const afterText = captures[3];
        // OK:
        // The food — which was delicious — reminded me of home.
        if (afterText.includes(dashes)) {
          return false;
        }
        const afterWord = captures[4];
        const afterWordPos = getPos(all, afterWord);
        // example - This is a example
        //           ^^^^
        if (
          !(
            afterWordPos === PosType.WhDeterminer ||
            afterWordPos === PosType.WhPronoun ||
            afterWordPos === PosType.Determiner
          )
        ) {
          return false;
        }
        const pos = getPos(all, captures[1]);
        return pos === PosType.Noun;
      },
      message: () =>
        "Use colons(:) instead of dashes(-) in lists" + "\n" + DocumentURL,
    },
    {
      // use "—"(em dash) instead of " - "(hyphen)
      // Notes: Allow to use hyphen for Ranges of numbers
      // https://developers.google.com/style/numbers#ranges-of-numbers
      // Section-style headings like "Appendix A - ..." should use a colon.
      pattern: /^([A-Z][A-Za-z0-9]+ [A-Z0-9]+) [—-] ([A-Z].*)$/,
      replace: ({ captures }) => `${captures[0]}: ${captures[1]}`,
      message: () =>
        "Use colons(:) instead of dashes(-) in lists" + "\n" + DocumentURL,
    },
    {
      // use "—"(em dash) instead of " - "(hyphen)
      // Notes: Allow to use hyphen for Ranges of numbers
      // https://developers.google.com/style/numbers#ranges-of-numbers
      pattern: /([a-zA-Z]+) - ([a-zA-Z]+)/g,
      test: ({ all }) => {
        return !/^[A-Z][A-Za-z0-9]+ [A-Z0-9]+ [—-] [A-Z]/.test(all);
      },
      message: () =>
        'Use "—"(em dash) instead of " - "(hyphen)' + "\n" + DocumentURL,
    },
  ];

  const helper = new RuleHelper(
    context as unknown as Readonly<TextlintRuleContext>,
  );
  return {
    [Syntax.Str](node) {
      if (
        helper.isChildNode(
          node as unknown as Parameters<typeof helper.isChildNode>[0],
          [Syntax.Link, Syntax.Image, Syntax.BlockQuote, Syntax.Emphasis],
        )
      ) {
        return;
      }
      // use colon instead of dash or hyphen can't work on Paragraph
      // Because, replace `code` with wrong range...
      // Temporary, we use strReporter
      strReporter({
        node,
        dictionaries,
        report: reportError,
        getSource,
        RuleError,
        fixer,
      });
    },
  };
};

const rule = {
  linter: report,
  fixer: report,
};

export default rule;
