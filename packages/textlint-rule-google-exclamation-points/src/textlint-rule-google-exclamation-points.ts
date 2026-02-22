// MIT © 2017 azu
import noExclamationQuestionMark from "textlint-rule-no-exclamation-question-mark";

interface ExclamationOptions {
  allowHalfWidthExclamation?: boolean;
  allowFullWidthExclamation?: boolean;
  allowHalfWidthQuestion?: boolean;
  allowFullWidthQuestion?: boolean;
}

type ExclamationReporter = (
  context: GoogleRuleContext,
  options?: ExclamationOptions,
) => ReturnType<GoogleRuleReporter>;

const noExclamationQuestionMarkReporter =
  noExclamationQuestionMark as unknown as ExclamationReporter;

const defaultOptions: ExclamationOptions = {
  // allow to use !
  allowHalfWidthExclamation: false,
  // allow to use ！
  allowFullWidthExclamation: false,
  // allow to use ?
  allowHalfWidthQuestion: true,
  // allow to use ？
  allowFullWidthQuestion: true,
};

const isExclamationOptions = (value: unknown): value is ExclamationOptions => {
  return typeof value === "object" && value !== null;
};

const linter: GoogleRuleReporter = (context, options) => {
  const optionOverrides: ExclamationOptions = isExclamationOptions(options)
    ? options
    : {};
  const mergedOptions: ExclamationOptions = {
    ...defaultOptions,
    ...optionOverrides,
  };
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
      errorWithMessage.message +=
        "\nhttps://developers.google.com/style/exclamation-points";
      baseReport(node, error);
    },
    enumerable: true,
    configurable: true,
    writable: true,
  });

  return noExclamationQuestionMarkReporter(
    overlayContext,
    mergedOptions as ExclamationOptions | undefined,
  );
};

export default linter;
