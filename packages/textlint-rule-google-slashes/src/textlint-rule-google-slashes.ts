// MIT © 2017 azu
import { paragraphReporter } from "@textlint-rule/textlint-report-helper-for-google-preset";

const REPLACE_ABBR_DICT = {
    "c/o": "care of",
    "w/": "with",
    "w/o": "without",
};
const report = (context) => {
    const dictionaries = [
        // Slashes with dates => other rule
        {
            pattern: /\b([a-zA-Z-]+)\/([a-zA-Z-]+)\b/g,
            test: ({ captures }) => {
                // ignore abbreviations like "c/w"
                return captures[0].length >= 2 && captures[1].length >= 2;
            },
            message: () => `Don't use slashes to separate alternatives.
https://developers.google.com/style/slashes#slashes-with-alternatives
`,
        },
        // TODO: Slashes with file paths and URLs

        // Slashes with fractions
        // https://developers.google.com/style/slashes#slashes-with-alternatives
        {
            pattern: /\b(\d+)\/(\d+)\b/g,
            message: () => `Don't use slashes with fractions, as they can be ambiguous.
https://developers.google.com/style/slashes#slashes-with-fractions
`,
        },
        // Slashes with abbreviations
        // https://developers.google.com/style/slashes#slashes-with-abbreviations
        {
            pattern: /\b(([a-zA-Z])\/([a-zA-Z]?))\s/g,
            replace: ({ captures }) => {
                const match = captures[0];
                if (!match) {
                    return;
                }
                const replacement = REPLACE_ABBR_DICT[match];
                if (!replacement) {
                    return;
                }
                return `${replacement} `;
            },
            message: () => `Don't use abbreviations that rely on slashes. Instead, spell the words out.
https://developers.google.com/style/slashes#slashes-with-abbreviations
`,
        },
    ];

    const { Syntax, RuleError, getSource, fixer, report } = context;
    return {
        [Syntax.Paragraph](node) {
            return paragraphReporter({
                Syntax,
                node,
                dictionaries,
                report,
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
