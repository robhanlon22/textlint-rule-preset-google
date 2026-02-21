// MIT © 2017 azu
import capitalizationRule from "textlint-rule-en-capitalization";

const DocumentURL = "https://developers.google.com/style/capitalization";

interface CapitalizationOptions {
  allowHeading?: boolean;
  allowFigures?: boolean;
  allowLists?: boolean;
  allowWords?: string[];
}

type CapitalizationReporter = (
  context: GoogleRuleContext,
  options?: CapitalizationOptions,
) => ReturnType<GoogleRuleReporter>;

const typedCapitalizationRule = capitalizationRule as unknown as {
  linter: CapitalizationReporter;
  fixer: CapitalizationReporter;
};

const defaultOptions: CapitalizationOptions = {
  // allow lower-case words in anywhere
  allowWords: [],
};

const createReporter =
  (capitalizationReport: CapitalizationReporter): CapitalizationReporter =>
  (context, options = defaultOptions) => {
    const baseReport: GoogleRuleContext["report"] = (node, error) => {
      context.report(node, error);
    };
    const overlayContext = Object.create(context) as GoogleRuleContext;
    Object.defineProperty(overlayContext, "report", {
      value(
        node: Parameters<GoogleRuleContext["report"]>[0],
        error: Parameters<GoogleRuleContext["report"]>[1],
      ) {
        const errorWithMessage = error as { message: string };
        errorWithMessage.message += `\n${DocumentURL}`;
        baseReport(node, error);
      },
      enumerable: true,
      configurable: true,
      writable: true,
    });

    return capitalizationReport(overlayContext, options);
  };

const rule: GoogleRuleModule = {
  linter: createReporter(typedCapitalizationRule.linter) as GoogleRuleReporter,
  fixer: createReporter(typedCapitalizationRule.fixer) as GoogleRuleReporter,
};

export default rule;
