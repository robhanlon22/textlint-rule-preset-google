# @textlint-rule/textlint-rule-google-tables

Reference: [Tables | Google Developer Documentation Style Guide | Google Developers](https://developers.google.com/style/tables)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint-rule/textlint-rule-google-tables

## Usage

Via `.textlintrc` (Recommended)

```json
{
  "rules": {
    "@textlint-rule/google-tables": true
  }
}
```

Via CLI

```sh
textlint --rule @textlint-rule/google-tables README.md
```

## What this rule checks

- sentence-case table headers in Markdown pipe tables and HTML `<th>` cells
- sentence-case table captions (`Table N ...` and HTML `<caption>`)
- no terminal punctuation at the end of table header cells
- no terminal period at the end of table captions

Sentence-case checks are heuristic and report-only (no auto-fix).

## License

MIT © azu
