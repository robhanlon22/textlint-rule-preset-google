// MIT © 2017 azu
import TextLintTester from "textlint-tester";
import rule from "../src/textlint-rule-google-tables.js";

const tester = new TextLintTester();
const URL = "https://developers.google.com/style/tables";
const withUrl = (reason: string): string => `${reason}\n${URL}`;

tester.run("textlint-rule-google-tables", rule, {
  valid: [
    `Table 1. Request retry behavior

| Request type | Retry policy |
| --- | --- |
| GET | Retry |`,
    `<table><caption>Table 2. API response codes</caption><tr><th>API name</th><th>HTTP code</th></tr></table>`,
  ],
  invalid: [
    {
      text: `| Request Type | Retry Policy |
| --- | --- |
| GET | Retry |`,
      errors: [
        {
          message: withUrl(
            "Use sentence case for table headers. In tables, headings should use sentence case.",
          ),
        },
        {
          message: withUrl(
            "Use sentence case for table headers. In tables, headings should use sentence case.",
          ),
        },
      ],
    },
    {
      text: `| Request type. | Retry policy? |
| --- | --- |
| GET | Retry |`,
      errors: [
        {
          message: withUrl("Table headers should not end with punctuation."),
        },
        {
          message: withUrl("Table headers should not end with punctuation."),
        },
      ],
    },
    {
      text: "Table 3. Request Retry Matrix",
      errors: [
        {
          message: withUrl("Use sentence case for table captions."),
        },
      ],
    },
    {
      text: `<table><caption>Table 4. Request Retry Matrix</caption><tr><th>Request Type</th><th>Retry policy.</th></tr></table>`,
      errors: [{}, {}, {}],
    },
  ],
});
