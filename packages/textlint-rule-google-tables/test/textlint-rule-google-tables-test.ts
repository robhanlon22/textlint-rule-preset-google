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
    `Table Request retry behavior

| Request type | Retry policy |
| --- | --- |
| GET | Retry |`,
    `<table><caption>Table 2. API response codes</caption><tr><th>API name</th><th>HTTP code</th></tr></table>`,
    "Table 3. Request Retry Matrix",
    "For details, see Table 3. Request Retry Matrix in the appendix.",
  ],
  invalid: [
    {
      text: `Intro paragraph.

| Request Type | Retry Policy |
| --- | --- |
| GET | Retry |`,
      errors: [
        {
          message: withUrl(
            "Use sentence case for table headers. In tables, headings should use sentence case.",
          ),
          index: 20,
        },
        {
          message: withUrl(
            "Use sentence case for table headers. In tables, headings should use sentence case.",
          ),
          index: 35,
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
      text: `| Request type… | Retry policy |
| --- | --- |
| GET | Retry |`,
      errors: [
        {
          message: withUrl("Table headers should not end with punctuation."),
        },
      ],
    },
    {
      text: `Table 4. Request Retry Matrix

| Request type | Retry policy |
| --- | --- |
| GET | Retry |`,
      errors: [
        {
          message: withUrl("Use sentence case for table captions."),
          index: 0,
        },
      ],
    },
    {
      text: `Table 6. Request retry behavior.

| Request type | Retry policy |
| --- | --- |
| GET | Retry |`,
      errors: [
        {
          message: withUrl("Table captions should not end with a period."),
          index: 0,
        },
      ],
    },
    {
      text: `<table><caption>Table 5. Request Retry Matrix</caption><tr><th>Request Type</th><th>Retry policy.</th></tr></table>`,
      errors: [{}, {}, {}],
    },
    {
      text: `<table><caption>Table 7. Request retry behavior.</caption><tr><th>Request type</th><th>Retry policy</th></tr></table>`,
      errors: [
        {
          message: withUrl("Table captions should not end with a period."),
        },
      ],
    },
  ],
});
