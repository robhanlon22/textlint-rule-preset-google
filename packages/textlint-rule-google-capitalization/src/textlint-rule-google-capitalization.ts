// MIT © 2017 azu
import capitalizationRule from "textlint-rule-en-capitalization";
const DocumentURL = "https://developers.google.com/style/capitalization";
const defaultOptions = {
    // allow lower-case words in anywhere
    allowWords: [],
};
const createReporter = (capitalizationReport) => {
    return (context, options = defaultOptions) => {
        const { report } = context;
        const overlayContext = Object.create(context);
        // pass custom context to textlint-rule-en-capitalization
        Object.defineProperty(overlayContext, "report", {
            value: (node, error) => {
                error.message += "\n" + DocumentURL;
                report(node, error);
            },
            enumerable: true,
            configurable: true,
            writable: true,
        });
        return capitalizationReport(overlayContext, options);
    };
};
const rule = {
    linter: createReporter(capitalizationRule.linter),
    fixer: createReporter(capitalizationRule.fixer),
};

export default rule;
