// MIT © 2017 azu

import textlintRuleHelper from "textlint-rule-helper";
import StringSourceModule from "textlint-util-to-string";

const { RuleHelper, IgnoreNodeManager } = textlintRuleHelper as any;
const StringSource = (StringSourceModule as any).StringSource || StringSourceModule;
const DocumentURL = "https://developers.google.com/style/sentence-spacing";
const report = (context) => {
    const { Syntax, RuleError, fixer, report } = context;
    const helper = new RuleHelper(context);
    // Ignore following pattern
    // Paragraph > Link Code Html ...
    return {
        [Syntax.Paragraph](node) {
            if (helper.isChildNode(node, [Syntax.Image, Syntax.BlockQuote, Syntax.Emphasis])) {
                return;
            }
            const ignoreNodeManager = new IgnoreNodeManager();
            ignoreNodeManager.ignoreChildrenByTypes(node, [Syntax.Code, Syntax.Link, Syntax.BlockQuote, Syntax.Html]);
            const source = new StringSource(node);
            const sourceText = source.toString();
            /**
             * @type {[{index:number,indent:number]}
             */
            const spaces = [];
            const sentenceSpacingPattern = /[.!?]( {2,})(?=\S)/g;
            let sentenceSpacingMatch;
            while ((sentenceSpacingMatch = sentenceSpacingPattern.exec(sourceText)) !== null) {
                spaces.push({
                    index: sentenceSpacingMatch.index + 1,
                    indent: sentenceSpacingMatch[1].length,
                });
            }

            // Report based on space
            spaces
                .filter((space) => space.indent >= 2)
                .forEach((space) => {
                    const originalIndex = source.originalIndexFromIndex(space.index);
                    // if the error is ignored, don't report
                    if (ignoreNodeManager.isIgnoredIndex(originalIndex)) {
                        return;
                    }
                    const message = `Leave only one space between sentences. Number of space: ${space.indent}
${DocumentURL}`;
                    report(
                        node,
                        new RuleError(message, {
                            index: originalIndex,
                            fix: fixer.replaceTextRange([originalIndex, originalIndex + space.indent], " "),
                        }),
                    );
                });
        },
    };
};
const rule = {
    linter: report,
    fixer: report,
};

export default rule;
